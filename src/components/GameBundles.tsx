import { useState, useEffect, useRef } from 'react';
import SectionHeader from './SectionHeader';
import { useStore, matchesPlatform } from '../context/StoreContext';
import { ShoppingCart, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';
import PlatformTags from './PlatformTags';

export default function GameBundles() {
  const { addToCart, catalog, platformFilter } = useStore();
  const sliderRef = useRef<HTMLDivElement>(null);

  const bundleProducts = catalog.filter(game => {
    const isBundle = game.categories?.some(cat => cat.toLowerCase() === 'bundles');
    if (!isBundle) return false;

    if (!matchesPlatform(game.categories, platformFilter)) return false;
    return true;
  });

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [platformFilter]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -500 : 500;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!loading && bundleProducts.length === 0) return null;

  return (
    <section className="relative">
      <div className="flex items-center justify-between mb-6">
        <SectionHeader title="EXCLUSIVE GAME BUNDLES" />
        
        {/* Navigation arrows appear when there are more than 2 bundles */}
        {bundleProducts.length > 2 && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => handleScroll('left')}
              className="p-2 rounded-xl bg-[#11212D] border border-[#253745] hover:border-[#4A5C6A] text-[#9BA8AB] hover:text-white transition-all shadow-md cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-2 rounded-xl bg-[#11212D] border border-[#253745] hover:border-[#4A5C6A] text-[#9BA8AB] hover:text-white transition-all shadow-md cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 
        Single row horizontal slider.
        Desktop shows exactly 2 cards side-by-side (min-w-[calc(50%-12px)]).
      */}
      <div 
        ref={sliderRef}
        className="flex gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory py-6 -my-6 px-1 -mx-1 scroll-smooth"
      >
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="min-w-full md:min-w-[calc(50%-12px)] flex flex-col md:flex-row bg-[#11212D] border border-[#253745] rounded-3xl overflow-hidden shadow-2xl animate-pulse snap-center">
              <div className="w-full md:w-[45%] h-64 md:h-auto bg-[#253745]" />
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                <div className="h-6 bg-[#253745] rounded w-3/4 mb-4" />
                <div className="space-y-2 mb-6">
                  <div className="h-4 bg-[#253745] rounded w-full" />
                  <div className="h-4 bg-[#253745] rounded w-5/6" />
                </div>
                <div className="h-10 bg-[#253745] rounded w-1/2" />
              </div>
            </div>
          ))
        ) : (
          bundleProducts.map((bundle) => {
          const includedTitles = bundle.description?.split(',').map(t => t.trim()) || [];
          const includedGames = includedTitles
            .map(title => catalog.find(g => g.title.toLowerCase() === title.toLowerCase()))
            .filter(Boolean);
          const fallbackCover = bundle.customCoverUrl || getGameCoverUrl(bundle.title);

          const isCrowded = includedGames.length > 3;
          const glowImage = includedGames[0]?.customCoverUrl || getGameCoverUrl(includedGames[0]?.title || bundle.title);

          return (
            <div 
              key={bundle.title} 
              className="relative min-w-[85vw] sm:min-w-[450px] lg:min-w-[calc(50%-12px)] max-w-[calc(50%-12px)] shrink-0 snap-start transition-all duration-300 hover:-translate-y-1 group z-10 hover:z-20"
            >
              {/* Refined Ambient Glow: Toned down slightly so it doesn't create harsh borders */}
              <div 
                className="absolute -inset-2 z-[-1] opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-500 bg-cover bg-center rounded-2xl pointer-events-none"
                style={{ backgroundImage: `url('${glowImage}')` }}
              />

              <div className="bg-gradient-to-br from-[#11212D] to-[#06141B] rounded-2xl border border-[#253745] group-hover:border-[#4A5C6A] p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shadow-xl group-hover:shadow-2xl h-full transition-colors relative z-10 overflow-hidden">
                <PlatformTags platforms={bundle.categories} />
                
                {/* Left Side Visual Fan */}
                <div className="flex items-center justify-center shrink-0 w-full sm:w-[200px] xl:w-[220px] h-[180px] sm:h-[210px] relative mt-2 sm:mt-0">
                  {includedGames.length > 0 ? (
                    <div className="relative w-full h-full flex items-center justify-center">
                      {includedGames.map((game, i) => {
                        const offset = i - (includedGames.length - 1) / 2;
                        const translateX = offset * (isCrowded ? 18 : 30); 
                        const rotate = offset * (isCrowded ? 4 : 7);
                        
                        return (
                          <div 
                            key={i} 
                            className={`rounded-xl overflow-hidden border border-[#253745] shadow-2xl absolute transition-all duration-500 group-hover:scale-105 ease-out ${
                              isCrowded ? 'w-22 sm:w-26 h-34 sm:h-38' : 'w-26 sm:w-30 h-38 sm:h-42'
                            }`}
                            style={{ 
                              backgroundImage: `url('${game?.customCoverUrl || getGameCoverUrl(game?.title || '')}')`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                              zIndex: 10 + i,
                              transform: `translateX(${translateX}px) rotate(${rotate}deg)`
                            }}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div 
                      className="w-28 h-40 rounded-xl overflow-hidden border border-[#253745] shadow-2xl transition-transform duration-500 group-hover:scale-105"
                      style={{ backgroundImage: `url('${fallbackCover}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                  )}
                </div>

                {/* Right Side Content */}
                <div className="flex-1 flex flex-col justify-center text-center sm:text-left w-full min-w-0">
                  <div className="relative overflow-hidden inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-[#06141B] text-[9px] font-black py-1 px-3 rounded-full uppercase tracking-widest mb-2.5 self-center sm:self-start shadow-md shrink-0">
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none" />
                    <span className="relative z-10">Bundle Deal</span>
                  </div>
                  
                  <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider mb-2 leading-tight drop-shadow-md truncate">
                    {bundle.title}
                  </h3>
                  
                  <div className="text-xs font-semibold text-[#CCD0CF] mb-3 space-y-1 bg-[#06141B]/50 p-2.5 rounded-xl border border-[#253745] max-h-[85px] overflow-y-auto hide-scrollbar">
                    <span className="text-[#4A5C6A] uppercase tracking-wider text-[9px] block mb-0.5">Items Included:</span>
                    {includedGames.length > 0 ? (
                      includedGames.map((g, i) => (
                        <div key={i} className="flex items-center gap-1.5 justify-center sm:justify-start">
                          <Plus className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate text-[11px]">{g?.title}</span>
                        </div>
                      ))
                    ) : (
                      <p className="line-clamp-2 text-[#9BA8AB] font-normal text-[11px]">{bundle.description || 'Amazing games bundled together!'}</p>
                    )}
                  </div>

                  <div className="mt-auto pt-2.5 border-t border-[#253745]/60 flex items-center justify-between gap-2">
                    <div className="flex flex-col items-start min-w-0">
                      {bundle.originalPrice && (
                        <span className="text-[10px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{bundle.originalPrice}</span>
                      )}
                      <span className="text-lg sm:text-xl font-black text-white tracking-wider truncate">{bundle.price}</span>
                    </div>
                    
                    <button 
                      onClick={() => addToCart(bundle)}
                      className="relative overflow-hidden bg-[#253745] hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold uppercase tracking-wider text-xs transition-all duration-300 shadow-lg border border-[#4A5C6A] hover:border-green-500 shrink-0 group/btn"
                    >
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer pointer-events-none" />
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Buy</span>
                      </span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          );
        })
        )}
      </div>
    </section>
  );
}