import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  updateProfile,
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Moon, Sun, LogIn, UserPlus, Mail, Lock, Chrome, User } from 'lucide-react';
import axios from 'axios';

function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
          const { user } = result;
          console.log('Google Sign-In successful:', user);

          // Extract user data from Google profile
          const displayName = user.displayName || '';
          const [firstName = '', lastName = ''] = displayName.split(' '); // Split displayName into first/last
          const email = user.email;
          const username = firstName || email.split('@')[0]; // Use firstName or email prefix as username

          // Create user in backend
          const payload = {
            userId: user.uid,
            username,
            email,
            firstName,
            lastName,
          };
          console.log('Sending to backend:', payload);
          const response = await axios.post('http://localhost:5000/api/users', payload);
          console.log('Backend response:', response.data);

          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Redirect result error:', err.code, err.message);
        setError(err.message);
      }
    };
    handleRedirect();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      let userCredential;
      if (isSignup) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: `${firstName} ${lastName}`,
        });
        const payload = {
          userId: userCredential.user.uid,
          username,
          email: userCredential.user.email,
          firstName,
          lastName,
        };
        console.log('Sending to backend:', payload);
        const response = await axios.post('http://localhost:5000/api/users', payload);
        console.log('Backend response:', response.data);
        navigate('/dashboard');
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        navigate('/dashboard');
      }
      console.log('Email/Password Sign-In successful:', userCredential.user);
    } catch (err) {
      console.error('Authentication error:', err.code, err.message);
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      console.log('Initiating Google Sign-In with redirect');
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error('Google sign-in error:', err.code, err.message);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 transition-colors duration-300">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -left-48 -top-48 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] -right-48 -bottom-48 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
        aria-label="Toggle theme"
      >
        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
      </button>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/20">
          <h2 className="text-3xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-all duration-200"
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-all duration-200"
                  />
                </div>
              </>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-all duration-200"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent dark:text-white transition-all duration-200"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isSignup ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
              {isSignup ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white/70 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400">
                Or continue with
              </span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center gap-2"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            Continue with Google
          </button>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
            >
              {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
