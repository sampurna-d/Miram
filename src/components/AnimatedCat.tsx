import React, { useState, useEffect } from 'react';

interface AnimatedCatProps {
  onClick: () => void;
  isThinking: boolean;
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ onClick, isThinking }) => {
  const [animation, setAnimation] = useState<'wave' | 'purr' | 'idle'>('idle');

  useEffect(() => {
    const interval = setInterval(() => {
      const random = Math.random();
      if (random < 0.3) {
        setAnimation('wave');
      } else if (random < 0.6) {
        setAnimation('purr');
      } else {
        setAnimation('idle');
      }
    }, 5000); // Change animation every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative cursor-pointer" onClick={onClick}>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Cat body */}
        <ellipse cx="100" cy="150" rx="80" ry="40" fill="#f4a460" />
        
        {/* Cat head */}
        <circle cx="100" cy="80" r="60" fill="#f4a460" />
        
        {/* Eyes */}
        <circle cx="80" cy="70" r="10" fill="white" />
        <circle cx="120" cy="70" r="10" fill="white" />
        <circle cx="80" cy="70" r="5" fill="black" />
        <circle cx="120" cy="70" r="5" fill="black" />
        
        {/* Nose */}
        <polygon points="100,90 95,95 105,95" fill="pink" />
        
        {/* Mouth */}
        <path d="M90 100 Q100 110 110 100" fill="none" stroke="black" strokeWidth="2" />
        
        {/* Ears */}
        <polygon points="60,30 50,70 80,50" fill="#f4a460" />
        <polygon points="140,30 150,70 120,50" fill="#f4a460" />
        
        {/* Paw (for waving) */}
        <g className={animation === 'wave' ? 'animate-wave' : ''}>
          <ellipse cx="140" cy="180" rx="20" ry="10" fill="#f4a460" />
        </g>
        
        {/* Tail */}
        <path d="M20 150 Q-10 100 20 50" fill="none" stroke="#f4a460" strokeWidth="10" />
      </svg>
      
      {/* Purr animation */}
      {animation === 'purr' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl animate-pulse">
          😺
        </div>
      )}
      
      {/* Thinking animation */}
      {isThinking && (
        <div className="absolute top-0 right-0 bg-white rounded-full p-2 shadow-md">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnimatedCat;