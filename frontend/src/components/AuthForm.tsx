import React, { useState } from 'react';
import { authAPI } from '../api/authService';
import { setAuthToken } from '../utils/storage';

export const AuthForm = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // New: loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        // LOGIN FLOW
        const data = await authAPI.login(email, password);
        await setAuthToken(data.access_token);
        // This triggers the parent (App.tsx) to switch to <Dashboard />
        onAuthSuccess(); 
      } else {
        // SIGNUP FLOW
        await authAPI.signup(email, password);
        alert("Account created! Now please log in with your credentials.");
        
        // Reset fields for security/clarity
        setPassword(''); 
        setIsLogin(true); // Redirect to login view
      }
    } catch (err) {
      alert("Authentication failed. Please check your details or connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 w-72 bg-white">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black text-gray-800 uppercase tracking-tighter">
          {isLogin ? 'Welcome Back' : 'Join Us'}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {isLogin ? 'Log in to manage your reminders' : 'Start your spaced-repetition journey'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          type="email" 
          placeholder="Email Address" 
          required
          className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
          value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          required
          className="border border-gray-200 p-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-black" 
          value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button 
          type="submit" 
          disabled={loading}
          className={`bg-black text-white p-2.5 rounded-md font-bold transition-all ${loading ? 'opacity-50' : 'hover:bg-gray-800'}`}
        >
          {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-gray-100 text-center">
        <button 
          onClick={() => {
            setIsLogin(!isLogin);
            setPassword(''); // Clear password when toggling
          }}
          className="text-xs font-semibold text-gray-400 hover:text-black transition-colors"
        >
          {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
        </button>
      </div>
    </div>
  );
};