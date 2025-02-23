// frontend/src/pages/Auth.jsx
import React, { useState } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect, // Replace signInWithPopup
  GoogleAuthProvider,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        navigate('/username-setup');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider); // Use redirect instead of popup
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {isSignup ? 'Sign Up' : 'Login'}
        </h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 rounded mb-4"
          >
            {isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <button
          onClick={handleGoogleSignIn}
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 rounded mb-4"
        >
          Sign in with Google
        </button>
        <p className="text-center">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-blue-500"
          >
            {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;