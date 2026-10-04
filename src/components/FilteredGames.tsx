import { useStore, matchesPlatform } from '../context/StoreContext';
import { useState, useEffect, memo } from 'react';
import { getGameCoverUrl } from '../utils/image';
import { ShoppingCart, Star, Clock } from 'lucide-react';
import PlatformTags from './PlatformTags';

export default function FilteredGames({ category, genre, title, actionType = 'buy' }: { category?: string, genre?: string, title: string, actionType?: 'buy' | 'preorder' }) {
  const { addToCart, catalog, platformFilter } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, [platformFilter, category, genre]);

  const games = catalog.filter(game => {
    if (genre) {
      if (game.genre !== genre) return false;
    } else if (category) {
      if (!game.categories?.includes(category)) return false;
    }
    
    if (!matchesPlatform(game.categories, platformFilter)) return false;
    return true;
  });
  
  if (games.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#1F2937] uppercase">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#E5E7EB] to-transparent"></div>
        </div>
        <div className="py-16 flex flex-col items-center justify-center text-[#D1D5DB] bg-[#FFFFFF]/30 border border-[#E5E7EB]/30 rounded-xl border-dashed">
          <Clock className="w-10 h-10 mb-4 opacity-50" />
          <p className="text-lg font-black tracking-widest uppercase text-[#4B5563]">No Games Found</p>
          <p className="text-xs font-bold mt-2 uppercase tracking-wide">No titles match this filter currently</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#1F2937] uppercase">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#E5E7EB] to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {loading ? (
          Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-xl overflow-hidden flex flex-col relative animate-pulse">
              <div className="aspect-[3/4] w-full bg-[#F9FAFB]" />
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
          ))
        ) : (
          games.map(game => (
            <FilteredGameCard key={game.title} game={game} category={category} actionType={actionType} />
          ))
        )}
      </div>
    </div>
  );
}

const FilteredGameCard = memo(({ game, category, actionType }: any) => {
  const { addToCart } = useStore();
  const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);

  return (
    <div className="bg-[#FFFFFF] rounded-md overflow-hidden border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all group flex flex-col h-full hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(74,92,106,0.2)]">
      <div className="aspect-[3/4] overflow-hidden relative bg-[#F9FAFB]">
        <img 
          src={coverUrl}
          alt={game.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 saturate-[1.1]"
        />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#F9FAFB] via-[#F9FAFB]/40 to-transparent opacity-80" />
              <PlatformTags platforms={game.categories} tagColors={game.tagColors} />
              {category === 'Top Sellers' && !game.onSale && (
                <div className="absolute top-2 left-2 bg-[#D1D5DB] text-[9px] font-bold px-1.5 py-0.5 rounded text-[#1F2937] shadow-sm uppercase tracking-wider border border-[#D1D5DB]/50 backdrop-blur">
                  Best Seller
                </div>
              )}
              {game.onSale && (
                <div className="absolute top-2 left-2 bg-green-500 text-[10px] font-black px-2 py-0.5 rounded text-[#F9FAFB] shadow-[0_0_10px_rgba(34,197,94,0.3)] uppercase tracking-wider">
                  SALE
                </div>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-1 relative z-10 bg-[#FFFFFF]">
              <div className="flex-1">
                <h3 className="font-bold text-[#1F2937] text-sm leading-tight mb-2 tracking-wide uppercase">{game.title}</h3>
                {category === 'Top Sellers' && (
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-[#1F2937]" fill="currentColor" />)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                  {game.onSale && game.originalPrice && (
                    <span className="text-[10px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{game.originalPrice}</span>
                  )}
                  <span className="font-black text-[#1F2937] text-lg tracking-wider">{game.price}</span>
                </div>
                <button
                  onClick={() => addToCart(game)}
                  className="bg-[#E5E7EB] hover:bg-[#D1D5DB] p-2 rounded-full text-[#1F2937] hover:text-gray-900 transition-colors border border-transparent hover:border-[#1F2937]/20 shrink-0 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(74,92,106,0.5)]"
                  title={actionType === 'preorder' ? "Pre-Order" : "Buy Now"}
                >
                  {actionType === 'preorder' ? <Clock className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
  );
});
