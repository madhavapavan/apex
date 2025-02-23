// frontend/src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Sidebar({ userId, onNewChat, refreshChats }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null); // Track active chat

  // Fetch chats from backend
  const fetchChats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${userId}`);
      const chatData = response.data.messages ? [response.data] : []; // Wrap single chat in array
      setChats(chatData);
      if (chatData.length > 0 && !selectedChat) {
        setSelectedChat(chatData[0]); // Default to first chat
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  // Refresh chats when userId changes or refreshChats is signaled
  useEffect(() => {
    if (userId) fetchChats();
  }, [userId, refreshChats]);

  // Handle creating a new chat (resets current chat)
  const handleNewChat = () => {
    setChats([]); // Clear locally for now
    setSelectedChat(null);
    onNewChat(); // Notify parent to reset Chat.jsx
  };

  // Handle selecting a chat (for future multi-chat support)
  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    // Future: Pass selected chat to Chat.jsx if multi-chat is implemented
  };

  return (
    <aside className="w-72 bg-gray-900 text-white flex flex-col h-screen shadow-lg">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Chats</h2>
          <button
            onClick={handleNewChat}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg transition duration-200 flex items-center space-x-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>
      </div>

      {/* Chat List */}
      <ul className="flex-1 overflow-y-auto p-4 space-y-2">
        {chats.length > 0 ? (
          chats.map((chat, index) => (
            <li
              key={index}
              onClick={() => handleChatSelect(chat)}
              className={`p-3 rounded-lg cursor-pointer transition duration-200 ${
                selectedChat === chat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-semibold truncate">
                  {chat.messages.length > 0 ? 'Conversation' : 'Empty Chat'}
                </span>
                {chat.messages.length > 0 && (
                  <span className="text-sm text-gray-400 truncate">
                    {chat.messages[chat.messages.length - 1].text.slice(0, 30) + '...'}
                  </span>
                )}
              </div>
            </li>
          ))
        ) : (
          <li className="text-gray-500 italic text-center">No chats yet</li>
        )}
      </ul>

      {/* Footer (optional) */}
      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        <p>User ID: {userId ? userId.slice(0, 8) + '...' : 'N/A'}</p>
      </div>
    </aside>
  );
}

export default Sidebar;