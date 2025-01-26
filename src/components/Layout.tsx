import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, Home, Settings } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useSpring, animated } from 'react-spring';

const Layout: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  // Animation for settings icon rotation
  const iconAnimation = useSpring({
    transform: isSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    config: { tension: 300, friction: 10 },
  });

  // Animation for dropdown menu
  const dropdownAnimation = useSpring({
    opacity: isSettingsOpen ? 1 : 0,
    transform: isSettingsOpen ? 'translateY(0px)' : 'translateY(-20px)',
    height: isSettingsOpen ? 80 : 0, // Adjust based on your content height
    config: { tension: 300, friction: 20 },
  });

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSystemSettings = () => {
    navigate('/settings');
    setIsSettingsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-500">Play Date</h1>
        <div className="relative">
          <animated.button
            style={iconAnimation}
            className="text-gray-500 hover:text-pink-500 focus:outline-none transition-colors duration-200"
            onClick={handleSettingsClick}
          >
            <Settings size={24} />
          </animated.button>
          <animated.div
            style={dropdownAnimation}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 overflow-hidden"
          >
            {isSettingsOpen && (
              <>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors duration-200"
                  onClick={handleSystemSettings}
                >
                  <div className="flex items-center space-x-2">
                    <Settings size={16} />
                    <span>Settings</span>
                  </div>
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-pink-50 transition-colors duration-200"
                  onClick={handleLogout}
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </div>
                </button>
              </>
            )}
          </animated.div>
        </div>
      </header>

      <main className="flex-grow">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-around items-center h-16">
          <Link to="/home" className="flex flex-col items-center justify-center w-1/3 h-full text-gray-500 hover:text-pink-500 transition-colors duration-200">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/matches" className="flex flex-col items-center justify-center w-1/3 h-full text-gray-500 hover:text-pink-500 transition-colors duration-200">
            <Heart size={24} />
            <span className="text-xs mt-1">Matches</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center justify-center w-1/3 h-full text-gray-500 hover:text-pink-500 transition-colors duration-200">
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Layout;