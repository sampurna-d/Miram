import React, { useState, useEffect, useCallback } from 'react';
import Lottie from 'react-lottie';
import cupidAnimation from '../assets/red-bird.json'; // Updated to use .lottie file
import { useDeepSeekAI } from '../hooks/useDeepSeekAI'; // Custom hook for DeepSeek AI


interface CupidAIProps {
  onMessage: (message: string) => void;
}

export function CupidAI({ onMessage }: CupidAIProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  const { getCupidAdvice } = useDeepSeekAI();
  const [animationKey, setAnimationKey] = useState(0); // Key to force animation restart

  const showCupid = useCallback(async () => {
    const advice = await getCupidAdvice();
    setMessage(advice);
    setAnimationKey(prev => prev + 1); // Force animation restart
    setIsVisible(true);
    
    // Show message after 500ms delay
    setTimeout(() => {
      setShowMessage(true);
    }, 500);

    // Hide everything after animation completes
    setTimeout(() => {
      setShowMessage(false);
      setIsVisible(false);
    }, 3000);

    onMessage(advice);
  }, [getCupidAdvice, onMessage]);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    
    const scheduleAppearances = () => {
      timeoutIds.forEach(clearTimeout);
      timeoutIds = [];
      
      // Schedule 3 random appearances spread across the minute
      const intervals = [0, 20000, 40000].map(base => 
        base + (Math.random() * 15000) // Add random delay within each 20s window
      );
      
      intervals.forEach(delay => {
        const timeoutId = setTimeout(showCupid, delay);
        timeoutIds.push(timeoutId);
      });
    };

    scheduleAppearances();
    const interval = setInterval(scheduleAppearances, 60000);

    return () => {
      clearInterval(interval);
      timeoutIds.forEach(clearTimeout);
    };
  }, [showCupid]);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: cupidAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
    segments: [0, cupidAnimation.op], // Play full animation
  };

  return (
    <div className={`cupid-container ${isVisible ? 'visible' : 'hidden'}`}>
      <Lottie
        key={animationKey}
        options={defaultOptions}
        height={200}
        width={200}
        isClickToPauseDisabled={true}
        speed={1.2} // Slightly faster animation
        eventListeners={[
          {
            eventName: 'complete',
            callback: () => {
              // Ensure animation plays completely before hiding
              if (isVisible) {
                setShowMessage(false);
                setIsVisible(false);
              }
            },
          },
        ]}
      />
      <div className={`cupid-message ${showMessage ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}>
        {message}
      </div>
    </div>
  );
} 