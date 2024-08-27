import React, { useState } from 'react';

interface ChatInterfaceProps {
  matchedUser: { id: string; name: string };
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ matchedUser }) => {
  const [messages, setMessages] = useState<{ text: string; isUser: boolean }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, isUser: true }]);
      setInput('');
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 mt-8">
      <h2 className="text-xl font-bold mb-4">Chat with {matchedUser.name}</h2>
      <div className="h-64 overflow-y-auto mb-4">
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
  );
};

export default ChatInterface;