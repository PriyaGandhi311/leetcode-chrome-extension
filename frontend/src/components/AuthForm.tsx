import React, { useState } from 'react';
import { authAPI } from '../api/authService';
import { setAuthToken } from '../utils/storage';

export const AuthForm = ({ onAuthSuccess }: { onAuthSuccess: () => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const data = await authAPI.login(email, password);
        await setAuthToken(data.access_token);
      } else {
        await authAPI.signup(email, password);
        alert("Account created! Please login.");
        setIsLogin(true);
        return;
      }
      onAuthSuccess();
    } catch (err) {
      alert("Authentication failed. Check your credentials.");
    }
  };

  return (
    <div className="p-4 w-64">
      <h2 className="text-xl font-bold mb-4">{isLogin ? 'Login' : 'Sign Up'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input 
          type="email" placeholder="Email" 
          className="border p-2" value={email}
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" 
          className="border p-2" value={password}
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>
      <button 
        onClick={() => setIsLogin(!isLogin)}
        className="text-sm mt-4 text-gray-600 underline"
      >
        {isLogin ? "Need an account? Sign up" : "Have an account? Login"}
      </button>
    </div>
  );
};