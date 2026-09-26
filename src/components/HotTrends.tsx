import SectionHeader from './SectionHeader';
import { useStore } from '../context/StoreContext';
import { ShoppingCart } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';
import { useState, useMemo } from 'react';

export default function HotTrends() {
  const { addToCart, catalog, platformFilter } = useStore();
  const [activeCard, setActiveCard] = useState<string | null>(null);
  
  const filteredCatalog = catalog.filter(game => {
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });

  const nonSaleGames = filteredCatalog.filter(game => !game.onSale);
  const sourceList = nonSaleGames.length > 0 ? nonSaleGames : filteredCatalog;

  // useMemo ensures the shuffled trending games stay locked in place and don't re-shuffle on clicks
  const shuffledTrending = useMemo(() => {
    return [...sourceList].sort(() => Math.random() - 0.5).slice(0, 5);
  }, [catalog, platformFilter]);

  if (shuffledTrending.length === 0) return null;

  return (
    <section>
      <SectionHeader title="TRENDING TITLES" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {shuffledTrending.map((t, idx) => {
          const isSelected = activeCard === t.title;

          return (
            <div 
              key={t.title} 
              onClick={() => setActiveCard(isSelected ? null : t.title)}
              className={`col-span-1 h-[320px] bg-gradient-to-b ${idx % 2 === 0 ? 'from-[#11212D] to-[#06141B]' : 'from-[#253745] to-[#06141B]'} rounded-md relative group overflow-hidden cursor-pointer flex flex-col justify-end p-4 border border-[#253745] hover:border-[#4A5C6A] transition-all duration-300 hover:scale-[1.03] hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_20px_rgba(74,92,106,0.3)] hover:z-20`}
            >
              
              <div className="absolute top-0 left-0 w-28 h-28 overflow-hidden pointer-events-none z-30">
                <div className="absolute transform -rotate-45 -left-8 top-4 bg-gradient-to-r from-emerald-500 to-green-400 text-[#06141B] text-[9px] font-black py-0.5 w-32 text-center shadow-md uppercase tracking-widest">
                  TREND
                </div>
              </div>

              <div className="absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out saturate-[1.2] contrast-[1.1] brightness-100 group-hover:scale-110 group-hover:saturate-[1.3] group-hover:brightness-110 z-0" style={{ backgroundImage: `url('${t.customCoverUrl || getGameCoverUrl(t.title)}')` }}></div>
              
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#06141B]/95 via-[#06141B]/60 to-transparent pointer-events-none transition-opacity duration-300 z-10" />
              
              <div className="relative z-20 flex flex-col justify-end bg-transparent -mx-4 -mb-4 p-4 pt-3">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex-1 pr-2 drop-shadow-md">
                    <div className="text-xs font-bold text-[#CCD0CF] tracking-wide truncate">{t.title}</div>
                    <div className="flex flex-col mt-1.5">
                      {t.onSale && t.originalPrice && (
                        <span className="text-[9px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{t.originalPrice}</span>
                      )}
                      <div className="text-[#9BA8AB] text-xs font-semibold">{t.price}</div>
                    </div>
                  </div>

                  {/* Compact Cart Button */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(t); }}
                    className={`w-8 h-8 rounded-full bg-[#253745]/90 flex items-center justify-center text-[#9BA8AB] transition-all duration-200 border border-transparent shrink-0 backdrop-blur-sm shadow-md ${isSelected ? 'opacity-0 scale-75' : 'group-hover:opacity-0'}`}
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>

                {/* Expanded Buy Now Button */}
                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(t); }}
                  className={`w-full py-2 px-3 rounded-lg bg-[#253745] hover:bg-[#4A5C6A] border border-[#4A5C6A] text-[#CCD0CF] hover:text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${isSelected ? 'opacity-100 max-h-12' : 'opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-12'}`}
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Buy Now</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}