import { useState } from 'react';
import { useStore, Game } from '../context/StoreContext';
import { getGameCoverUrl } from '../utils/image';
import { Package, Check, ShoppingCart, Info, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CustomBundleBuilder() {
  const { catalog, addToCart, showToast } = useStore();
  const [selectedGames, setSelectedGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Only games tagged as Bundle-Eligible and matching search query
  const eligibleGames = catalog.filter(game => 
    game.categories?.includes('Bundle-Eligible') &&
    game.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelection = (game: Game) => {
    if (selectedGames.some(g => g.title === game.title)) {
      setSelectedGames(selectedGames.filter(g => g.title !== game.title));
    } else {
      setSelectedGames([...selectedGames, game]);
    }
  };

  const getBasePrice = (game: Game) => {
    // If it's a PS5 game with variants, use the first variant price, otherwise use game.price
    const isPSGame = game.categories?.some(c => c.includes('PS'));
    const isPCGame = game.categories?.some(c => c.includes('PC'));
    
    let priceStr = game.price;
    if (isPSGame && !isPCGame && game.variants && game.variants.length > 0) {
      priceStr = game.variants[0].price;
    }
    
    return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
  };

  const calculateTotal = () => {
    const baseTotal = selectedGames.reduce((acc, game) => acc + getBasePrice(game), 0);
    let discount = 0;
    if (selectedGames.length >= 5) {
      discount = 0.20; // 20% off
    } else if (selectedGames.length >= 3) {
      discount = 0.10; // 10% off
    }
    const finalTotal = Math.floor(baseTotal * (1 - discount));
    
    return { baseTotal, finalTotal, discount };
  };

  const { baseTotal, finalTotal, discount } = calculateTotal();

  const handleAddBundle = () => {
    if (selectedGames.length === 0) return;

    const customBundle: Game = {
      title: `Custom Bundle (${selectedGames.length} Games)`,
      price: `${finalTotal}Rs`,
      originalPrice: discount > 0 ? `${baseTotal}Rs` : undefined,
      description: selectedGames.map(g => g.title).join(', '),
      categories: ['Bundles'],
      customCoverUrl: selectedGames[0]?.customCoverUrl || getGameCoverUrl(selectedGames[0]?.title)
    };

    addToCart(customBundle);
    showToast('Custom Bundle added to cart!', 'success');
    setSelectedGames([]);
  };

  return (
    <div className="w-full relative pb-32">
      {/* Header Banner */}
      <div className="relative w-full h-[250px] sm:h-[300px] bg-gradient-to-br from-[#06141B] via-[#11212D] to-[#253745] overflow-hidden flex items-center justify-center border-b border-[#4A5C6A]/30">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80')] opacity-10 bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-transparent to-transparent" />
        
        <div className="relative z-10 text-center space-y-4 px-4 max-w-2xl mt-12 md:mt-0">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] mb-6">
            <Package className="w-8 h-8 text-[#06141B]" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-wider drop-shadow-lg">
            Build Your Own Bundle
          </h1>
          <p className="text-[#9BA8AB] text-sm sm:text-base font-semibold max-w-xl mx-auto drop-shadow-md">
            Mix and match your favorite eligible titles. The more you pick, the more you save! 
            <strong className="text-emerald-400"> 10% off for 3+ games</strong>, and <strong className="text-emerald-400">20% off for 5+ games</strong>.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12">
        {/* Search Bar */}
        <div className="mb-8 relative max-w-md mx-auto sm:mx-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A5C6A]" />
          <input
            type="text"
            placeholder="Search eligible games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#11212D]/80 border border-[#253745] rounded-full py-3 pl-12 pr-6 text-sm font-medium text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {eligibleGames.map((game, idx) => {
            const isSelected = selectedGames.some(g => g.title === game.title);
            const price = getBasePrice(game);
            
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                key={game.title}
                onClick={() => toggleSelection(game)}
                className={`group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 transform hover:-translate-y-2 ${
                  isSelected ? 'ring-4 ring-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'border border-[#253745] hover:border-[#4A5C6A] hover:shadow-2xl'
                }`}
              >
                <div className="aspect-[3/4] relative overflow-hidden bg-[#11212D]">
                  <img 
                    src={game.customCoverUrl || getGameCoverUrl(game.title)} 
                    alt={game.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSelected ? 'scale-105' : 'group-hover:scale-110'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  
                  {isSelected && (
                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-xl scale-in">
                        <Check className="w-6 h-6 text-black" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <h3 className="text-xs font-bold text-white uppercase truncate drop-shadow-md">{game.title}</h3>
                    <p className="text-emerald-400 font-black text-sm mt-0.5">{price}Rs</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {eligibleGames.length === 0 && (
          <div className="text-center py-20 bg-[#11212D]/50 border border-[#253745] rounded-2xl">
            <Info className="w-12 h-12 text-[#4A5C6A] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-2">No Eligible Games</h3>
            <p className="text-[#9BA8AB] text-sm">There are currently no games available for custom bundles.</p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Summary Bar */}
      <AnimatePresence>
        {selectedGames.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 sm:p-6 bg-[#11212D]/95 backdrop-blur-xl border-t border-[#4A5C6A]/50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 w-full overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                <div className="shrink-0 mr-2 text-[#9BA8AB] font-bold text-xs uppercase tracking-wider">
                  {selectedGames.length} Game{selectedGames.length !== 1 ? 's' : ''} Selected
                </div>
                <div className="flex items-center gap-2">
                  {selectedGames.map(game => (
                    <div key={game.title} className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden shrink-0 border-2 border-emerald-500 relative">
                      <img src={game.customCoverUrl || getGameCoverUrl(game.title)} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => toggleSelection(game)}
                        className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                      >
                        <span className="text-white text-xs">✕</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 bg-[#06141B] px-6 py-3 rounded-2xl border border-[#253745]">
                <div className="flex flex-col items-end">
                  {discount > 0 && (
                    <span className="text-xs font-bold text-red-400 line-through decoration-red-400/50">
                      {baseTotal}Rs
                    </span>
                  )}
                  <span className="text-xl sm:text-2xl font-black text-white">
                    {finalTotal}Rs
                  </span>
                  {discount > 0 && (
                    <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full mt-0.5">
                      {discount * 100}% Discount Applied!
                    </span>
                  )}
                </div>

                <button
                  onClick={handleAddBundle}
                  className="bg-gradient-to-r from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 text-black px-6 py-3 sm:py-4 rounded-xl font-black uppercase tracking-widest text-xs sm:text-sm transition-all transform hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  Add To Cart
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
