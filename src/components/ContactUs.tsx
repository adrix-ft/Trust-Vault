import { MessageCircle, Send, Phone, Mail, Navigation } from 'lucide-react';
import SectionHeader from './SectionHeader';

export default function ContactUs() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <SectionHeader title="CONTACT US" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Direct WhatsApp Card */}
        <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/15 border border-green-500/30 flex items-center justify-center text-green-400">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-black text-[#1F2937] uppercase tracking-wider">Chat on WhatsApp</h3>
            <p className="text-sm text-[#4B5563] leading-relaxed">
              Have questions about a game, need help with an order, or looking for a title not listed in the store? Reach out to us directly on WhatsApp for instant support!
            </p>
          </div>

          <div className="mt-8">
            <a
              href="https://wa.me/918824647379?text=Hey%20Trust Vault%20Game%20Store,%20I%20need%20some%20help!"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>
        </div>


      </div>

      {/* Store Support Info Card */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between shadow-xl gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5E7EB] border border-[#D1D5DB]/50 flex items-center justify-center text-[#1F2937]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-[#1F2937] uppercase tracking-wider">Quick Support Details</h3>
          </div>
          <p className="text-sm text-[#4B5563]">Support Line: +91 88246 47379 • Fast response via WhatsApp</p>
        </div>

        <div className="text-xs text-[#D1D5DB] font-bold uppercase tracking-wider bg-[#F9FAFB] px-4 py-3 rounded-xl border border-[#E5E7EB]">
          Trust Vault Team
        </div>
      </div>
    </div>
  );
}
