import React, { useState, useEffect, useRef } from 'react';
import { collection, query, where, getDocs, orderBy, getDoc, doc as firestoreDoc, addDoc, serverTimestamp, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Search, Send, UserX, MessageSquare, ChevronDown, ChevronUp, MapPin, MessageCircle, MoreVertical, User, Shield, Flag } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card, CardContent } from "./ui/card"
import { ScrollArea } from "./ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from "./ui/popover"
import Confetti from 'react-confetti';
import { cn } from "../lib/utils";
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

interface Match {
  id: string;
  name: string;
  photoURL: string;
  lastMessage?: string;
  age?: number;
  location?: string;
  interests?: string[];
  bio?: string;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
}

interface UserData {
  firstName: string;
  lastName: string;
  profilePicUrl?: string;
  age?: number;
  interests?: string[];
  bio?: string;
}

const inspirationalMessages = [
  "Love is not about finding the right person, but creating a right relationship.",
  "The best and most beautiful things in this world cannot be seen or even heard, but must be felt with the heart.",
  "To love and be loved is to feel the sun from both sides.",
  "Love is composed of a single soul inhabiting two bodies.",
  "The greatest happiness of life is the conviction that we are loved.",
];

// Define two paths (circle & heart) with identical/compatible command lengths if possible.
// For simplicity, we do a naive string interpolation. In real usage, ensure matching commands or use an SVG morphing tool.
const circlePath = "M50,50 m-40,0 a40,40 0 1,0 80,0 a40,40 0 1,0 -80,0";
const heartPath  = "M50,30 C23,30 10,55 10,70 C10,85 25,95 40,95 C50,95 50,90 50,90 C50,90 50,95 60,95 C75,95 90,85 90,70 C90,55 77,30 50,30";

// If you want to do a purely naive interpolation, you can do advanced logic here.
// For a quick approach, returning one path or the other based on progress might be fine.
// Or just do a basic partial interpolation approach:
const morphPath = (progress: number) => {
  if (progress <= 0) return circlePath;
  if (progress >= 1) return heartPath;
  // Here, you could do partial morphing logic or just fade between the two.
  // For a smoother experience, you normally need matching path commands. 
  // We'll do a simple "hard" transition near the end as a demonstration:
  return progress < 0.99 ? circlePath : heartPath;
};

export default function MatchesPage() {
  const location = useLocation();
  const [match, setMatch] = useState<Match | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAssistant, setShowAssistant] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState('');
  const [isNewMatch, setIsNewMatch] = useState(false);
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  // The main progress (0 -> 1) as messageCount goes from 0 -> 50
  const messageCount = messages.length;
  const progress = Math.min(messageCount / 50, 1);

  useEffect(() => {
    const fetchMatch = async () => {
      if (!auth.currentUser) {
        console.log("No current user");
        return;
      }

      try {
        console.log("Fetching matches for user:", auth.currentUser.uid);
        
        const matchesRef = collection(db, 'matches');
        const q = query(
          matchesRef,
          where('users', 'array-contains', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        console.log("Raw matches data:", querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (!querySnapshot.empty) {
          const matchData = querySnapshot.docs[0].data();
          console.log("Match data:", matchData);
          
          // Find the other user's ID from the users array
          const otherUserId = matchData.users.find((id: string) => id !== auth.currentUser?.uid);
          console.log("Other user ID:", otherUserId);
          
          if (otherUserId) {
            // Fetch the other user's details
            const userDoc = await getDoc(doc(db, 'users', otherUserId));
            console.log("Other user doc exists:", userDoc.exists());
            
            if (userDoc.exists()) {
              const userData = userDoc.data() as UserData;
              const matchInfo = {
                id: querySnapshot.docs[0].id,
                name: `${userData.firstName} ${userData.lastName}`,
                photoURL: userData.profilePicUrl || '/placeholder.svg',
                lastMessage: matchData.lastMessage,
                age: userData.age,
                interests: userData.interests,
                bio: userData.bio,
                location: matchData.location,
              };
              console.log("Setting match info:", matchInfo);
              setMatch(matchInfo);

              // If coming from a "new match" state, show celebration
              if (location.state?.newMatch) {
                showMatchCelebration(matchInfo);
              }
            } else {
              console.error("Could not find matched user document");
            }
          }
        } else {
          console.log("No matches found for user");
          setMatch(null);
        }
      } catch (error) {
        console.error("Error fetching match:", error);
        setMatch(null);
      }
    };

    fetchMatch();
  }, [location.state]);

  useEffect(() => {
    if (match) {
      const messagesRef = collection(db, 'messages');
      const q = query(
        messagesRef,
        where('matchId', '==', match.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messagesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Message));
        setMessages(messagesData);
      });

      return () => unsubscribe();
    }
  }, [match]);

  useEffect(() => {
    // Scroll to bottom whenever messages update
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Periodically show the "AI Assistant" pop-up
  useEffect(() => {
    const timer = setInterval(() => {
      if (Math.random() < 0.3) { // 30% chance
        setShowAssistant(true);
        setAssistantMessage(inspirationalMessages[Math.floor(Math.random() * inspirationalMessages.length)]);
        setTimeout(() => setShowAssistant(false), 5000); // Hide after 5 sec
      }
    }, 30000); // check every 30 sec

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (location.state?.newMatch) {
      setIsNewMatch(true);
      setTimeout(() => {
        if (match) {
          const welcomeMessage = {
            matchId: match.id,
            senderId: 'system',
            text: `Congratulations! You've matched with ${match.name}. Why not start the conversation by sharing something you both have in common?`,
            timestamp: serverTimestamp(),
          };
          addDoc(collection(db, 'messages'), welcomeMessage);
        }
      }, 1000);
    }
  }, [location.state, match]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !match || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'messages'), {
        matchId: match.id,
        senderId: auth.currentUser.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
      });
      setNewMessage('');
      // Re-focus the input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleUnmatch = async () => {
    if (match) {
      await deleteDoc(doc(db, 'matches', match.id));
      setMatch(null);
      setMessages([]);
      
      localStorage.removeItem('matchedUser');
      window.dispatchEvent(new Event('unmatch'));
      
      navigate('/');
    }
  };

  const showMatchCelebration = (matchInfo: Match) => {
    const celebration = document.createElement('div');
    celebration.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50';
    celebration.innerHTML = `
      <div class="bg-white p-8 rounded-lg shadow-xl transform animate-bounce">
        <h2 class="text-2xl font-bold text-center text-pink-600 mb-4">It's a Match! 🎉</h2>
        <p class="text-center text-gray-700 mb-4">You matched with ${matchInfo.name}</p>
        <button class="w-full bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600">
          Start Chatting
        </button>
      </div>
    `;
    
    document.body.appendChild(celebration);
    
    celebration.addEventListener('click', () => {
      document.body.removeChild(celebration);
    });
  };

  // A small function to interpolate our fill color from gray to red as progress goes from 0 to 1
  const getFillColor = (prog: number) => {
    // start: rgb(128, 128, 128), end: rgb(255, 0, 0)
    const r = 128 + (255 - 128) * prog; // 128 -> 255
    const g = 128 + (0   - 128) * prog; // 128 -> 0
    const b = 128 + (0   - 128) * prog; // 128 -> 0
    return `rgba(${r}, ${g}, ${b}, 0.35)`; // 0.35 for some translucency
  };

  const handleMessage = (matchId: string) => {
    setSelectedMatch(match);
    setChatOpen(true);
  };

  const handleViewProfile = (matchId: string) => {
    // Implement the logic to view the profile of the selected match
    console.log(`Viewing profile of match: ${matchId}`);
  };

  const handleBlock = (matchId: string) => {
    // Implement the logic to block the selected match
    console.log(`Blocking match: ${matchId}`);
  };

  const handleReport = (matchId: string) => {
    // Implement the logic to report the selected match
    console.log(`Reporting match: ${matchId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 mb-6 text-center">
          Your Matches
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {match && (
            <Card key={match.id} className="card-hover overflow-hidden group">
              <CardContent className="p-0">
                <div className="relative">
                  <div className="aspect-[3/2] overflow-hidden">
                    <img
                      src={match.photoURL}
                      alt={match.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h3 className="text-xl font-semibold text-white">{match.name}</h3>
                    <p className="text-white/80 text-sm">{match.age} years old</p>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {match.interests?.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 rounded-full text-sm bg-pink-100 text-pink-600 hover:bg-pink-200 transition-colors"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      onClick={() => handleMessage(match.id)}
                      className="flex-1 mr-2 group"
                    >
                      <MessageCircle className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                      Message
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="icon" className="hover:bg-pink-50">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm hover:bg-pink-50"
                            onClick={() => handleViewProfile(match.id)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            View Profile
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm hover:bg-pink-50"
                            onClick={() => handleBlock(match.id)}
                          >
                            <Shield className="h-4 w-4 mr-2" />
                            Block User
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm hover:bg-pink-50"
                            onClick={() => handleReport(match.id)}
                          >
                            <Flag className="h-4 w-4 mr-2" />
                            Report
                          </Button>
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-sm hover:bg-red-50 text-red-600"
                            onClick={() => handleUnmatch()}
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Unmatch
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Chat Dialog */}
        <Dialog open={chatOpen} onOpenChange={setChatOpen}>
          <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                Chat with {selectedMatch?.name}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.senderId === auth.currentUser?.uid ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-2xl ${
                        message.senderId === auth.currentUser?.uid
                          ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="input-cute"
              />
              <Button onClick={handleSendMessage} size="icon" className="group">
                <Send className="h-4 w-4 group-hover:animate-bounce" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* AI Assistant message pop-up */}
      {showAssistant && (
        <div className="fixed bottom-4 right-4 max-w-sm animate-bounce">
          <Card className="bg-gradient-to-r from-pink-400 to-purple-500 text-white">
            <CardContent className="p-4 flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
                  <path d="M8 15C8.82843 15 9.5 14.3284 9.5 13.5C9.5 12.6716 8.82843 12 8 12C7.17157 12 6.5 12.6716 6.5 13.5C6.5 14.3284 7.17157 15 8 15Z" fill="white"/>
                  <path d="M16 15C16.8284 15 17.5 14.3284 17.5 13.5C17.5 12.6716 16.8284 12 16 12C15.1716 12 14.5 12.6716 14.5 13.5C14.5 14.3284 15.1716 15 16 15Z" fill="white"/>
                  <path d="M15.5 9C15.5 9.82843 14.8284 10.5 14 10.5C13.1716 10.5 12.5 9.82843 12.5 9C12.5 8.17157 13.1716 7.5 14 7.5C14.8284 7.5 15.5 8.17157 15.5 9Z" fill="white"/>
                  <path d="M11.5 9C11.5 9.82843 10.8284 10.5 10 10.5C9.17157 10.5 8.5 9.82843 8.5 9C8.5 8.17157 9.17157 7.5 10 7.5C10.8284 7.5 11.5 8.17157 11.5 9Z" fill="white"/>
                  <path d="M12 18C14.2091 18 16 17.3284 16 16.5C16 15.6716 14.2091 15 12 15C9.79086 15 8 15.6716 8 16.5C8 17.3284 9.79086 18 12 18Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI Assistant</h3>
                <p className="text-sm">{assistantMessage}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confetti if new match */}
      {isNewMatch && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}
    </div>
  );
}
