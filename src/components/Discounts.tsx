import SectionHeader from './SectionHeader';
import { useStore } from '../context/StoreContext';
import { ShoppingCart, Clock } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';
import { useState } from 'react';

export default function Discounts() {
  const { addToCart, catalog, platformFilter, setSelectedCategory } = useStore();
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const discountGames = catalog.filter(game => {
    if (!game.onSale) return false;
    if (game.categories?.some(cat => cat.toLowerCase() === 'bundles')) return false;
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });

  if (discountGames.length === 0) return null;

  return (
    <section>
      <SectionHeader title="SPECIAL OFFERS" />
      
      {/* 
        FIXED: Added `md:overflow-visible` to stop clipping on desktop grids.
        Added `py-12 -my-12` for mobile swipe breathing room.
      */}
      <div className="flex md:grid md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 overflow-x-auto md:overflow-visible hide-scrollbar snap-x snap-mandatory py-12 -my-12 md:py-0 md:my-0 px-4 -mx-4 md:px-0 md:mx-0">
        {discountGames.slice(0, 5).map((game, idx) => {
          const isSelected = activeCard === game.title;
          const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);

          return (
            <div 
              key={game.title} 
              onClick={() => setActiveCard(isSelected ? null : game.title)}
              className="relative min-w-[220px] md:min-w-0 shrink-0 snap-center col-span-1 h-[260px] md:h-[280px] group cursor-pointer transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 hover:z-20 z-10"
            >
              {/* CINEMATIC AMBIENT GLOW */}
              <div 
                className="absolute -inset-3 z-[-1] opacity-0 group-hover:opacity-50 blur-2xl transition-opacity duration-500 bg-cover bg-center rounded-xl pointer-events-none"
                style={{ backgroundImage: `url('${coverUrl}')` }}
              />

              <div className={`absolute inset-0 rounded-xl overflow-hidden border border-[#253745] group-hover:border-[#4A5C6A] transition-colors bg-gradient-to-b ${idx % 2 === 0 ? 'from-[#11212D] to-[#06141B]' : 'from-[#253745] to-[#06141B]'}`}>
                <div className="absolute top-0 left-0 right-0 bg-green-500/90 backdrop-blur text-[9px] text-center py-1 font-black tracking-widest text-[#06141B] z-20 overflow-hidden">
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none" />
                  <span className="relative z-10">SALE</span>
                </div>

                <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out saturate-[1.1] contrast-[1.05] group-hover:scale-110 z-0" style={{ backgroundImage: `url('${coverUrl}')` }}></div>
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06141B]/95 via-[#06141B]/60 to-transparent pointer-events-none transition-opacity duration-300 z-0" />
                
                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end bg-transparent p-4">
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex-1 pr-2 text-left drop-shadow-md">
                      <div className="text-xs font-medium text-[#CCD0CF] line-clamp-2 tracking-wide mb-1 leading-tight">{game.title}</div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {game.originalPrice && (
                          <span className="text-[10px] text-red-400 font-bold line-through decoration-red-400/50">{game.originalPrice}</span>
                        )}
                        <span className="text-sm font-black text-[#CCD0CF] tracking-wider">{game.price}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory('Game: ' + game.title); }}
                      className={`w-8 h-8 rounded-full bg-[#253745]/90 flex items-center justify-center text-[#9BA8AB] transition-all duration-200 border border-transparent shrink-0 backdrop-blur-sm shadow-md ${isSelected ? 'opacity-0 scale-75' : 'group-hover:opacity-0'}`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className={`flex flex-col gap-1.5 transition-all duration-300 ${isSelected ? 'opacity-100 max-h-24 mt-2' : 'opacity-0 max-h-0 mt-0 group-hover:opacity-100 group-hover:max-h-24 group-hover:mt-2'}`}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory('Game: ' + game.title); }}
                      className="relative overflow-hidden w-full py-2 px-3 rounded-lg bg-[#253745] hover:bg-[#4A5C6A] border border-[#4A5C6A] text-[#CCD0CF] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg"
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy Now</span>
                      </span>
                    </button>

                    {game.isRentable && game.rentPrice && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedCategory('Game: ' + game.title); }}
                        className="relative overflow-hidden w-full py-2 px-3 rounded-lg bg-[#253745] hover:bg-[#4A5C6A] border border-[#4A5C6A] text-[#CCD0CF] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2 text-xs">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Rent</span>
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}