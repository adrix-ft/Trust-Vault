import SectionHeader from './SectionHeader';
import { ShoppingCart, Check, ChevronDown } from 'lucide-react';
import { useStore, matchesPlatform, isPlayStationPlatform } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, memo } from 'react';
import { getGameCoverUrl } from '../utils/image';
import PlatformTags from './PlatformTags';

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
    if (!matchesPlatform(game.categories, platformFilter)) return false;
    return true;
  });

  const displayedGames = filteredGames.slice(0, visibleCount);
  const hasMore = visibleCount < filteredGames.length;

  return (
    <section>
      <SectionHeader title={selectedCategory === 'Store' ? "ALL GAMES" : selectedCategory.toUpperCase()} />

      <div className="relative min-h-[400px]">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          <AnimatePresence mode="popLayout">
            
            {/* UPGRADE: SKELETON SWEEP ANIMATION */}
            {(!catalogLoaded && displayedGames.length === 0) && Array.from({ length: 10 }).map((_, index) => (
              <div 
                key={`skeleton-${index}`}
                className="bg-[#FCFBF6] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col relative"
              >
                <div className="absolute inset-0 z-20 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-sweep pointer-events-none" />
                <div className="aspect-[3/4] w-full bg-[#F5F4EE]" />
                <div className="p-4 flex flex-col flex-1 justify-between gap-4">
                  <div>
                    <div className="h-4 bg-[#E5E7EB] rounded w-3/4 mb-2" />
                    <div className="h-3 bg-[#E5E7EB] rounded w-1/2" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="h-5 bg-[#E5E7EB] rounded w-1/3" />
                    <div className="w-8 h-8 rounded-full bg-[#E5E7EB]" />
                  </div>
                </div>
              </div>
            ))}

            {(catalogLoaded || displayedGames.length > 0) && displayedGames.map((game, index) => {
              const inCart = cart.some(item => item.title === game.title);
              const isSelected = selectedGame === game.title;
              return <GameCard key={game.title} game={game} index={index} isSelected={isSelected} setSelectedCategory={setSelectedCategory} inCart={inCart} platformFilter={platformFilter} />;
            })}
          </AnimatePresence>
        </div>



        {(catalogLoaded || displayedGames.length > 0) && hasMore && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setVisibleCount(prev => prev + 30)}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gray-900 border border-transparent hover:bg-gray-800 text-white text-xs font-bold tracking-wider uppercase transition-all shadow-lg hover:shadow-xl hover:scale-105"
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

const GameCard = memo(({ game, index, isSelected, setSelectedCategory, inCart, platformFilter }: any) => {
  const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, delay: (index % 30) * 0.02 }}
      onClick={() => setSelectedCategory('Game: ' + game.title)}
      className={`relative transition-transform duration-200 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-xl group flex flex-col cursor-pointer will-change-transform z-10 hover:z-20`}
    >
      
      {/* Inner card container holds the borders and hides overflow */}
      <div className={`flex flex-col h-full rounded-xl overflow-hidden border transition-all ${isSelected ? 'bg-[#F5F4EE] border-[#D1D5DB] shadow-lg scale-[1.02]' : 'bg-[#FCFBF6] border-[#E5E7EB] group-hover:border-[#D1D5DB] group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]'}`}>
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F5F4EE]">
          <img 
            src={coverUrl}
            alt={game.title}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105 saturate-[1.1]"
          />
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          
          <PlatformTags platforms={game.categories} tagColors={game.tagColors} />
          {game.onSale && (
            /* UPGRADE: SHIMMER ON SALE BADGE */
            <div className="absolute top-2 left-2 bg-green-500 text-[10px] font-black px-2 py-0.5 rounded text-[#F5F4EE] shadow uppercase tracking-wider z-10 overflow-hidden">
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer pointer-events-none" />
              <span className="relative z-10">SALE</span>
            </div>
          )}
        </div>
        
        <div className="p-4 flex flex-col flex-1 justify-between bg-[#FCFBF6] relative z-10">
          <div>
            <h3 className={`text-sm font-bold leading-tight transition-colors truncate uppercase ${isSelected ? 'text-gray-900' : 'text-[#1F2937] group-hover:text-gray-900'}`}>
              {game.title}
            </h3>
            <p className="text-[10px] text-[#D1D5DB] font-bold tracking-widest uppercase mt-1">Digital Edition</p>
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            {(() => {
              const isAvailablePS = game.categories?.some((c: string) => c.includes('PS'));
              const showPSPrice = isPlayStationPlatform(platformFilter) && isAvailablePS && game.variants && game.variants.length > 0;
              const displayPrice = showPSPrice ? game.variants![0].price : game.price;
              const displayOriginalPrice = showPSPrice ? game.variants![0].originalPrice : (game.onSale ? game.originalPrice : undefined);
              
              return (
                <div className="flex flex-col">
                  {displayOriginalPrice && (
                    <span className="text-[10px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{displayOriginalPrice}</span>
                  )}
                  <span className="text-base font-black text-[#1F2937] tracking-wider">{displayPrice}</span>
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
                  ? 'bg-gray-200 text-gray-500 border-transparent shadow-inner' 
                  : 'bg-gray-900 hover:bg-gray-800 text-white border-transparent shadow-md hover:shadow-lg'
              }`}
            >
              {!inCart && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:animate-shimmer pointer-events-none" />
              )}
              <div className="relative z-10 flex items-center justify-center gap-1.5">
                {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                <span>{inCart ? 'Added' : 'View Details'}</span>
              </div>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
