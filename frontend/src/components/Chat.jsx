import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Preprocess Markdown to fix table formatting
const preprocessMarkdown = (text) => {
  // Replace common table formatting issues
  // Remove extra spaces around pipes and ensure proper separator row
  const lines = text.split('\n');
  const tableLines = lines.map((line, index) => {
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Normalize pipes and spaces
      const cleanedLine = line
        .split('|')
        .map(cell => cell.trim())
        .join(' | ')
        .replace(/^\s*|\s*$/g, ''); // Remove leading/trailing spaces
      
      // Fix separator row (second row of table)
      if (index === 1 && cleanedLine.match(/^\|[-|\s]+$/)) {
        const header = lines[0].split('|').filter(Boolean).length;
        return '| ' + Array(header).fill('---').join(' | ') + ' |';
      }
      return cleanedLine;
    }
    return line;
  });
  return tableLines.join('\n');
};

function Chat({ userId, chatId, onChatCreated, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setError(null);
        return;
      }
      try {
        const response = await axios.get(`https://apex-backend-2ptl.onrender.com/api/chats/thread/${chatId}`);
        console.log('Chat thread response:', response.data);
        setMessages(response.data.messages || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching chat thread:', error);
        setError('Failed to load chat history');
        setMessages([]);
      }
    };
    if (userId) fetchMessages();
  }, [userId, chatId]);

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await axios.post('https://apex-backend-2ptl.onrender.com/api/chats', {
        userId,
        message: input,
        chatId: chatId || undefined,
      });

      setIsTyping(false);
      const botReply = preprocessMarkdown(response.data.reply); // Preprocess bot response
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);

      if (!chatId) {
        onChatCreated(response.data.chatId);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (error) return (
    <div className="backdrop-blur-lg bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 dark:border-red-500/10 rounded-xl p-4 text-red-600 dark:text-red-400 text-center">
      {error}
    </div>
  );

  return (
    <div className={`flex flex-col h-full ${messages.length === 0 ? 'justify-center' : 'justify-end'} space-y-4`}>
      <div className={`flex-1 overflow-y-auto space-y-4 pr-4 -mr-4 ${messages.length === 0 ? 'flex items-center justify-center' : ''}`}>
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl backdrop-blur-lg shadow-lg transform transition-all duration-200 hover:scale-[1.02] ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-br from-blue-600/80 to-purple-600/80 dark:from-blue-500/40 dark:to-purple-500/40 text-white ml-8'
                    : 'bg-white/60 dark:bg-slate-800/60 text-slate-900 dark:text-white mr-8 prose prose-sm max-w-none dark:prose-invert'
                }`}
              >
                {msg.sender === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <ReactMarkdown
                    components={{
                      code({ node, inline, children, ...props }) {
                        return inline ? (
                          <code className="bg-gray-200 dark:bg-slate-700 px-1 rounded" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-200 dark:bg-slate-700 p-2 rounded overflow-auto">
                            <code {...props}>{children}</code>
                          </pre>
                        );
                      },
                      table({ node, ...props }) {
                        return (
                          <table className="border-collapse border border-gray-300 dark:border-slate-600" {...props} />
                        );
                      },
                      th({ node, ...props }) {
                        return <th className="border border-gray-300 dark:border-slate-600 p-2" {...props} />;
                      },
                      td({ node, ...props }) {
                        return <td className="border border-gray-300 dark:border-slate-600 p-2" {...props} />;
                      },
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 p-4 rounded-xl border border-white/20 dark:border-slate-700/20 shadow-lg">
              Start a new conversation!
            </p>
          </div>
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-lg p-4 rounded-2xl shadow-lg max-w-[80%] mr-8">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message... (Press Enter to send, Shift + Enter for new line)"
          className="w-full px-4 py-3 pr-12 rounded-xl backdrop-blur-xl bg-white/70 dark:bg-slate-800/70 border border-white/20 dark:border-slate-700/20 shadow-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-white resize-none"
          rows="3"
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all duration-200 ${
            input.trim()
              ? 'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 dark:hover:bg-blue-500/5'
              : 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}

export default Chat;
