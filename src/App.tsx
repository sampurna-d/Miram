import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import MatchesPage from './components/MatchesPage';
import SettingsPage from './components/SettingsPage';
import NotificationSettings from './components/NotificationSettings';
import SecurityPrivacy from './components/SecurityPrivacy';
import ContactFAQ from './components/ContactFAQ';
import { Toaster } from './components/ui/toaster';
import PrivateRoute from './components/PrivateRoute';
import Profile from './components/Profile';
import ChatPage from './components/ChatPage';
import { AvatarProvider } from './contexts/AvatarContext';

function App() {
  return (
    <AvatarProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/matches" element={<MatchesPage />} />
                <Route path="/chat/:matchId" element={<ChatPage />} />
                <Route path="/profile" element={<Profile />} />
                
                {/* Settings Routes */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/settings/notifications" element={<NotificationSettings />} />
                <Route path="/settings/security" element={<SecurityPrivacy />} />
                <Route path="/settings/help" element={<ContactFAQ />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-purple-50">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-pink-600 mb-4">404</h1>
                    <p className="text-gray-600 mb-4">Oops! Page not found</p>
                    <button
                      onClick={() => window.history.back()}
                      className="text-pink-500 hover:text-pink-600 underline"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AvatarProvider>
  );
}

export default App;