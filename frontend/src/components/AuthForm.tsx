import React, { useState } from 'react';
import { authAPI } from '../api/authService';
import { setAuthToken } from '../utils/storage';

export const AuthForm = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const data = await authAPI.login(email, password);
        await setAuthToken(data.access_token);
        onAuthSuccess();
      } else {
        await authAPI.signup(email, password);
        alert("Account created! Now please log in.");
        setPassword('');
        setIsLogin(true);
      }
    } catch (err) {
      alert("Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h2 className="text-xl font-medium text-gray-900 tracking-tight mb-2">
          {isLogin ? 'Welcome back' : 'Join LeetRemind'}
        </h2>
        <p className="text-sm text-gray-500">
          {isLogin ? 'Enter your details to access your reminders' : 'Start your spaced-repetition journey'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Email</label>
          <input
            type="email"
            placeholder="hello@example.com"
            required
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            required
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 rounded text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? 'Processing...' : isLogin ? 'Log in' : 'Sign up'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setPassword('');
          }}
          className="text-xs text-gray-500 hover:text-gray-900 transition-colors underline underline-offset-2"
        >
          {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
};