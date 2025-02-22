import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          Welcome to Apex
        </h1>
        <p className="text-gray-700 mb-8 text-center">
          Experience the power of AI conversations.
        </p>
        <div className="flex justify-center">
          <Link
            to="/auth"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
          >
            Login / Signup
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Home;