// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import EditProfileModal from '../components/EditProfileModal';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log('Auth state changed:', currentUser); // Debug log
      if (currentUser) {
        setUser(currentUser);
        try {
          const response = await axios.get(`http://localhost:5000/api/users/${currentUser.uid}`);
          if (!response.data?.username) {
            navigate('/username-setup');
          } else {
            setUsername(response.data.username);
          }
        } catch (err) {
          console.error('Error fetching username:', err);
          setError('Failed to fetch user data: ' + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setLoading(false);
        setLogoutLoading(false); // Reset logout loading
        console.log('Navigating to /auth from useEffect'); // Debug log
        navigate('/auth', { replace: true }); // Force redirect with replace
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    setLogoutLoading(true);
    setError(null);
    try {
      await signOut(auth);
      // Clear state and force redirect immediately
      setUser(null);
      setUsername('');
      setRefreshKey(0);
      setLogoutLoading(false);
      console.log('Logout completed, navigating to /auth'); // Debug log
      navigate('/auth', { replace: true }); // Immediate redirect
    } catch (err) {
      console.error('Logout error:', err);
      setError('Logout failed: ' + err.message);
      setLogoutLoading(false);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleNewChat = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleMessageSent = () => {
    setRefreshKey(prev => prev + 1);
  };

  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500 text-lg">Loading...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500 text-lg">Error: {error}</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        userId={user?.uid}
        onNewChat={handleNewChat}
        refreshChats={refreshKey}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Chat Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleModal}
              className="focus:outline-none transition duration-200 hover:scale-105"
              title="Edit Profile"
            >
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-gray-300"
                />
              ) : (
                <span className="text-2xl bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center text-gray-600">👤</span>
              )}
            </button>
            <button
              onClick={handleLogout}
              disabled={logoutLoading}
              className={`bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-200 ${logoutLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Chat
            userId={user?.uid}
            onMessageSent={handleMessageSent}
            refreshKey={refreshKey}
          />
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