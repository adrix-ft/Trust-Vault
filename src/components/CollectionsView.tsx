import React, { useRef } from 'react';
import { useStore } from '../context/StoreContext';
import { getGameCoverUrl } from '../utils/image';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CollectionsView() {
  const { addToCart, catalog, platformFilter, collections } = useStore();
  
  // References to keep track of the scroll containers for each collection
  const sliderRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollSlider = (id: string, direction: 'left' | 'right') => {
    const container = sliderRefs.current[id];
    if (container) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#CCD0CF] uppercase">CURATED COLLECTIONS</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#253745] to-transparent"></div>
      </div>
      
      <div className="flex flex-col gap-12">
        {collections.map(collection => {
          const safeKeywords = collection.keywords || [];

          const collectionGames = catalog.filter(game => {
            const gameTitleLower = game.title.toLowerCase();
            const matchesKeyword = safeKeywords.some(kw => 
              gameTitleLower.includes(kw.toLowerCase())
            );
            
            if (!matchesKeyword) return false;
            if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
            
            return true;
          });

          if (collectionGames.length === 0) return null;

          return (
            <div key={collection.id} className="bg-[#11212D] rounded-xl overflow-hidden border border-[#253745] shadow-lg flex flex-col md:flex-row group relative">
              {/* Collection Banner */}
              <div className="w-full md:w-2/5 aspect-[16/9] md:aspect-auto relative overflow-hidden bg-[#06141B]">
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 saturate-[1.1] opacity-70 group-hover:opacity-100 mix-blend-overlay"
                  style={{ backgroundImage: `url('${collection.customBannerUrl || `/assets/images/${collection.banner}`}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#11212D] via-[#11212D]/60 to-transparent" />
                
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                  <h3 className="text-2xl sm:text-3xl font-black text-[#CCD0CF] uppercase tracking-wider mb-2 drop-shadow-md">
                    {collection.title}
                  </h3>
                  <p className="text-[#9BA8AB] text-sm font-medium tracking-wide leading-relaxed max-w-sm">
                    {collection.description}
                  </p>
                </div>
              </div>

              {/* Slider Section */}
              <div className="w-full md:w-3/5 p-6 bg-[#06141B]/40 flex flex-col justify-center relative">
                
                {/* Scroll Arrows on Top Right */}
                {collectionGames.length > 3 && (
                  <div className="flex justify-end items-center gap-2 mb-4">
                    <button
                      onClick={() => scrollSlider(collection.id, 'left')}
                      className="bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] p-1.5 rounded-lg transition-colors border border-[#4A5C6A]"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollSlider(collection.id, 'right')}
                      className="bg-[#253745] hover:bg-[#4A5C6A] text-[#CCD0CF] p-1.5 rounded-lg transition-colors border border-[#4A5C6A]"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Horizontal Sliding Container */}
                <div 
                  ref={el => { sliderRefs.current[collection.id] = el; }}
                  className="flex gap-4 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {collectionGames.map(game => (
                    <div 
                      key={game.title} 
                      className="min-w-[160px] max-w-[160px] sm:min-w-[180px] sm:max-w-[180px] bg-[#11212D] rounded-md overflow-hidden border border-[#253745] hover:border-[#4A5C6A] transition-all flex flex-col hover:-translate-y-1 hover:shadow-lg flex-shrink-0"
                    >
                      <div className="aspect-[3/4] relative">
                        <div 
                          className="absolute inset-0 bg-cover bg-center"
                          style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-transparent to-transparent opacity-80" />
                        {game.onSale && (
                          <div className="absolute top-1 right-1 bg-green-500 text-[8px] font-black px-1.5 py-0.5 rounded text-[#06141B] shadow-[0_0_10px_rgba(34,197,94,0.3)] uppercase tracking-wider">
                            SALE
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h4 className="font-bold text-[#CCD0CF] text-xs leading-tight mb-2 uppercase truncate" title={game.title}>
                          {game.title}
                        </h4>
                        
                        <div className="items-center flex justify-between mt-auto">
                          <div className="flex flex-col">
                            {game.onSale && game.originalPrice && (
                              <span className="text-[9px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{game.originalPrice}</span>
                            )}
                            <span className="font-bold text-[#CCD0CF] text-sm tracking-widest">{game.price}</span>
                          </div>
                          <button
                            onClick={() => addToCart(game)}
                            className="bg-[#253745] hover:bg-[#4A5C6A] w-6 h-6 rounded-full flex items-center justify-center text-[#9BA8AB] hover:text-white transition-colors"
                          >
                            <ShoppingCart className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}