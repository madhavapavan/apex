import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageSquarePlus, MessageSquare, ChevronRight, User } from 'lucide-react';

function Sidebar({ userId, onNewChat, onChatSelect, currentChatId }) {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const fetchChats = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chats/${userId}`);
      setChats(response.data || []);
      if (response.data.length > 0 && currentChatId) {
        const current = response.data.find(chat => chat.chatId === currentChatId);
        setSelectedChat(current || null);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      setChats([]);
    }
  };

  useEffect(() => {
    if (userId) fetchChats();
  }, [userId, currentChatId]);

  const handleNewChat = () => {
    onNewChat();
    setSelectedChat(null);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    onChatSelect(chat.chatId);
  };

  return (
    <aside className="h-full flex flex-col backdrop-blur-xl bg-white/10 dark:bg-slate-900/20 border-r border-white/20 dark:border-slate-700/20">
      {/* Header */}
      <div className="p-4 border-b border-white/10 dark:border-slate-700/10">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            Conversations
          </h2>
          <button
            onClick={handleNewChat}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-700/80 hover:to-purple-700/80 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>
      </div>

      {/* Chat list */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-2">
        {chats.length > 0 ? (
          chats.map((chat, index) => (
            <button
              key={chat.chatId}
              onClick={() => handleChatSelect(chat)}
              className={`w-full p-3 rounded-xl backdrop-blur-lg transition-all duration-200 group relative ${
                selectedChat?.chatId === chat.chatId
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-500/20 dark:to-purple-500/20 shadow-lg'
                  : 'hover:bg-white/5 dark:hover:bg-slate-800/30'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  selectedChat?.chatId === chat.chatId
                    ? 'bg-gradient-to-r from-blue-600/80 to-purple-600/80'
                    : 'bg-white/10 dark:bg-slate-700/30'
                }`}>
                  <MessageSquare className={`w-5 h-5 ${
                    selectedChat?.chatId === chat.chatId
                      ? 'text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`font-medium truncate ${
                    selectedChat?.chatId === chat.chatId
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}>
                    Chat #{index + 1}
                  </p>
                  {chat.messages.length > 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {chat.messages[chat.messages.length - 1].text.slice(0, 30)}...
                    </p>
                  )}
                </div>
                <ChevronRight className={`w-4 h-4 transform transition-transform duration-200 ${
                  selectedChat?.chatId === chat.chatId
                    ? 'translate-x-0 text-slate-900 dark:text-white'
                    : '-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 text-slate-400'
                }`} />
              </div>
            </button>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-32 space-y-3">
            <div className="p-3 rounded-full bg-white/10 dark:bg-slate-800/30">
              <MessageSquare className="w-6 h-6 text-slate-400 dark:text-slate-500" />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center">
              No conversations yet
            </p>
          </div>
        )}
      </div>

      {/* Footer with user info */}
      <div className="p-4 border-t border-white/10 dark:border-slate-700/10">
        <div className="flex items-center space-x-3 p-2 rounded-xl bg-white/5 dark:bg-slate-800/30">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600/20 to-purple-600/20">
            <User className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              ID: {userId ? `${userId.slice(0, 8)}...` : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;