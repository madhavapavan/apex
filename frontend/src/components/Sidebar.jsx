import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Sidebar({ userId }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await axios.get(`/api/chats/${userId}`);
        // Assuming your backend returns chat history in a format you can use
        setChats(response.data.messages ? [response.data] : []); // Place the chat in an array if it exists.
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    if (userId) {
      fetchChats();
    }
  }, [userId]);

  return (
    <aside className="w-64 bg-gray-200 p-4">
      <h2 className="text-xl font-semibold mb-4">Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.userId} className="mb-2 p-2 rounded bg-gray-300">
            Chat with {userId}
          </li>
        ))}
      </ul>
    </aside>
  );
}

export default Sidebar;