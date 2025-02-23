// frontend/src/pages/UsernameSetup.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function UsernameSetup() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (auth.currentUser) {
        const payload = {
          userId: auth.currentUser.uid,
          username: username,
          email: auth.currentUser.email,
        };
        console.log('Sending to backend:', payload);
        const response = await axios.post('http://localhost:5000/api/users', payload);
        console.log('Backend response:', response.data);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Username setup error:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      alert(`Failed to set username: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          Set Your Username
        </h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded"
          >
            Set Username
          </button>
        </form>
      </div>
    </div>
  );
}

export default UsernameSetup;