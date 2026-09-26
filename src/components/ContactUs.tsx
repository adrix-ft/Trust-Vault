import { MessageCircle, Send, Phone, Mail, Navigation } from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function ContactUs() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <SectionHeader title="CONTACT US" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct WhatsApp Card */}
        <div className="bg-[#11212D] border border-[#253745] p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-[#CCD0CF] uppercase tracking-wider">Chat on WhatsApp</h3>
            <p className="text-sm text-[#9BA8AB] leading-relaxed">
              Have questions about a game, need help with an order, or looking for a title not listed in the store? Reach out to us directly on WhatsApp for instant support!
            </p>
          </div>
          
          <div className="mt-8">
            <a 
              href="https://wa.me/918824647379?text=Hey%20Store Vault%20Game%20Store,%20I%20need%20some%20help!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>
        </div>

        {/* Telegram Card */}
        <div className="bg-[#11212D] border border-[#253745] p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Navigation className="w-6 h-6 rotate-45" />
            </div>
            <h3 className="text-xl font-black text-[#CCD0CF] uppercase tracking-wider">Join on Telegram</h3>
            <p className="text-sm text-[#9BA8AB] leading-relaxed">
              Connect with us on Telegram for updates, direct messaging, and community support regarding your favorite game titles.
            </p>
          </div>
          
          <div className="mt-8">
            <a 
              href="https://telegram.me/storevault"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Open Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Store Support Info Card */}
      <div className="bg-[#11212D] border border-[#253745] p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#253745] border border-[#4A5C6A]/50 flex items-center justify-center text-[#CCD0CF]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[#CCD0CF] uppercase tracking-wider">Quick Support Details</h3>
          </div>
          <p className="text-sm text-[#9BA8AB]">Support Line: +91 88246 47379 • Fast response via WhatsApp & Telegram</p>
        </div>
        
        <div className="text-xs text-[#4A5C6A] font-bold uppercase tracking-wider bg-[#06141B] px-4 py-3 rounded-xl border border-[#253745]">
          Store Vault Team
        </div>
      </div>
    </div>
  );
}