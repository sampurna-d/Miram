import React, { useState, useEffect } from 'react'
import { useSpring, animated, config } from 'react-spring'
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, MessageCircle, User, Search, LogOut, Settings, ChevronUp, ChevronDown } from 'lucide-react';
import AIChatbot from './AIChatbot';
import ChatInterface from './ChatInterface';
import { auth, db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

const CatAnimation: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const [isWaving, setIsWaving] = useState(false)
  const [isPurring, setIsPurring] = useState(false)
  const [isThinking, setIsThinking] = useState(false)

  const catSpring = useSpring({
    transform: isWaving ? 'rotate(20deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 10 },
  })

  const purrSpring = useSpring({
    opacity: isPurring ? 1 : 0,
    config: { duration: 500 },
  })

  const thinkingSpring = useSpring({
    opacity: isThinking ? 1 : 0,
    config: { duration: 300 },
  })

  useEffect(() => {
    const waveInterval = setInterval(() => {
      setIsWaving(true)
      setTimeout(() => setIsWaving(false), 1000)
    }, 5000)

    const purrInterval = setInterval(() => {
      setIsPurring(true)
      setTimeout(() => setIsPurring(false), 2000)
    }, 8000)

    const thinkInterval = setInterval(() => {
      setIsThinking(true)
      setTimeout(() => setIsThinking(false), 3000)
    }, 10000)

    return () => {
      clearInterval(waveInterval)
      clearInterval(purrInterval)
      clearInterval(thinkInterval)
    }
  }, [])

  return (
    <div className="relative cursor-pointer" onClick={onPress}>
      <animated.div style={catSpring}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="90" fill="#FFA500" />
          <circle cx="70" cy="80" r="10" fill="black" />
          <circle cx="130" cy="80" r="10" fill="black" />
          <path d="M90 110 Q100 120 110 110" stroke="black" strokeWidth="3" fill="none" />
          <path d="M60 50 L30 20 M140 50 L170 20" stroke="black" strokeWidth="3" />
        </svg>
      </animated.div>
      <animated.div style={purrSpring} className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
        <span className="text-2xl">😺 Purr</span>
      </animated.div>
      <animated.div style={thinkingSpring} className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full bg-white rounded-full p-2 shadow-md">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </animated.div>
    </div>
  )
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [matchedUser, setMatchedUser] = useState<null | { id: string; name: string; interests: string[] }>(null);
  const [noMatchFound, setNoMatchFound] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('matches')
  const [isMatching, setIsMatching] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleUnmatch = () => {
      setMatchedUser(null);
      localStorage.removeItem('matchedUser');
    };

    window.addEventListener('unmatch', handleUnmatch);

    return () => {
      window.removeEventListener('unmatch', handleUnmatch);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
      // Firebase will trigger onAuthStateChanged, which will redirect to login
    } catch (error) {
      console.error('Error signing out:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleNavigation = (tab: string) => {
    if (tab === 'matches') {
      navigate('/matches');
    } else {
      setActiveTab(tab);
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSystemSettings = () => {
    // Implement system settings logic here
    console.log('System settings clicked');
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const fetchUserData = async () => {
          const userDoc = await getDocs(query(collection(db, 'users'), where('email', '==', user.email)));
          if (!userDoc.empty) {
            setCurrentUser(userDoc.docs[0].data());
          }
          setIsLoading(false);
        };
        fetchUserData();
      } else {
        setIsLoading(false);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    // Check if we're coming from an unmatch action
    if (location.state && location.state.unmatched) {
      setMatchedUser(null);
      localStorage.removeItem('matchedUser');
    } else {
      // Check local storage for existing match
      const storedMatch = localStorage.getItem('matchedUser');
      if (storedMatch) {
        setMatchedUser(JSON.parse(storedMatch));
      }
    }
  }, [location]);

  const startMatching = async () => {
    setIsMatching(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '!=', auth.currentUser?.email));
      const querySnapshot = await getDocs(q);
      
      const potentialMatches = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Array<{ id: string; interests: string[]; firstName: string; lastName: string }>;

      const match = potentialMatches.reduce((bestMatch, user) => {
        const commonInterests = user.interests.filter((interest: string) => 
          currentUser.interests.includes(interest)
        );
        if (commonInterests.length > (bestMatch?.commonInterests?.length || 0)) {
          return { ...user, commonInterests };
        }
        return bestMatch;
      }, null as (typeof potentialMatches[0] & { commonInterests: string[] }) | null);

      if (match) {
        const matchedUserData = {
          id: match.id,
          name: `${match.firstName} ${match.lastName}`,
          interests: match.interests
        };
        setMatchedUser(matchedUserData);
        setNoMatchFound(false);

        // Store match in local storage
        localStorage.setItem('matchedUser', JSON.stringify(matchedUserData));

        // Add matched user to matches collection
        await addDoc(collection(db, 'matches'), {
          users: [auth.currentUser?.uid, match.id],
          timestamp: new Date(),
        });

        // Navigate to matches page
        navigate('/matches');
      } else {
        setMatchedUser(null);
        setNoMatchFound(true);
        localStorage.removeItem('matchedUser');
      }
    } catch (error) {
      console.error('Error finding match:', error);
    } finally {
      setIsMatching(false);
    }
  };

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
    return <div>Loading...</div>;
  }

  if (!currentUser) {
    return null; // or a loading spinner
  }

  return (
    <animated.div style={fadeIn} className="flex flex-col items-center min-h-screen bg-gradient-to-b from-pink-100 to-purple-100 p-4">
      <header className="w-full text-center mb-4">
        <h1 className="text-4xl font-bold text-pink-600">Miram</h1>
        {currentUser && (
          <h2 className="text-2xl font-semibold text-purple-600 mt-2">Hi {currentUser.firstName}</h2>
        )}
      </header>

      <div className="flex flex-col items-center mb-8 flex-grow mt-4">
        <CatAnimation onPress={() => setIsChatOpen(!isChatOpen)} />
        <animated.div style={chatSpring} className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden mt-4">
          <div className="p-4">
            <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
            <div className="bg-gray-100 rounded p-3 mb-2">
              <p>Hello! I'm your AI assistant. How can I help you with your dating journey today?</p>
            </div>
            <div className="flex">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button className="bg-pink-500 text-white p-2 rounded-r hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300">
                <MessageCircle size={20} />
              </button>
            </div>
          </div>
        </animated.div>

        {noMatchFound && (
          <p className="text-lg text-red-500 mt-4">Sorry, No match found at this time!</p>
        )}

        {matchedUser ? (
          <div className="mt-4">
            <h3 className="text-xl font-semibold">You matched with {matchedUser.name}!</h3>
            <p>Common interests: {matchedUser.interests?.join(', ') || 'No common interests'}</p>
            <p className="text-lg text-green-500 mt-4">Hope {matchedUser.name} is the one for you!</p>
          </div>
        ) : (
          <button
            className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-full text-xl shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-300 mt-8"
            onClick={startMatching}
          >
            Start Matching
          </button>
        )}
      </div>


    </animated.div>
  );
};

export default HomePage;