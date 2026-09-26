import React, { useState, useEffect } from 'react';
import SectionHeader from './SectionHeader';
import { ShieldCheck, Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

export default function PlayerReviews() {
  const [proofs, setProofs] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    async function fetchProofs() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/proofs`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          setProofs(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching proofs:', err);
      }
    }
    fetchProofs();
  }, []);

  if (proofs.length === 0) return null;

  const mainProof = proofs[activeIndex];
  const sideProofs = proofs.filter((_, idx) => idx !== activeIndex).slice(0, 2);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + proofs.length) % proofs.length);
  };
  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % proofs.length);
  };

  return (
    <section>
      <SectionHeader title="CUSTOMER PROOFS" />

      {/* MOBILE LAYOUT: Full-Bleed Swipe Carousel */}
      <div className="flex lg:hidden overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-4 -mx-4 px-4 pb-4">
        {proofs.map((proofUrl, index) => (
          <div 
            key={proofUrl}
            className="min-w-[85vw] sm:min-w-[320px] snap-center h-[320px] relative bg-[#11212D] rounded-2xl overflow-hidden border border-[#253745] flex flex-col justify-end group shadow-xl"
          >
            <div className="absolute inset-0 bg-cover bg-center saturate-[1.1]" style={{ backgroundImage: `url('${proofUrl}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-[#06141B]/70 to-transparent pointer-events-none" />
            
            <div className="p-5 relative z-10 w-full flex flex-col justify-end">
              <div className="flex items-center gap-1 mb-1 drop-shadow-md">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400" fill="currentColor" />)}
                <span className="text-[10px] text-amber-400 font-black ml-1">TRUSTED</span>
              </div>
              <div className="text-lg font-black text-white uppercase truncate w-full mb-1 drop-shadow-md leading-tight">Verified Delivery</div>
              <p className="text-[11px] text-[#9BA8AB] line-clamp-2 mb-3 leading-relaxed">
                Another successful deal! Fast delivery, secure transaction, and 100% customer satisfaction.
              </p>
              
              <div className="flex justify-between items-center w-full mt-2 pt-3 border-t border-[#253745]/60">
                <div className="text-xs font-black text-green-400 flex items-center gap-1 drop-shadow-md">
                  <ShieldCheck className="w-4 h-4" /> SECURE
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP LAYOUT: Asymmetrical Grid */}
      <div className="hidden lg:grid grid-cols-10 gap-4 items-stretch">
        
        {/* Large Proof Card */}
        <div className="col-span-6 bg-[#11212D] rounded-xl overflow-hidden border border-[#253745] flex group hover:border-[#4A5C6A] transition-all duration-300 hover:scale-[1.01] shadow-lg">
          <div className="w-[300px] h-full bg-[#06141B] relative flex items-center justify-center overflow-hidden shrink-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={mainProof}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-cover bg-center transition-all duration-500 group-hover:scale-110 saturate-[1.1]" 
                style={{ backgroundImage: `url('${mainProof}')` }}
              />
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#11212D]/30 to-[#11212D] pointer-events-none z-10" />
            
            <button onClick={handlePrev} className="absolute left-3 w-8 h-8 rounded-full bg-[#06141B]/80 flex items-center justify-center text-[#CCD0CF] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#4A5C6A] z-20">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={handleNext} className="absolute right-3 w-8 h-8 rounded-full bg-[#06141B]/80 flex items-center justify-center text-[#CCD0CF] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#4A5C6A] z-20">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex-1 p-7 flex flex-col justify-between relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                  key={mainProof}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <div className="pr-4 min-w-0">
                    <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-wide truncate">Verified Customer Deal</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-green-400 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> 100% Secure</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-2xl font-black text-white">TRUSTED</div>
                    <div className="flex gap-0.5 mt-0.5 justify-end">
                      {[1,2,3,4,5].map(i => <Star key={i} className="w-3 h-3 text-amber-400" fill="currentColor" />)}
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-[#9BA8AB] border-l-2 border-[#4A5C6A] pl-4 line-clamp-2 my-4">
                  Check out this recent successful delivery! We ensure all our transactions are fully secure and our customers are happy. Your trust is our priority.
                </div>
                
                <div className="mt-auto flex justify-end">
                  <a 
                    href={mainProof}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-6 py-2 rounded-full bg-[#253745] border border-[#4A5C6A] text-[#CCD0CF] text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 hover:bg-[#4A5C6A] hover:text-white shadow-lg"
                  >
                    View Proof <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Small Proof Slots */}
        <div className="col-span-4 grid grid-cols-2 gap-4">
          {sideProofs.map(proofUrl => (
            <div 
              key={proofUrl} 
              onClick={() => {
                const newIndex = proofs.indexOf(proofUrl);
                if (newIndex !== -1) setActiveIndex(newIndex);
              }}
              className="relative bg-[#11212D] rounded-xl overflow-hidden border border-[#253745] flex flex-col justify-end group cursor-pointer hover:border-[#4A5C6A] transition-all duration-300 hover:scale-[1.03] shadow-lg h-[340px]"
            >
              <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 saturate-[1.1] group-hover:scale-110" style={{ backgroundImage: `url('${proofUrl}')` }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-[#06141B]/70 to-transparent pointer-events-none" />
              
              <div className="p-4 relative z-10 w-full flex flex-col justify-end">
                <div className="text-xs font-bold text-white uppercase truncate w-full mb-2 drop-shadow-md">Recent Delivery</div>
                <div className="flex justify-between items-center w-full">
                  <div className="text-xs font-black text-green-400 flex items-center gap-1 drop-shadow-md">
                    <ShieldCheck className="w-3 h-3" /> SECURE
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}