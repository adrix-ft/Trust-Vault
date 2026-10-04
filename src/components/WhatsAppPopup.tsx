import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Gift, Sparkles } from 'lucide-react';

export default function WhatsAppPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show pop-up after a slight delay for better UX
    const timer = setTimeout(() => {
      const hasSeenPopup = sessionStorage.getItem('hasSeenWAPopup');
      if (!hasSeenPopup) {
        setIsOpen(true);
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenWAPopup', 'true');
  };

  const handleJoin = () => {
    sessionStorage.setItem('hasSeenWAPopup', 'true');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-gradient-to-b from-[#FFFFFF] to-[#F9FAFB] rounded-3xl border border-cyan-500/30 shadow-[0_0_40px_rgba(34,211,238,0.15)] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 text-[#4B5563] hover:text-gray-900 transition-colors border border-white/10"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Image / Pattern Area */}
              <div className="h-32 w-full bg-gradient-to-r from-cyan-900/40 to-emerald-900/40 relative overflow-hidden flex items-center justify-center border-b border-[#E5E7EB]">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
                
                {/* Glowing Orbs */}
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-cyan-500/30 rounded-full blur-[40px]"></div>
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-emerald-500/30 rounded-full blur-[40px]"></div>

                {/* WhatsApp Icon Circle */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                  className="relative z-10 w-16 h-16 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(37,211,102,0.4)] border-4 border-[#FFFFFF]"
                >
                  <svg className="w-8 h-8 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                  </svg>
                </motion.div>
              </div>

              {/* Content */}
              <div className="p-8 text-center">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-black text-gray-900 uppercase tracking-widest mb-3 drop-shadow-md"
                >
                  Join Our Community
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[#4B5563] text-sm mb-8 leading-relaxed font-medium"
                >
                  Don't miss out! Get exclusive access to the <span className="text-cyan-400 font-bold">latest updates</span>, <span className="text-emerald-400 font-bold">hidden discounts</span>, and early game releases.
                </motion.p>

                {/* Features List */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col gap-3 mb-8 text-left"
                >
                  <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] shadow-inner">
                    <div className="bg-cyan-500/10 p-2 rounded-lg text-cyan-400">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Instant Restock Alerts</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] shadow-inner">
                    <div className="bg-emerald-500/10 p-2 rounded-lg text-emerald-400">
                      <Gift className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Members-Only Deals</span>
                  </div>
                  <div className="flex items-center gap-3 bg-[#F9FAFB] rounded-xl p-3 border border-[#E5E7EB] shadow-inner">
                    <div className="bg-purple-500/10 p-2 rounded-lg text-purple-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-wide">Connect with Gamers</span>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <a
                    href="https://chat.whatsapp.com/JLfUrgzjAL885hMN6DFUfT"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleJoin}
                    className="group relative flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#128C7E] to-[#25D366] hover:from-[#25D366] hover:to-[#128C7E] text-white py-4 rounded-xl font-black uppercase tracking-widest text-[13px] transition-all overflow-hidden mb-4 shadow-lg shadow-[#25D366]/20 border border-[#25D366]/50"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      Join WhatsApp Group
                    </span>
                  </a>
                  
                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-xs font-bold text-[#D1D5DB] hover:text-gray-900 uppercase tracking-wider transition-colors focus:outline-none"
                  >
                    Maybe Later
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
