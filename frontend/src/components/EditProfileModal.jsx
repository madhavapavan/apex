import React from 'react';
import axios from 'axios';

function EditProfileModal({ isOpen, onClose, username, setUsername, userId }) {
  if (!isOpen) return null;

  const handleUsernameChange = async () => {
    try {
      await axios.post(`/api/users`, {
        userId: userId,
        username: username,
        email: "", // email not needed for update.
      });
      onClose();
    } catch (error) {
      console.error('Error changing username:', error);
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end">
          <button
            onClick={handleUsernameChange}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
          >
            Save
          </button>
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditProfileModal;