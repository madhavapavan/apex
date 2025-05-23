import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

function Chat({ userId, chatId, onChatCreated, darkMode }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const backendUrl = 'https://apex-backend-2ptl.onrender.com';

  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId) {
        setMessages([]);
        setError(null);
        return;
      }
      try {
        const response = await axios.get(`${backendUrl}/api/chats/thread/${chatId}`);
        console.log('Chat thread response:', response.data);
        const fetchedMessages = response.data.messages || [];
        if (!Array.isArray(fetchedMessages)) {
          throw new Error('Messages is not an array');
        }
        setMessages(fetchedMessages);
        setError(null);
      } catch (error) {
        console.error('Error fetching chat thread:', error.message, error.response?.data);
        setError('Failed to load chat history: ' + (error.response?.data?.details || error.message));
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
      const response = await axios.post(`${backendUrl}/api/chats`, {
        userId,
        message: input,
        chatId: chatId || undefined,
      });
      setIsTyping(false);
      const botReply = response.data.reply;
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
      if (!chatId && response.data.chatId) {
        onChatCreated(response.data.chatId); // Update parent with new chatId
      }
    } catch (error) {
      console.error('Error sending message:', error.message, error.response?.data);
      setError('Failed to send message: ' + (error.response?.data?.details || error.message));
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
                      code({ node, inline, className, children, ...props }) {
                        return inline ? (
                          <code className="bg-gray-200 dark:bg-slate-700 px-1 py-0.5 rounded text-sm" {...props}>
                            {children}
                          </code>
                        ) : (
                          <pre className="bg-gray-200 dark:bg-slate-700 p-3 rounded-lg overflow-auto text-sm">
                            <code className={className} {...props}>{children}</code>
                          </pre>
                        );
                      },
                      h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mt-4 mb-2" {...props} />,
                      h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-3 mb-2" {...props} />,
                      h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-2 mb-1" {...props} />,
                      ul: ({ node, ...props }) => <ul className="list-disc pl-6 mb-4" {...props} />,
                      ol: ({ node, ...props }) => <ol className="list-decimal pl-6 mb-4" {...props} />,
                      li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                      table: ({ node, ...props }) => (
                        <table className="border-collapse border border-gray-300 dark:border-slate-600 my-4 w-full" {...props} />
                      ),
                      th: ({ node, ...props }) => (
                        <th className="border border-gray-300 dark:border-slate-600 p-2 bg-gray-100 dark:bg-slate-700 font-semibold" {...props} />
                      ),
                      td: ({ node, ...props }) => (
                        <td className="border border-gray-300 dark:border-slate-600 p-2" {...props} />
                      ),
                      a: ({ node, ...props }) => (
                        <a className="text-blue-600 dark:text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                      ),
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
