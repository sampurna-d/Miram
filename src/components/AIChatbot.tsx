import React, { useState } from 'react';
import AnimatedCat from './AnimatedCat';

const AIChatbot: React.FC = () => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([
    { text: "Hello! I'm your dating assistant. How can I help you today?", isUser: false },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      setInput('');
      setIsThinking(true);
      // Simulate AI thinking and responding
      setTimeout(() => {
        setIsThinking(false);
        setMessages(prev => [...prev, { text: "I'm sorry, I'm just a demo AI. I can't actually process your request.", isUser: false }]);
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <AnimatedCat onClick={() => setIsOpen(!isOpen)} isThinking={isThinking} />
      {isOpen && (
        <div className="mt-4">
          <div className="h-48 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`mb-2 ${message.isUser ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${message.isUser ? 'bg-pink-100' : 'bg-gray-100'}`}>
                  {message.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              placeholder="Type your message..."
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-pink-500 text-white rounded-r-lg hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;