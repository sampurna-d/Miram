import React, { useState, useEffect } from 'react';
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

export default function MatchCard({ match, messageCount, onClick }: MatchCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    // Preload both images
    const avatar = new Image();
    const photo = new Image();
    
    avatar.src = match.avatar;
    photo.src = match.photoURL;

    const displayImage = messageCount <= BITMOJI_THRESHOLD ? match.avatar : match.photoURL;
    setCurrentImage(displayImage);

    // Check if the current display image is loaded
    const img = new Image();
    img.onload = () => setImageLoaded(true);
    img.src = displayImage;
  }, [match.avatar, match.photoURL, messageCount]);

  return (
    <Card 
      className="group cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="aspect-[3/2] overflow-hidden relative">
        {!imageLoaded && (
          <Skeleton className="w-full h-full absolute inset-0" />
        )}
        <img
          src={currentImage}
          alt={match.name}
          className={`w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      </div>
      <div className="p-4">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={messageCount <= BITMOJI_THRESHOLD ? match.avatar : match.photoURL} 
              alt={match.name} 
            />
            <AvatarFallback>{match.name[0]}</AvatarFallback>
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