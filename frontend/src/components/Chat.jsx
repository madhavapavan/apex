import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatBottomRef = useRef(null);

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const response = await axios.get(`/api/chats/${userId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    };
    if (userId) {
      fetchChat();
    }
  }, [userId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { text: input, sender: 'user' };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput('');

    try {
      const response = await axios.post('/api/chats', { userId, message: input });
      const botMessage = { text: response.data.reply, sender: 'bot' };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded-lg ${
              message.sender === 'user' ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'
            }`}
          >
            {message.text}
          </div>
        ))}
        <div ref={chatBottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="w-full p-2 border rounded"
        />
      </form>
    </div>
  );
}

export default Chat;