// frontend/src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { auth } from './firebase';
import { onAuthStateChanged, getRedirectResult } from 'firebase/auth'; // Add getRedirectResult
import Home from './pages/Home';
import Auth from './pages/Auth';
import UsernameSetup from './pages/UsernameSetup';
import Dashboard from './pages/Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User signed in via redirect, set user and redirect will happen via routes
          setUser(result.user);
        }
      } catch (err) {
        console.error('Redirect sign-in error:', err);
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      }
      if (!loading) setLoading(false); // Avoid overwriting redirect loading state
    });

    handleRedirect(); // Check for redirect result on mount
    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Home /> : <Dashboard />} />
        <Route path="/auth" element={!user ? <Auth /> : <Dashboard />} />
        <Route path="/username-setup" element={user ? <UsernameSetup /> : <Auth />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Auth />} />
      </Routes>
    </Router>
  );
}

export default App;