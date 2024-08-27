import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, User, Home, Settings } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

const Layout: React.FC = () => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSettingsClick = () => {
    setIsSettingsOpen(!isSettingsOpen);
  };

  const handleSystemSettings = () => {
    // Implement system settings logic here
    console.log('System settings clicked');
  };

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

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-pink-100 to-purple-100">
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-pink-500">Play Date</h1>
        <div className="relative">
          <button
            className="text-gray-500 hover:text-pink-500 focus:outline-none"
            onClick={handleSettingsClick}
          >
            <Settings size={24} />
          </button>
          {isSettingsOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleSystemSettings}
              >
                System Settings
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
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