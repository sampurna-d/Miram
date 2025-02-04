import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
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

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  isRead?: boolean;
}

export default function ChatPage() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!matchId || !auth.currentUser) return;

      const matchDoc = await getDoc(doc(db, 'matches', matchId));
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
            ...matchData,
            id: matchDoc.id,
            name: `${userData.firstName} ${userData.lastName}`,
            photoURL: userData.profilePicture || '/placeholder.svg',
            age: calculateAge(userData.dateOfBirth.toDate()),
          } as Match);
        }
      }

    };

    fetchMatch();
  }, [matchId, navigate]);

  useEffect(() => {
    if (!matchId) return;

    const q = query(
      collection(db, 'messages'),
      where('matchId', '==', matchId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !match || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        matchId: match.id,
        senderId: auth.currentUser.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        isRead: false,
      });
      setNewMessage('');
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatMessageDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const shouldShowDate = (message: Message, index: number) => {
    if (index === 0) return true;
    
    const currentDate = message.timestamp?.toDate();
    const prevDate = messages[index - 1].timestamp?.toDate();
    
    if (!currentDate || !prevDate) return false;
    
    return currentDate.getTime() - prevDate.getTime() > 5 * 60 * 1000; // Show time if more than 5 minutes apart
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-pink-50 to-purple-50">
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
                <AvatarImage src={match?.photoURL} />
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
      <ScrollArea className="flex-1 p-4 pb-24">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div key={message.id} className="space-y-2">
              {shouldShowDate(message, index) && (
                <div className="flex justify-center">
                  <span className="text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full">
                    {formatMessageDate(message.timestamp)}
                  </span>
                </div>
              )}
              <div
                className={`flex ${
                  message.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.senderId !== auth.currentUser?.uid && (
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarImage src={match?.photoURL} />
                    <AvatarFallback className="bg-pink-100 text-pink-700">
                      {match?.name?.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  onClick={() => setSelectedMessageId(selectedMessageId === message.id ? null : message.id)}
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
          ))}
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
                <AvatarImage src={match?.photoURL} />
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