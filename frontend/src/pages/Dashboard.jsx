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

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        try {
          const response = await axios.get(`/api/users/${user.uid}`);
          setUsername(response.data?.username || '');
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      } else {
        setUser(null);
        navigate('/auth');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar userId={user?.uid} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex justify-end p-4 border-b">
          <button onClick={toggleModal}>
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <span className="text-2xl">👤</span>
            )}
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
          <Chat userId={user?.uid} />
        </div>
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