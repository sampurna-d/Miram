import React, { createContext, useContext, useState, useEffect } from 'react';
import { BITMOJI_THRESHOLD } from '../constants/app';

interface AvatarContextType {
  showAvatar: boolean;
  messageCount: number;
  setMessageCount: (count: number) => void;
}

const AvatarContext = createContext<AvatarContextType | undefined>(undefined);

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [messageCount, setMessageCount] = useState(0);
  const [showAvatar, setShowAvatar] = useState(true);

  useEffect(() => {
    setShowAvatar(messageCount <= BITMOJI_THRESHOLD);
  }, [messageCount]);

  return (
    <AvatarContext.Provider value={{ showAvatar, messageCount, setMessageCount }}>
      {children}
    </AvatarContext.Provider>
  );
}

export function useAvatar() {
  const context = useContext(AvatarContext);
  console.log(context);
  if (context === undefined) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
} 