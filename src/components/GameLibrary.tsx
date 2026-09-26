import SectionHeader from './SectionHeader';
import { ShoppingCart, Check, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { getGameCoverUrl } from '../utils/image';

export default function GameLibrary() {
  const { selectedCategory, setSelectedCategory, addToCart, cart, catalog, platformFilter, catalogLoaded } = useStore();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  
  const [visibleCount, setVisibleCount] = useState(() => window.innerWidth < 768 ? 10 : 30);

  useEffect(() => {
    setVisibleCount(window.innerWidth < 768 ? 10 : 30);
  }, [selectedCategory, platformFilter]);

  const filteredGames = catalog.filter(game => {
    if (game.categories?.some(cat => cat.toLowerCase() === 'bundles')) return false;
    if (!game.categories?.includes(selectedCategory)) return false;
    if (platformFilter !== 'All') {
      const matchesStrict = game.categories?.some(cat => String(cat).toUpperCase() === platformFilter.toUpperCase());
      if (!matchesStrict) return false;
    }
    return true;
  });

  const displayedGames = filteredGames.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGames.length;

  return (
    <section>
      <SectionHeader title={selectedCategory.toUpperCase() + (selectedCategory === 'Store' ? " CATALOG" : "")} />

      <div className="relative min-h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            
            {/* UPGRADE: SKELETON SWEEP ANIMATION */}
            {!catalogLoaded && Array.from({ length: 10 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`}
                className="bg-[#11212D] border border-[#253745] rounded-xl overflow-hidden flex flex-col relative"
              >
                <div className="absolute inset-0 z-20 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep pointer-events-none" />
                <div className="aspect-[3/4] w-full bg-[#06141B]" />
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="h-4 bg-[#253745] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#253745] rounded w-1/2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-[#253745] rounded w-1/3" />
                    <div className="w-8 h-8 rounded-full bg-[#253745]" />
                  </div>
                </div>
              </div>
            ))}

            {catalogLoaded && displayedGames.map((game, index) => {
              const inCart = cart.some(item => item.title === game.title);
              const isSelected = selectedGame === game.title;
              const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);
              
              return (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: (index % 30) * 0.02 }}
                  key={game.title}
                  onClick={() => setSelectedCategory('Game: ' + game.title)}
                  // Removed overflow-hidden from parent so glow can escape
                  className={`relative transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl group flex flex-col cursor-pointer will-change-transform z-10 hover:z-20`}
                >
                  
                  {/* UPGRADE: CINEMATIC AMBIENT GLOW (PS5 Effect) */}
                  <div 
                    className="absolute -inset-2.5 z-[-1] opacity-0 group-hover:opacity-60 blur-2xl transition-opacity duration-500 bg-cover bg-center rounded-xl pointer-events-none"
                    style={{ backgroundImage: `url('${coverUrl}')` }}
                  />

                  {/* Inner card container holds the borders and hides overflow */}
                  <div className={`flex flex-col h-full rounded-xl overflow-hidden border transition-colors ${isSelected ? 'bg-[#06141B] border-[#4A5C6A] shadow-lg' : 'bg-[#11212D] border-[#253745] group-hover:border-[#4A5C6A]'}`}>
                    <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#06141B]">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-105 saturate-[1.1]"
                        style={{ backgroundImage: `url('${coverUrl}')` }}
                      />
                      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#06141B] via-[#06141B]/40 to-transparent opacity-80 pointer-events-none" />
                      
                      {game.onSale && (
                        /* UPGRADE: SHIMMER ON SALE BADGE */
                        <div className="absolute top-2 right-2 bg-green-500 text-[10px] font-black px-2 py-0.5 rounded text-[#06141B] shadow uppercase tracking-wider z-10 overflow-hidden">
                          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none" />
                          <span className="relative z-10">SALE</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4 flex flex-col flex-1 justify-between bg-[#11212D] relative z-10">
                      <div>
                        <h3 className={`text-sm font-bold leading-tight transition-colors truncate uppercase ${isSelected ? 'text-white' : 'text-[#CCD0CF] group-hover:text-white'}`}>
                          {game.title}
                        </h3>
                        <p className="text-[10px] text-[#4A5C6A] font-bold tracking-widest uppercase mt-1">Digital Edition</p>
                      </div>
                      
                      <div className="mt-4 flex items-center justify-between">
                        {(() => {
                          const isAvailablePS = game.categories?.some(c => c.includes('PS'));
                          const showPSPrice = platformFilter === 'PS5' && isAvailablePS && game.variants && game.variants.length > 0;
                          const displayPrice = showPSPrice ? game.variants![0].price : game.price;
                          const displayOriginalPrice = showPSPrice ? game.variants![0].originalPrice : (game.onSale ? game.originalPrice : undefined);
                          
                          return (
                            <div className="flex flex-col">
                              {displayOriginalPrice && (
                                <span className="text-[10px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{displayOriginalPrice}</span>
                              )}
                              <span className="text-base font-black text-[#CCD0CF] tracking-wider">{displayPrice}</span>
                            </div>
                          );
                        })()}
                      </div>

                      <div className="mt-3 flex gap-2">
                        {/* UPGRADE: SHIMMER ON BUTTON */}
                        <motion.button 
                          whileTap={{ scale: 0.97 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory('Game: ' + game.title);
                          }}
                          className={`relative overflow-hidden flex-1 py-2 px-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border ${
                            inCart 
                              ? 'bg-[#4A5C6A] text-white border-[#4A5C6A]' 
                              : 'bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] hover:text-white border-[#4A5C6A]/50 shadow-[0_0_10px_rgba(37,55,69,0.3)]'
                          }`}
                        >
                          {!inCart && (
                            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
                          )}
                          <span className="relative z-10 flex items-center justify-center gap-1.5">
                            {inCart ? (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3 h-3" />
                                <span>Buy Now</span>
                              </>
                            )}
                          </span>
                        </motion.button>
                        

                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {catalogLoaded && hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 30)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#11212D] border border-[#253745] hover:border-[#4A5C6A] text-[#CCD0CF] hover:text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:scale-105"
            >
              <span>Show More Games</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}