// frontend/src/components/Chat.jsx (assumed)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Chat({ userId }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/chats/${userId}`);
        setMessages(response.data.messages);
      } catch (error) {
        console.error('Error fetching chat:', error);
      }
    };
    fetchMessages();
  }, [userId]);

  const handleSend = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/chats', {
        userId,
        message: input,
      });
      setMessages([...messages, { text: input, sender: 'user' }, { text: response.data.reply, sender: 'bot' }]);
      setInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div>
      <div className="chat-messages">
        {messages.map((msg, index) => ( // Line ~64 assumed
          <div key={index} className={msg.sender === 'user' ? 'user-msg' : 'bot-msg'}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSend}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default Chat;