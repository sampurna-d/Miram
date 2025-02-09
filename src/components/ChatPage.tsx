import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, limit } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Send, ArrowLeft, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";
import { Match } from '../types/match';
import { UserProfile } from '../types/user';
import { calculateAge } from '../utils/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { BITMOJI_THRESHOLD } from '../constants/app';
import { Skeleton } from "./ui/skeleton";
import { useAvatar } from '../contexts/AvatarContext';
import { CupidAI } from './CupidAI';

/**
 * Interface for chat message structure
 */
interface Message {
  id: string;
  matchId: string;
  senderId: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
}

// Lazy load the ChatBackground for better performance
const ChatBackground = React.lazy(() => import('./ChatBackground'));

/**
 * ChatPage Component
 * 
 * Renders a chat interface between matched users with features like:
 * - Real-time messaging
 * - Progressive avatar reveal
 * - Dynamic background morphing
 * - User profile viewing
 * 
 * @component
 */
export default function ChatPage(): JSX.Element {
  // State and hooks
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showAvatar, setShowAvatar] = useState(true);
  const { setMessageCount: avatarContextSetMessageCount } = useAvatar();

  // Refs for DOM manipulation
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Fetch match data and set up real-time message listener
   */
  useEffect(() => {
    let unsubscribeMessages: (() => void) | undefined;
    
    const fetchData = async () => {
      if (!matchId || !auth.currentUser) return;

      try {
        // Fetch match and user data in parallel for better performance
        const [matchDoc, messagesQuery] = await Promise.all([
          getDoc(doc(db, 'matches', matchId)),
          query(
            collection(db, 'messages'),
            where('matchId', '==', matchId),
            orderBy('timestamp', 'asc')
          )
        ]);

        if (!matchDoc.exists()) {
          navigate('/matches');
          return;
        }

        const matchData = matchDoc.data();
        const otherUserId = matchData.users.find((id: string) => id !== auth.currentUser?.uid);

        if (otherUserId) {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            setMatch({
              id: matchDoc.id,
              name: `${userData.firstName} ${userData.lastName}`,
              photoURL: userData.profilePicture || '/placeholder.svg',
              avatar: userData.avatar || '/placeholder.svg',
              age: calculateAge(userData.dateOfBirth.toDate()),
              interests: userData.interests || [],
              bio: userData.bio || '',
              location: userData.location || '',
              users: matchData.users,
              createdAt: matchData.createdAt,
              lastActivity: matchData.lastActivity
            } as Match);
          }
        }

        // Set up real-time message listener
        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const newMessages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Message[];
          setMessages(newMessages);
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading chat:', error);
        setIsLoading(false);
      }
    };

    fetchData();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [matchId, navigate]);

  /**
   * Auto-scroll to bottom when new messages arrive
   */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * Update avatar display based on message count
   */
  useEffect(() => {
    setShowAvatar(messages.length <= BITMOJI_THRESHOLD);
  }, [messages.length]);

  /**
   * Update message count in avatar context
   */
  useEffect(() => {
    setMessageCount(messages.length);
    avatarContextSetMessageCount(messages.length);
  }, [messages.length, avatarContextSetMessageCount]);

  /**
   * Send a new message
   */
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !matchId || !auth.currentUser) return;

    try {
      const messageData = {
        matchId: matchId,
        senderId: auth.currentUser.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false
      };
      
      await addDoc(collection(db, 'messages'), messageData);
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  /**
   * Format message timestamp for display
   */
  const formatMessageDate = (timestamp: any): string => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  /**
   * Determine if timestamp should be shown for a message
   */
  const shouldShowTimestamp = (message: Message, index: number): boolean => {
    if (selectedMessageId === message.id) return true;
    if (index === 0) return true;
    
    const currentTime = message.timestamp?.toDate();
    const prevTime = messages[index - 1].timestamp?.toDate();
    
    if (!currentTime || !prevTime) return false;
    
    // Show timestamp if messages are more than 5 minutes apart
    return (currentTime.getTime() - prevTime.getTime()) > 5 * 60 * 1000;
  };

  /**
   * Determine if avatar should be shown for a message
   */
  const shouldShowAvatar = (messageIndex: number): boolean => {
    const previousMessages = messages
      .slice(0, messageIndex + 1)
      .filter(m => m.senderId === messages[messageIndex].senderId);
    
    return previousMessages.length <= BITMOJI_THRESHOLD;
  };

  /**
   * Get the appropriate display picture based on message count
   */
  const getDisplayPicture = (): string => {
    return showAvatar 
      ? (match?.avatar || '/placeholder.svg')
      : (match?.photoURL || '/placeholder.svg');
  };

  /**
   * Handle Cupid AI messages
   */
  const handleCupidMessage = (message: string): void => {
    console.log('Cupid says:', message);
  };

  if (isLoading) {
    return <ChatPageSkeleton />;
  }

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <CupidAI onMessage={handleCupidMessage} />
      <Suspense fallback={null}>
        <ChatBackground chatCount={messages.length} />
      </Suspense>
      {/* Chat Header */}
      <div className="p-4 border-b border-pink-100 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-pink-100"
              onClick={() => navigate('/matches')}
            >
              <ArrowLeft className="h-5 w-5 text-pink-600" />
            </Button>
            <div 
              className="flex items-center space-x-4 cursor-pointer"
              onClick={() => setIsUserInfoOpen(true)}
            >
              <Avatar className="h-12 w-12 border-2 border-pink-200">
                <AvatarImage src={getDisplayPicture()} />
                <AvatarFallback className="bg-pink-100 text-pink-700">
                  {match?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  {match?.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Online
                  </span>
                  <span>•</span>
                  <span>{match?.age} years old</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-pink-100">
              <Phone className="h-5 w-5 text-pink-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <ScrollArea className="flex-1 p-4 pb-32">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500">
              <p className="text-center">No messages yet.<br />Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={message.id} className="flex flex-col space-y-1 px-2">
                {shouldShowTimestamp(message, index) && (
                  <div className="flex justify-center my-2">
                    <span className="text-xs text-gray-500 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                      {formatMessageDate(message.timestamp)}
                    </span>
                  </div>
                )}
                <div className={cn("flex", message.senderId === auth.currentUser?.uid ? "justify-end" : "justify-start")}>
                  {message.senderId !== auth.currentUser?.uid && (
                    <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
                      <AvatarImage 
                        src={shouldShowAvatar(index) ? match?.avatar : match?.photoURL} 
                        alt={match?.name} 
                      />
                      <AvatarFallback>{match?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    onClick={() => setSelectedMessageId(
                      selectedMessageId === message.id ? null : message.id
                    )}
                    className={cn(
                      "max-w-[70%] p-3 rounded-2xl cursor-pointer transition-all",
                      message.senderId === auth.currentUser?.uid
                        ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-tr-none hover:bg-gradient-to-r hover:from-pink-600 hover:to-purple-600"
                        : "bg-white/80 backdrop-blur-sm text-gray-800 rounded-tl-none hover:bg-white"
                    )}
                  >
                    <p>{message.text}</p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Fixed Chat Input */}
      <div className="fixed z-50 bottom-14 left-0 right-0 p-4 border-t border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="pr-12 rounded-xl border-pink-200 focus:border-pink-500 focus:ring-pink-500 bg-white/80"
                ref={inputRef}
              />
              <button
                type="button"
                className="absolute right-3 bottom-2 text-pink-400 hover:text-pink-600"
                onClick={() => {/* Add emoji picker here */}}
              >
                😊
              </button>
            </div>
            <Button 
              type="submit"
              size="icon"
              className="h-10 w-10 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 group"
            >
              <Send className="h-4 w-4 text-white group-hover:scale-110 transition-transform" />
            </Button>
          </form>
        </div>
      </div>

      {/* User Info Dialog */}
      <Dialog open={isUserInfoOpen} onOpenChange={setIsUserInfoOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-pink-50 to-purple-50">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
              Profile Information
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 p-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 border-4 border-pink-200">
                <AvatarImage src={getDisplayPicture()} />
                <AvatarFallback className="bg-pink-100 text-pink-700 text-2xl">
                  {match?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <h3 className="mt-4 text-2xl font-semibold">{match?.name}</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-5 w-5 text-pink-500" />
                <span>{match?.age} years old</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-5 w-5 text-pink-500" />
                <span>{match?.location || 'Location not specified'}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Bio</h4>
                <p className="text-gray-600">{match?.bio || 'No bio available'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {match?.interests?.map((interest, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-600"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * Loading skeleton for ChatPage
 */
function ChatPageSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50">
      <div className="p-4 border-b border-pink-100 bg-white/50">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
      <div className="flex-1 p-4">
        <Skeleton className="h-20 w-3/4 rounded-xl mb-4" />
        <Skeleton className="h-20 w-2/3 rounded-xl" />
      </div>
    </div>
  );
} 