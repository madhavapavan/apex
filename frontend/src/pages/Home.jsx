// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Moon, Sun, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

function Home() {
  const [darkMode, setDarkMode] = useState(false);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 transition-colors duration-300">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] -left-48 -top-48 bg-blue-500/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute w-[500px] h-[500px] -right-48 -bottom-48 bg-purple-500/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Theme toggle */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg backdrop-blur-sm hover:scale-110 transition-transform duration-200"
        aria-label="Toggle theme"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-slate-700" />
        )}
      </button>

      {/* Main content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full backdrop-blur-lg bg-white/70 dark:bg-slate-900/70 p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/20">
          <div className="flex items-center justify-center mb-8">
            <Zap className="w-12 h-12 text-blue-600 dark:text-blue-400" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 ml-2">
              Apex
            </h1>
          </div>

          <p className="text-lg md:text-xl text-center text-slate-700 dark:text-slate-300 mb-8 leading-relaxed">
            Experience the next generation of AI conversations. Powered by cutting-edge technology 
            to deliver seamless and intelligent interactions.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900"
            >
              Login
            </Link>
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
              onClick={() => setIsSignup(true)} // Optional: Trigger signup state if reused in Auth.jsx
            >
              Sign Up
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                title: 'Smart AI',
                description: 'Advanced algorithms for natural conversations',
              },
              {
                title: 'Secure',
                description: 'Enterprise-grade security and privacy',
              },
              {
                title: 'Fast',
                description: 'Real-time responses with low latency',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-white/20 dark:border-slate-700/20 hover:transform hover:scale-105 transition-transform duration-200"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;