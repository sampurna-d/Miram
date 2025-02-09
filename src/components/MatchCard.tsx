import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Card } from "./ui/card";
import { Match } from '../types/match';
import { BITMOJI_THRESHOLD } from '../constants/app';
import { Skeleton } from "./ui/skeleton";

interface MatchCardProps {
  match: Match;
  messageCount: number;
  onClick: () => void;
}

/**
 * MatchCard Component
 * Displays a user match with optimized image loading
 */
export default function MatchCard({ match, messageCount, onClick }: MatchCardProps) {
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [photoLoaded, setPhotoLoaded] = useState(false);
  const showAvatar = useMemo(() => messageCount <= BITMOJI_THRESHOLD, [messageCount]);
  
  // Determine which image to show based on load state and message count
  const displayImage = useMemo(() => {
    if (showAvatar) {
      return avatarLoaded ? match.avatar : undefined;
    }
    return photoLoaded ? match.photoURL : undefined;
  }, [showAvatar, avatarLoaded, photoLoaded, match]);

  // Preload both images immediately
  useEffect(() => {
    const preloadImage = (src: string, onLoad: () => void) => {
      const img = new Image();
      img.onload = onLoad;
      img.src = src;
    };

    if (match.avatar) {
      preloadImage(match.avatar, () => setAvatarLoaded(true));
    }
    if (match.photoURL) {
      preloadImage(match.photoURL, () => setPhotoLoaded(true));
    }

    return () => {
      setAvatarLoaded(false);
      setPhotoLoaded(false);
    };
  }, [match.avatar, match.photoURL]);

  const isLoading = showAvatar ? !avatarLoaded : !photoLoaded;

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="aspect-[3/2] overflow-hidden relative">
        {isLoading ? (
          <Skeleton className="w-full h-full absolute inset-0" />
        ) : (
          <img
            src={displayImage}
            alt={match.name}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            loading="eager"
            decoding="async"
          />
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            {displayImage ? (
              <AvatarImage 
                src={displayImage} 
                alt={match.name}
                loading="eager"
              />
            ) : (
              <AvatarFallback>{match.name[0]}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900">{match.name}</h3>
            <p className="text-sm text-gray-500">{match.age} years old</p>
          </div>
        </div>
        {match.lastMessage && (
          <p className="mt-2 text-sm text-gray-600 truncate">{match.lastMessage}</p>
        )}
      </div>
    </Card>
  );
} 