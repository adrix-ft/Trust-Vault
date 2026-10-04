import { useState } from 'react';
import { Globe, Shield, ExternalLink, Code2, ShieldAlert } from 'lucide-react';
import ContactModal from './ContactModal';
import FooterModal from './FooterModal';

export default function Footer() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<'discount' | 'privacy' | 'legal' | 'terms' | 'about' | null>(null);

  return (
    <footer className="mt-20 border-t border-[#E5E7EB]/80 bg-[#F9FAFB] pt-10 pb-8 relative text-[#4B5563]">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24">

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-[#E5E7EB]/40 items-start">

          {/* Brand & Terms Badge (Cols 1-5) */}
          <div className="md:col-span-5 flex flex-col space-y-3">

            {/* MATCHED BRAND NAME */}
            <div className="flex items-center gap-1.5 whitespace-nowrap mb-1">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-gray-900">
                Trust Vault
              </span>
            </div>

            <p className="text-xs text-[#4B5563] leading-relaxed max-w-sm">
              Your ultimate destination for next-gen gaming deals. Instant access and guaranteed trust for PC and PlayStation gamers.
            </p>

          </div>

          {/* Inline Quick Links (Cols 6-12) */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">

            <div className="flex flex-col space-y-2.5">
              <span className="text-gray-900 font-bold uppercase tracking-wider text-[11px]">Policies</span>
              <button onClick={() => setActiveModal('discount')} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                Discount Policy
              </button>
              <button onClick={() => setActiveModal('privacy')} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => setActiveModal('terms')} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                Terms & Conditions
              </button>
            </div>

            <div className="flex flex-col space-y-2.5">
              <span className="text-gray-900 font-bold uppercase tracking-wider text-[11px]">Support</span>

              {/* RESTORED NORMAL CONTACT BUTTON */}
              <button onClick={() => setIsContactModalOpen(true)} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                Contact Us
              </button>

              <button onClick={() => setActiveModal('legal')} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                Legal & Copyright
              </button>
              <button onClick={() => setActiveModal('about')} className="text-left hover:text-gray-900 transition-colors bg-transparent border-none p-0 text-[#4B5563] cursor-pointer">
                About Us
              </button>
            </div>

            <div className="flex flex-col space-y-2.5 col-span-2 sm:col-span-1">
              <span className="text-gray-900 font-bold uppercase tracking-wider text-[11px]">System</span>
              <div className="flex items-center gap-2 text-[#4B5563] hover:text-gray-900 transition-colors cursor-pointer">
                <span className="w-3.5 h-2.5 bg-blue-600 rounded-sm relative overflow-hidden inline-block border border-[#D1D5DB]">
                  <span className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-600" />
                </span>
                <span>English</span>
                <Globe className="w-3 h-3 opacity-70" />
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[11px]">
          <div className="text-[#D1D5DB]">
            &copy; {new Date().getFullYear()} Trust Vault. All Rights Reserved.
          </div>

          {/* UPDATED GITHUB LINK */}
          <a
            href="https://github.com/adrix-ft"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-lg bg-[#FFFFFF]/80 border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all flex items-center gap-2.5 group shadow-sm"
          >
            <div className="w-5 h-5 rounded-full bg-[#F9FAFB] border border-[#E5E7EB] flex items-center justify-center text-[#1F2937]">
              <Code2 className="w-2.5 h-2.5" />
            </div>
            <div className="text-left">
              <div className="text-[8px] uppercase tracking-wider text-[#4B5563]">Created & Managed by</div>
              <div className="text-[11px] text-[#1F2937] font-bold flex items-center gap-1 group-hover:text-gray-900">
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
