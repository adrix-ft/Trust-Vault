import { useStore } from '../context/StoreContext';
import { getGameCoverUrl } from '../utils/image';
import { ShoppingCart, Star, Clock } from 'lucide-react';

export default function FilteredGames({ category, genre, title, actionType = 'buy' }: { category?: string, genre?: string, title: string, actionType?: 'buy' | 'preorder' }) {
  const { addToCart, catalog, platformFilter } = useStore();
  const games = catalog.filter(game => {
    if (genre) {
      if (game.genre !== genre) return false;
    } else if (category) {
      if (!game.categories?.includes(category)) return false;
    }
    
    if (platformFilter !== 'All') {
      if (platformFilter === 'PS5 & PS4') {
        const matchesPlayStation = game.categories?.some(cat => {
          const upper = cat.toUpperCase();
          return upper.includes('PS5') || upper.includes('PS4') || upper.includes('PLAYSTATION');
        });
        if (!matchesPlayStation) return false;
      } else {
        if (!game.categories?.some(cat => cat.toUpperCase() === platformFilter.toUpperCase())) return false;
      }
    }
    return true;
  });
  
  if (games.length === 0) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#CCD0CF] uppercase">{title}</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-[#253745] to-transparent"></div>
        </div>
        <div className="py-16 flex flex-col items-center justify-center text-[#4A5C6A] bg-[#11212D]/30 border border-[#253745]/30 rounded-xl border-dashed">
          <Clock className="w-10 h-10 mb-4 opacity-50" />
          <p className="text-lg font-black tracking-widest uppercase text-[#9BA8AB]">No Games Found</p>
          <p className="text-xs font-bold mt-2 uppercase tracking-wide">No titles match this filter currently</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black tracking-wider text-[#CCD0CF] uppercase">{title}</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#253745] to-transparent"></div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {games.map(game => (
          <div key={game.title} className="bg-[#11212D] rounded-md overflow-hidden border border-[#253745] hover:border-[#4A5C6A] transition-all group flex flex-col h-full hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.4),0_0_15px_rgba(74,92,106,0.2)]">
            <div className="aspect-[3/4] overflow-hidden relative bg-[#06141B]">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110 saturate-[1.1]"
                style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}
              />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#06141B] via-[#06141B]/40 to-transparent opacity-80" />
              {category === 'Top Sellers' && !game.onSale && (
                <div className="absolute top-2 right-2 bg-[#4A5C6A] text-[9px] font-bold px-1.5 py-0.5 rounded text-[#CCD0CF] shadow-sm uppercase tracking-wider border border-[#4A5C6A]/50 backdrop-blur">
                  Best Seller
                </div>
              )}
              {game.onSale && (
                <div className="absolute top-2 right-2 bg-green-500 text-[10px] font-black px-2 py-0.5 rounded text-[#06141B] shadow-[0_0_10px_rgba(34,197,94,0.3)] uppercase tracking-wider">
                  SALE
                </div>
              )}
            </div>
            
            <div className="p-4 flex flex-col flex-1 relative z-10 bg-[#11212D]">
              <div className="flex-1">
                <h3 className="font-bold text-[#CCD0CF] text-sm leading-tight mb-2 tracking-wide uppercase">{game.title}</h3>
                {category === 'Top Sellers' && (
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-[#CCD0CF]" fill="currentColor" />)}
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex flex-col">
                  {game.onSale && game.originalPrice && (
                    <span className="text-[10px] font-bold text-red-400 line-through decoration-red-400/50 mb-0.5">{game.originalPrice}</span>
                  )}
                  <span className="font-black text-[#CCD0CF] text-lg tracking-wider">{game.price}</span>
                </div>
                <button
                  onClick={() => addToCart(game)}
                  className="bg-[#253745] hover:bg-[#4A5C6A] p-2 rounded-full text-[#CCD0CF] hover:text-white transition-colors border border-transparent hover:border-[#CCD0CF]/20 shrink-0 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(74,92,106,0.5)]"
                  title={actionType === 'preorder' ? "Pre-Order" : "Buy Now"}
                >
                  {actionType === 'preorder' ? <Clock className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}