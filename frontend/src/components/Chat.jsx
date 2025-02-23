// frontend/src/components/Chat.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${userId}`);
        console.log('Chat API response:', response.data);
        setMessages(response.data.messages || []);
      } catch (error) {
        console.error('Error fetching chat:', error);
        setError('Failed to load chat history');
        setMessages([]);
      }
    };
    if (userId) fetchMessages();
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    try {
      const response = await axios.post('http://localhost:5000/api/chats', {
        userId,
        message: input,
      });
      setMessages([...messages, { text: input, sender: 'user' }, { text: response.data.reply, sender: 'bot' }]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (error) return <div className="text-red-500 text-center">{error}</div>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-3 rounded-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No messages yet</p>
        )}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message"
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}

export default Chat;