import { useState, useEffect } from 'react';
import { useStore, matchesPlatform } from '../context/StoreContext';
import { Play, ShoppingCart } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';
import { motion, AnimatePresence } from 'motion/react';
import PlatformTags from './PlatformTags';

export default function Promos() {
  const { addToCart, catalog, platformFilter, setPlayingTrailerUrl } = useStore();

  const filteredCatalog = catalog.filter(game => {
    if (!matchesPlatform(game.categories, platformFilter)) return false;
    return true;
  });

  let promoGames = filteredCatalog.filter(game => game.isFeaturedPromo).slice(0, 5);
  if (promoGames.length === 0) promoGames = filteredCatalog.slice(0, 5);
  else if (promoGames.length < 5) {
    const additional = filteredCatalog.filter(game => !game.isFeaturedPromo).slice(0, 5 - promoGames.length);
    promoGames = [...promoGames, ...additional];
  }

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (promoGames.length === 0) return;
    setActiveIndex(0);
  }, [catalog]);

  if (promoGames.length === 0) return null;
  const activePromo = promoGames[activeIndex] || promoGames[0];

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:h-[360px]">
      
      {/* Selection Strip: Horizontal swipe on mobile, Vertical list on desktop */}
      <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory gap-3 pb-2 lg:pb-0 lg:flex-col lg:gap-4 order-2 lg:order-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {promoGames.map((game, idx) => (
          <div 
            key={game.title}
            onClick={() => setActiveIndex(idx)}
            className="flex-none snap-center w-[160px] sm:w-[200px] lg:w-auto lg:flex-1 bg-[#FCFBF6] rounded-xl lg:rounded-md relative overflow-hidden flex items-center justify-end px-4 lg:px-8 group cursor-pointer border transition-all duration-300 hover:scale-[1.03] lg:hover:-translate-y-1 h-[55px] lg:h-auto"
            style={{ borderColor: idx === activeIndex ? '#1F2937' : '#E5E7EB' }}
          >
            <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 saturate-[1.1] group-hover:scale-110" style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}></div>
            <div className="absolute inset-0 bg-gradient-to-l from-[#F5F4EE]/95 via-[#F5F4EE]/60 to-transparent pointer-events-none" />
            <span className="font-semibold text-[11px] lg:text-sm tracking-wider text-[#4B5563] group-hover:text-[#1F2937] relative z-10 uppercase drop-shadow-md text-right truncate w-full">
              {game.title}
            </span>
          </div>
        ))}
      </div>

      {/* Main Promo Video Card */}
      <div className="order-1 lg:order-2 h-[240px] sm:h-[300px] lg:h-full bg-[#FCFBF6] rounded-2xl lg:rounded-md relative overflow-hidden group flex flex-col items-center justify-center border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all shadow-xl">
        <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out saturate-[1.1]" style={{ backgroundImage: `url('${activePromo.customCoverUrl || getGameCoverUrl(activePromo.title)}')` }}></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#F5F4EE]/95 via-[#F5F4EE]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F5F4EE]/95 via-[#F5F4EE]/60 to-transparent pointer-events-none" />
        <PlatformTags platforms={activePromo.categories} tagColors={activePromo.tagColors} />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activePromo.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20"
          >
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 text-center w-full drop-shadow-md">
               <div className="text-[10px] sm:text-xs text-[#4B5563] mb-1 uppercase tracking-widest">Featured Game</div>
               <div className="text-lg sm:text-xl inline-block font-black tracking-widest uppercase border-b border-[#D1D5DB] pb-1 text-[#1F2937] truncate w-[90%] sm:w-64 px-4">{activePromo.title}</div>
            </div>
            
            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (activePromo.trailer) setPlayingTrailerUrl(activePromo.trailer);
                else alert('Trailer coming soon for ' + activePromo.title);
              }}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1F2937] backdrop-blur rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(204,208,207,0.1)] group-hover:scale-110 transition-all cursor-pointer pointer-events-auto z-10"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5F4EE] ml-1" fill="currentColor" />
            </div>
            
            <div className="absolute bottom-4 sm:bottom-6 text-center w-full z-10 px-4 flex flex-col items-center drop-shadow-md">
              <div className="text-[11px] sm:text-xs text-[#4B5563] mb-2 sm:mb-3 font-semibold tracking-widest">{activePromo.price}</div>
              <button 
                onClick={(e) => { e.stopPropagation(); addToCart(activePromo); }}
                className="flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-full bg-[#E5E7EB]/80 hover:bg-[#D1D5DB] border border-[#D1D5DB] text-[#1F2937] hover:text-gray-900 text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all pointer-events-auto shadow-lg backdrop-blur-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                BUY NOW
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
