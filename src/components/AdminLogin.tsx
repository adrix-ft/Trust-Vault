import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLogin() {
  const { setIsAdmin, showAdminLogin, setShowAdminLogin } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        localStorage.setItem('gaming_admin', 'true');
      } else {
        setError('Invalid username or password. Access denied.');
        setPassword('');
      }
    } catch (err) {
      setError('Could not connect to server.');
    }
  };

  if (!showAdminLogin) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-sm"
          onClick={() => setShowAdminLogin(false)}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#11212D] border border-[#253745] rounded-xl p-8 shadow-[0_0_50px_rgba(6,20,27,0.8)] w-full max-w-md relative z-10"
        >
          <button 
            onClick={() => setShowAdminLogin(false)} 
            className="absolute top-4 right-4 text-[#9BA8AB] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-black tracking-wider text-[#CCD0CF] uppercase mb-6 text-center">
            Admin Access
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm font-bold text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase tracking-wide">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#06141B] border border-[#253745] rounded p-3 text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#06141B] border border-[#253745] rounded p-3 text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#253745] hover:bg-[#4A5C6A] text-white px-4 py-4 rounded font-black uppercase tracking-widest text-sm transition-colors mt-2 shadow-lg"
            >
              Secure Login
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}