"use client"

import React, { useState, useEffect } from "react"
import { useSpring, animated, config } from "react-spring"
import { useNavigate } from "react-router-dom"
import { Heart, MessageCircle, UserX, LogOut } from "lucide-react"
import { Card, CardContent } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { auth, db } from "../firebase"
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore"
import { signOut } from "firebase/auth"
import AnimatedCupid from "./AnimatedCat"
import { useToast } from "./ui/use-toast"
import { userService } from '../services/firebase'
import { matchService } from '../services/matches'
import { presenceService } from '../services/presence'
import { UserProfile } from '../types/user'
import { calculateAge, calculateDistance } from '../utils/helpers'

export default function HomePage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [matchedUser, setMatchedUser] = useState<any>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("matchedUser")
      return saved ? JSON.parse(saved) : null
    }
    return null
  })
  const [noMatchFound, setNoMatchFound] = useState(false)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMatching, setIsMatching] = useState(false)
  const [error, setError] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [chatMessage, setChatMessage] = useState("")
  const [potentialMatches, setPotentialMatches] = useState<UserProfile[]>([])

  useEffect(() => {
    const handleUnmatch = () => {
      setMatchedUser(null)
      localStorage.removeItem("matchedUser")
    }

    window.addEventListener("unmatch", handleUnmatch)
    return () => window.removeEventListener("unmatch", handleUnmatch)
  }, [])

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          console.log("Current user:", user.email);
          const userDoc = await getDocs(
            query(
              collection(db, "users"), 
              where("email", "==", user.email || "")
            )
          );

          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data() as UserProfile;
            const userId = userDoc.docs[0].id;
            
            // Ensure all required fields exist
            const currentUser: UserProfile = {
              ...userData,
              id: userId,
              matches: userData.matches || [],
              blockedUsers: userData.blockedUsers || [],
              preferences: userData.preferences || {
                ageRange: { min: 18, max: 100 },
                distance: 100,
                showMe: true
              }
            };

            setCurrentUser(currentUser);
            
            // Start tracking presence
            if (userId) {
              presenceService.trackPresence(userId);
            }

            // Only fetch matches if we have a valid user with preferences
            if (currentUser.preferences) {
              try {
                const matches = await userService.findMatches(currentUser);
                console.log("Found potential matches:", matches);
                setPotentialMatches(matches);
              } catch (error) {
                console.error("Error fetching matches:", error);
                toast({
                  title: "Error",
                  description: "Failed to fetch potential matches",
                  variant: "destructive",
                });
              }
            }
          } else {
            console.error("No user document found for email:", user.email);
            toast({
              title: "Error",
              description: "User profile not found",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          toast({
            title: "Error",
            description: "Failed to load user profile",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const verifyMatch = async () => {
      if (!matchedUser?.id || !auth.currentUser?.uid) return;

      try {
        console.log("Verifying match for users:", auth.currentUser.uid, matchedUser.id);
        const matches = await matchService.getMatches(auth.currentUser.uid);
        
        const matchExists = matches.some(match => 
          match.users.includes(matchedUser.id)
        );

        if (!matchExists) {
          console.log("No valid match found, clearing local state");
          setMatchedUser(null);
          localStorage.removeItem("matchedUser");
        }
      } catch (error) {
        console.error("Error verifying match:", error);
        toast({
          title: "Error",
          description: "Failed to verify match status",
          variant: "destructive",
        });
      }
    };

    verifyMatch();
  }, [matchedUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/login")
      toast({
        title: "Logged out successfully",
        description: "See you next time!",
      })
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error logging out",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const createMatch = async (matchedUser: any) => {
    try {
      if (!auth.currentUser?.uid || !matchedUser.id) {
        throw new Error("Invalid user IDs for match creation")
      }

      const matchId = await matchService.createMatch(auth.currentUser.uid, matchedUser.id)

      const matchedUserData = {
        id: matchedUser.id,
        name: `${matchedUser.firstName} ${matchedUser.lastName}`,
        interests: matchedUser.interests,
      }
      setMatchedUser(matchedUserData)
      setNoMatchFound(false)
      localStorage.setItem("matchedUser", JSON.stringify(matchedUserData))

      navigate("/matches", {
        state: {
          newMatch: true,
          matchedUserId: matchedUser.id,
        },
      })

      toast({
        title: "Match found!",
        description: `You've matched with ${matchedUser.firstName}!`,
      })
    } catch (error) {
      console.error("Error in match creation:", error)
      setError(error instanceof Error ? error.message : "Failed to create match")
      setMatchedUser(null)
      localStorage.removeItem("matchedUser")
    }
  }

  const startMatching = async () => {
    if (!currentUser) {
      toast({
        title: "Error",
        description: "User profile not loaded",
        variant: "destructive",
      });
      return;
    }

    setIsMatching(true);
    setError("");
    
    try {
      console.log("Starting matching process for user:", currentUser.id);
      
      // Fetch potential matches
      const matches = await userService.findMatches(currentUser);
      console.log("Potential matches found:", matches.length);

      if (matches.length === 0) {
        setMatchedUser(null);
        setNoMatchFound(true);
        localStorage.removeItem("matchedUser");
        toast({
          title: "No matches found",
          description: "Try adjusting your preferences or try again later!",
          variant: "destructive",
        });
        return;
      }

      // Filter and score matches
      const scoredMatches = matches.map(user => {
        const commonInterests = user.interests?.filter(
          interest => currentUser.interests?.includes(interest)
        ) || [];

        const ageMatch = Math.abs(
          calculateAge(currentUser.dateOfBirth.toDate()) - 
          calculateAge(user.dateOfBirth.toDate())
        );

        const distance = calculateDistance(currentUser.location, user.location);

        // Calculate match score (higher is better)
        const score = (
          (commonInterests.length * 10) + // Each common interest is worth 10 points
          (100 - ageMatch) + // Closer age = more points
          (100 - distance) // Closer distance = more points
        );

        return { ...user, score, commonInterests };
      });

      // Sort by score and get the best match
      const bestMatch = scoredMatches.sort((a, b) => b.score - a.score)[0];
      console.log("Best match found:", bestMatch);

      if (bestMatch) {
        await createMatch(bestMatch);
      } else {
        setMatchedUser(null);
        setNoMatchFound(true);
        localStorage.removeItem("matchedUser");
        toast({
          title: "No suitable matches",
          description: "Try adjusting your preferences!",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in matching process:", error);
      setError("Failed to find a match. Please try again.");
      toast({
        title: "Error",
        description: "Failed to find matches. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsMatching(false);
    }
  };

  const handleUnmatch = async () => {
    try {
      if (!auth.currentUser || !matchedUser?.id) return;

      // Get the match document
      const matches = await matchService.getMatches(auth.currentUser.uid);
      const match = matches.find(m => m.users.includes(matchedUser.id));
      
      if (match) {
        await matchService.unmatch(match.id, auth.currentUser.uid, matchedUser.id);
        
        setMatchedUser(null);
        localStorage.removeItem("matchedUser");
        window.dispatchEvent(new Event("unmatch"));

        toast({
          title: "Unmatched successfully",
          description: "Ready to find a new match!",
        });
      }
    } catch (error) {
      console.error("Error unmatching:", error);
      toast({
        title: "Error unmatching",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleCupidClick = () => {
    setIsChatOpen(!isChatOpen)
    setIsThinking(true)
    setTimeout(() => setIsThinking(false), 2000)
  }

  const handleSendMessage = () => {
    if (!chatMessage.trim()) return
    // Handle chat message sending logic here
    setChatMessage("")
  }

  const fadeIn = useSpring({
    from: { opacity: 0 },
    to: { opacity: 1 },
    config: config.molasses,
  })

  const chatSpring = useSpring({
    height: isChatOpen ? 300 : 0,
    opacity: isChatOpen ? 1 : 0,
    config: { tension: 300, friction: 20 },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (!currentUser) return null

  return (
    <animated.div
      style={fadeIn}
      className="flex flex-col items-center min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4"
    >
      <header className="w-full text-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
          Love Connect
        </h1>
        {currentUser && (
          <h2 className="text-2xl font-semibold text-gray-700 mt-2">
            Hi, <span className="text-pink-600">{currentUser.firstName}</span>
          </h2>
        )}
      </header>

      <div className="flex flex-col items-center mb-8 flex-grow mt-4">
        <div className="relative w-[300px] h-[300px] mb-8">
          <AnimatedCupid onClick={handleCupidClick} isThinking={isThinking} />
        </div>

        <animated.div 
          style={chatSpring} 
          className="w-full max-w-md"
        >
          <Card className="card-hover backdrop-blur-sm">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-pink-500" />
                AI Chat Assistant
              </h2>
              <div className="bg-pink-50/50 rounded-2xl p-4 mb-4">
                <p className="text-gray-600">Hello! I'm your AI assistant. How can I help you with your dating journey today?</p>
              </div>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="input-cute flex-1"
                />
                <Button onClick={handleSendMessage} className="group">
                  <MessageCircle className="h-4 w-4 group-hover:animate-bounce" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </animated.div>

        {noMatchFound && (
          <p className="text-lg text-red-500 mt-4 animate-bounce">
            Sorry, no match found at this time! 💔
          </p>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-2xl">
            {error}
          </div>
        )}

        {matchedUser ? (
          <Card className="mt-6 w-full max-w-md card-hover">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600">
                  You matched with {matchedUser.name}! 💕
                </h3>
                <Button 
                  variant="destructive" 
                  onClick={handleUnmatch} 
                  className="group"
                >
                  <UserX className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                  Unmatch
                </Button>
              </div>
              <div className="bg-pink-50/50 rounded-2xl p-4">
                <p className="text-gray-600">
                  Common interests: {matchedUser.interests?.join(", ") || "No common interests"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            className="mt-8 group relative overflow-hidden"
            onClick={startMatching}
            disabled={isMatching}
          >
            <span className="relative z-10 flex items-center">
              <Heart className="mr-2 h-5 w-5 group-hover:animate-bounce" />
              {isMatching ? "Finding Match..." : "Start Matching"}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 group-hover:opacity-90 transition-opacity" />
          </Button>
        )}
      </div>

      <Button 
        variant="outline" 
        className="fixed bottom-4 right-4 group" 
        onClick={handleLogout}
      >
        <LogOut className="h-4 w-4 mr-2 group-hover:animate-bounce" />
        Logout
      </Button>
    </animated.div>
  )
}

