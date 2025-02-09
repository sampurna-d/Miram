import { useState } from 'react';

export function useDeepSeekAI() {
  const [isLoading, setIsLoading] = useState(false);

  const getCupidAdvice = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer YOUR_DEEPSEEK_API_KEY`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are Cupid, a playful AI assistant in a dating app. Your role is to give dating advice, suggest icebreakers, and motivate users. Keep your tone fun and encouraging.',
            },
            {
              role: 'user',
              content: 'Give me a playful tip or motivation!',
            },
          ],
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error fetching AI advice:', error);
      return 'Love is in the air! Keep smiling!';
    } finally {
      setIsLoading(false);
    }
  };

  return { getCupidAdvice, isLoading };
} 