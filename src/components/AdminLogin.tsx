import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AdminLogin() {
  const { setIsAdmin, showAdminLogin, setShowAdminLogin } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://store-vault-backend.onrender.com';

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
          className="fixed inset-0 bg-[#F9FAFB]/90 backdrop-blur-sm"
          onClick={() => setShowAdminLogin(false)}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl p-8 shadow-[0_0_50px_rgba(6,20,27,0.8)] w-full max-w-md relative z-10"
        >
          <button 
            onClick={() => setShowAdminLogin(false)} 
            className="absolute top-4 right-4 text-[#4B5563] hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-black tracking-wider text-[#1F2937] uppercase mb-6 text-center">
            Admin Access
          </h2>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded mb-6 text-sm font-bold text-center uppercase tracking-wide">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-[#4B5563] text-xs font-bold mb-2 uppercase tracking-wide">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3 text-[#1F2937] focus:outline-none focus:border-[#D1D5DB] transition-colors"
                placeholder="Enter username"
                required
              />
            </div>
            <div>
              <label className="block text-[#4B5563] text-xs font-bold mb-2 uppercase tracking-wide">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded p-3 text-[#1F2937] focus:outline-none focus:border-[#D1D5DB] transition-colors"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#E5E7EB] hover:bg-[#D1D5DB] text-gray-900 px-4 py-4 rounded font-black uppercase tracking-widest text-sm transition-colors mt-2 shadow-lg"
            >
              Secure Login
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
