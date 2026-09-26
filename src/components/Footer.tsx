import { useState } from 'react';
import { Globe, Shield, ExternalLink, Code2, ShieldAlert } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ContactModal from './ContactModal';
import FooterModal from './FooterModal';

export default function Footer() {
  const { setShowAdminLogin } = useStore();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'discount' | 'privacy' | 'legal' | 'terms' | 'about' | null>(null);

  return (
    <footer className="mt-20 border-t border-[#253745]/80 bg-[#06141B] pt-10 pb-8 relative text-[#9BA8AB]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">
        
        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#253745]/40 items-start">
          
          {/* Brand & Terms Badge (Cols 1-5) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            
            {/* MATCHED BRAND NAME */}
            <div className="flex items-center gap-1.5 whitespace-nowrap mb-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Store Vault
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-[#253745] border border-[#4A5C6A]/30 text-[#CCD0CF] whitespace-nowrap">
                GAME STORE
              </span>
            </div>

            <p className="text-xs text-[#9BA8AB] leading-relaxed max-w-sm">
              Your ultimate destination for next-gen gaming deals. Instant access and guaranteed trust for PC and PlayStation gamers.
            </p>
            <div className="inline-flex items-center gap-2 bg-[#11212D] border border-[#253745] px-3 py-1.5 rounded-lg text-xs w-fit">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[#CCD0CF]">
                <strong className="text-white">PC:</strong> Permanent | <strong className="text-white">PS5:</strong> 1 Month
              </span>
            </div>
          </div>

          {/* Inline Quick Links (Cols 6-12) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            
            <div className="flex flex-col space-y-2.5">
              <span className="text-white font-bold uppercase tracking-wider text-[11px]">Policies</span>
              <button onClick={() => setActiveModal('discount')} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                Discount Policy
              </button>
              <button onClick={() => setActiveModal('privacy')} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setActiveModal('terms')} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                Terms & Conditions
              </button>
            </div>

            <div className="flex flex-col space-y-2.5">
              <span className="text-white font-bold uppercase tracking-wider text-[11px]">Support</span>
              
              {/* RESTORED NORMAL CONTACT BUTTON */}
              <button onClick={() => setIsContactModalOpen(true)} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                Contact Us
              </button>

              <button onClick={() => setActiveModal('legal')} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                Legal & Copyright
              </button>
              <button onClick={() => setActiveModal('about')} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] cursor-pointer">
                About Us
              </button>
            </div>

            <div className="flex flex-col space-y-2.5 col-span-2 sm:col-span-1">
              <span className="text-white font-bold uppercase tracking-wider text-[11px]">System</span>
              <div className="flex items-center gap-2 text-[#9BA8AB] hover:text-white transition-colors cursor-pointer">
                <span className="w-3.5 h-2.5 bg-blue-600 rounded-sm relative overflow-hidden inline-block border border-[#4A5C6A]">
                  <span className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600" />
                </span> 
                <span>English</span>
                <Globe className="w-3 h-3 opacity-70" />
              </div>
              <button onClick={() => setShowAdminLogin(true)} className="text-left hover:text-white transition-colors bg-transparent border-none p-0 text-[#9BA8AB] flex items-center gap-1.5 cursor-pointer">
                <Shield className="w-3 h-3 text-[#4A5C6A]" /> 
                <span>Admin Login</span>
              </button>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
          <div className="text-[#4A5C6A]">
            &copy; {new Date().getFullYear()} Store Vault. All Rights Reserved.
          </div>

          {/* UPDATED GITHUB LINK */}
          <a 
            href="https://github.com/adrix-ft" 
            target="_blank" 
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-[#11212D]/80 border border-[#253745] hover:border-[#4A5C6A] transition-all flex items-center gap-2.5 group shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-[#06141B] border border-[#253745] flex items-center justify-center text-[#CCD0CF]">
              <Code2 className="w-2.5 h-2.5" />
            </div>
            <div className="text-left">
              <div className="text-[8px] uppercase tracking-wider text-[#9BA8AB]">Created & Managed by</div>
              <div className="text-[11px] text-[#CCD0CF] font-bold flex items-center gap-1 group-hover:text-white">
                <span>Adarsh</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-60" />
              </div>
            </div>
          </a>
        </div>

      </div>

      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
      <FooterModal type={activeModal} onClose={() => setActiveModal(null)} />
    </footer>
  );
}