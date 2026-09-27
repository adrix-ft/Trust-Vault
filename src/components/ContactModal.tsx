import React from 'react';
import { X, MessageCircle, Send } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  const handleWhatsAppClick = () => {
    window.open('https://chat.whatsapp.com/Gfn8TCwmoDtIHaoff5HIot?s=sh&p=i&mlu=4&amv=1', '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#11212D] border border-[#253745] rounded-xl w-full max-w-md p-6 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-[#9BA8AB] hover:text-[#CCD0CF] transition-colors bg-[#06141B] p-1.5 rounded-full border border-[#253745]"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 mt-2">
          <h3 className="text-xl font-black text-[#CCD0CF] uppercase tracking-wider">Get in Touch</h3>
          <p className="text-xs text-[#9BA8AB] mt-1">Choose your preferred platform to connect with us</p>
        </div>

        <div className="space-y-3">
          {/* WhatsApp Option */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-[#06141B] border border-[#253745] hover:border-[#4A5C6A] hover:bg-[#192b38] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#25D366]/20 flex items-center justify-center text-[#25D366] group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold text-[#CCD0CF] uppercase tracking-wide">WhatsApp</div>
                <div className="text-[11px] text-[#9BA8AB]">Join our community group</div>
              </div>
            </div>
            <span className="text-xs font-semibold text-[#25D366] uppercase tracking-wider bg-[#25D366]/10 px-3 py-1 rounded-full border border-[#25D366]/20">Join</span>
          </button>
        </div>

      </div>
    </div>
  );
}