import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import EditProfileModal from '../components/EditProfileModal';
import axios from 'axios';
import { Moon, Sun, Menu, X } from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const inactivityTimeoutRef = useRef(null); // Ref to store inactivity timeout

  // Inactivity timeout duration (5 minutes in milliseconds)
  const INACTIVITY_LIMIT = 15 * 60 * 1000; // 5 minutes

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchUsernameWithRetry = async (uid, retries = 3, delayMs = 3000) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(`https://apex-backend-2ptl.onrender.com/api/users/${uid}`, {
          timeout: 20000,
        });
        return response.data.username || uid.email?.split('@')[0];
      } catch (err) {
        console.error(`Attempt ${attempt} - Error fetching username:`, err);
        if (
          attempt < retries &&
          (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED')
        ) {
          console.log(`Retrying in ${delayMs}ms...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          throw err;
        }
      }
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('Auth state changed:', currentUser);
      if (currentUser) {
        setUser(currentUser);
        try {
          const fetchedUsername = await fetchUsernameWithRetry(currentUser.uid);
          setUsername(fetchedUsername);
        } catch (err) {
          console.error('Error fetching username:', err);
          if (err.response?.status === 404) {
            setUsername(currentUser.email?.split('@')[0]);
          } else {
            setError('Failed to fetch user data: ' + err.message);
            setUsername(currentUser.email?.split('@')[0]);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setLogoutLoading(false);
        navigate('/auth', { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Handle browser close logout
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await signOut(auth);
        console.log('Logged out on browser close');
      } catch (err) {
        console.error('Error during browser close logout:', err);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Handle inactivity logout
  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      inactivityTimeoutRef.current = setTimeout(() => {
        handleLogout('Inactivity timeout after 5 minutes');
      }, INACTIVITY_LIMIT);
    };

    const handleActivity = () => {
      resetInactivityTimer();
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keypress', handleActivity);
    window.addEventListener('click', handleActivity);

    // Start the timer when the component mounts
    resetInactivityTimer();

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keypress', handleActivity);
      window.removeEventListener('click', handleActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSidebarOpen]);

  const handleLogout = async (reason = 'Manual logout') => {
    setLogoutLoading(true);
    setError(null);
    try {
      await signOut(auth);
      console.log(`Logout triggered: ${reason}`);
      setUser(null);
      setUsername('');
      setCurrentChatId(null);
      setLogoutLoading(false);
      navigate('/auth', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed: ' + err.message);
      setLogoutLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleNewChat = async () => {
    setCurrentChatId(null); // Reset to allow new chat creation
  };

  const handleChatSelect = (chatId) => {
    setCurrentChatId(chatId);
  };

  const handleChatCreated = (newChatId) => {
    setCurrentChatId(newChatId); // Update currentChatId when a new chat is created
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-blue-50 dark:bg-slate-900">
      <div className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 p-8 rounded-2xl shadow-2xl">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full"></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-blue-50 dark:bg-slate-900">
      <div className="backdrop-blur-lg bg-white/70 dark:bg-slate-800/70 p-8 rounded-2xl shadow-2xl text-red-500 dark:text-red-400">
        Error: {error}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-blue-50 dark:bg-slate-900 transition-colors duration-300">
      <div
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-30 w-80`}
      >
        <div className="h-full backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 shadow-2xl">
          <Sidebar
            userId={user?.uid}
            onNewChat={handleNewChat}
            onChatSelect={handleChatSelect}
            currentChatId={currentChatId}
          />
        </div>
      </div>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-white/20 dark:border-slate-700/20 shadow-lg z-20">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-white/20 dark:hover:bg-slate-800/20 rounded-lg transition-colors duration-200"
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                ) : (
                  <Menu className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                )}
              </button>
              <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                Chat Dashboard
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 hover:bg-white/20 dark:hover:bg-slate-800/20 rounded-lg transition-colors duration-200"
              >
                {darkMode ? (
                  <Sun className="w-6 h-6 text-yellow-500" />
                ) : (
                  <Moon className="w-6 h-6 text-slate-700" />
                )}
              </button>
              <button
                onClick={toggleModal}
                className="focus:outline-none transition duration-200 hover:scale-105"
                title="Edit Profile"
              >
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white/20 dark:border-slate-700/20"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
              <button
                onClick={() => handleLogout('Manual logout')}
                disabled={logoutLoading}
                className={`bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 ${
                  logoutLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {logoutLoading ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-hidden relative">
          <div className="absolute inset-0 overflow-y-auto p-6">
            <div className="max-w-4xl mx-auto h-full">
              <Chat
                userId={user?.uid}
                chatId={currentChatId}
                onChatCreated={handleChatCreated}
                darkMode={darkMode}
              />
            </div>
          </div>
        </main>
      </div>

      {isModalOpen && (
        <EditProfileModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          username={username}
          setUsername={setUsername}
          userId={user?.uid}
        />
      )}
    </div>
  );
}

export default Dashboard;
