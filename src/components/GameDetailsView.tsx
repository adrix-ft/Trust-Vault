import { motion } from 'motion/react';
import { useStore, isPlayStationPlatform } from '../context/StoreContext';
import { getGameCoverUrl } from '../utils/image';
import { ArrowLeft, ShoppingCart, Clock, Check, Star, ShieldCheck, Gamepad2, Minus, Plus, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import PlatformTags from './PlatformTags';

interface GameDetailsViewProps {
  gameTitle: string;
}

export default function GameDetailsView({ gameTitle }: GameDetailsViewProps) {
  const { catalog, addToCart, cart, setSelectedCategory, selectedCategory, platformFilter, catalogLoaded } = useStore();
  const game = catalog.find(g => g.title === gameTitle);
  
  const isAvailablePC = game?.categories?.some(c => c.includes('PC')) || false;
  const isAvailablePS = game?.categories?.some(c => c.includes('PS')) || false;

  const [activePlatform, setActivePlatform] = useState<'PC' | 'PS'>(() => {
    if (isPlayStationPlatform(platformFilter) && isAvailablePS) return 'PS';
    if (platformFilter === 'PC' && isAvailablePC) return 'PC';
    return isAvailablePS ? 'PS' : 'PC';
  });

  const isPSMode = activePlatform === 'PS';
  const defaultIdx = isPSMode && game?.variants && game.variants.length > 0 ? 0 : -1;
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(defaultIdx);
  const [rentMonths, setRentMonths] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [infoVariant, setInfoVariant] = useState<string | null>(null);
  
  const [steamScreenshots, setSteamScreenshots] = useState<string[]>([]);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://store-vault-backend.onrender.com';

  useEffect(() => {
    window.scrollTo(0, 0);
    // Auto-detect platform again if game changes
    let newPlat: 'PC' | 'PS' = isAvailablePS ? 'PS' : 'PC';
    if (isPlayStationPlatform(platformFilter) && isAvailablePS) newPlat = 'PS';
    if (platformFilter === 'PC' && isAvailablePC) newPlat = 'PC';
    
    setActivePlatform(newPlat);
    setSelectedVariantIndex(newPlat === 'PS' && game?.variants && game.variants.length > 0 ? 0 : -1);
    setRentMonths(1);
    setSteamScreenshots([]); // reset on game change

    // Fetch screenshots dynamically if missing
    if (gameTitle && (!game?.screenshots || game.screenshots.length === 0)) {
      const fetchScreenshots = async () => {
        try {
          const searchRes = await fetch(`${API_BASE_URL}/api/games/search?q=${encodeURIComponent(gameTitle)}`);
          const searchData = await searchRes.json();
          if (searchData.games && searchData.games.length > 0) {
            const appId = searchData.games[0].steam_app_id;
            const detailsRes = await fetch(`${API_BASE_URL}/api/games/details/${appId}`);
            const details = await detailsRes.json();
            if (details && details.screenshots) {
              setSteamScreenshots(details.screenshots.map((s: any) => s.path_full));
            }
          }
        } catch (err) {
          console.error("Failed to fetch steam screenshots", err);
        }
      };
      fetchScreenshots();
    }
  }, [gameTitle, platformFilter, isAvailablePC, isAvailablePS, game?.variants, game?.screenshots, API_BASE_URL]);

  if (!catalogLoaded && !game) {
    return (
      <div className="relative w-full pb-24 animate-pulse">
        {/* Back Button Skeleton */}
        <div className="absolute top-4 left-4 z-50">
          <div className="w-32 h-10 bg-[#FCFBF6] rounded-full border border-[#E5E7EB]"></div>
        </div>
        {/* Hero Banner Skeleton */}
        <div className="relative w-full h-[50vh] min-h-[400px] md:h-[60vh] rounded-b-[3rem] overflow-hidden shadow-2xl bg-[#F5F4EE]">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 flex flex-col items-start z-10 space-y-4">
             <div className="w-24 h-6 bg-[#E5E7EB] rounded-md"></div>
             <div className="w-2/3 md:w-1/2 h-12 md:h-16 bg-[#FCFBF6] rounded-xl border border-[#E5E7EB]"></div>
             <div className="w-1/3 h-6 bg-[#E5E7EB] rounded-md"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 p-4 sm:p-6 lg:p-8 -mt-16 md:-mt-24 relative z-20">
          <div className="lg:col-span-2 space-y-6">
             <div className="h-[200px] bg-[#FCFBF6] rounded-3xl border border-[#E5E7EB]"></div>
          </div>
          <div className="lg:col-span-1 space-y-6">
             <div className="h-[400px] bg-[#FCFBF6] rounded-3xl border border-[#E5E7EB]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#4B5563]">
        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-wider mb-2">Game Not Found</h2>
        <p>The requested game could not be found in our catalog.</p>
        <button 
          onClick={() => setSelectedCategory('Store')}
          className="mt-6 px-6 py-2 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] text-gray-900 font-bold transition-colors cursor-pointer"
        >
          Return to Store
        </button>
      </div>
    );
  }

  const activeVariant = selectedVariantIndex >= 0 && game.variants ? game.variants[selectedVariantIndex] : null;
  const displayPrice = activeVariant ? activeVariant.price : game.price;
  const displayOriginalPrice = activeVariant ? activeVariant.originalPrice : (game.onSale ? game.originalPrice : undefined);
  
  const gameToAdd = activeVariant 
    ? { ...game, title: `${game.title} - ${activeVariant.name}`, price: activeVariant.price, originalPrice: activeVariant.originalPrice }
    : game;

  const displayScreenshots = game.screenshots?.length ? game.screenshots : steamScreenshots;
  const coverUrl = selectedImage || game.horizontalCoverUrl || (displayScreenshots.length > 0 ? displayScreenshots[0] : (game.customCoverUrl || getGameCoverUrl(game.title)));
  const inCartPermanent = cart.some(item => item.title === gameToAdd.title && item.purchaseType === 'permanent');
  const inCartRent = cart.some(item => item.title === gameToAdd.title && item.purchaseType === 'rent');

  const baseRentPrice = parseInt(game.rentPrice?.replace(/[^0-9]/g, '') || '0');
  const calculatedRentPrice = `${baseRentPrice * rentMonths}Rs`;
  const rentGameToAdd = { ...game, rentPeriod: `${rentMonths} Month${rentMonths > 1 ? 's' : ''}`, rentPrice: calculatedRentPrice };

  return (
    <div className="relative w-full pb-24">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setSelectedCategory('Store')}
          className="flex items-center gap-2 bg-[#F5F4EE]/80 backdrop-blur-md border border-[#E5E7EB] text-[#1F2937] hover:text-gray-900 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#E5E7EB] shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Store
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative w-full h-[50vh] min-h-[400px] md:h-[60vh] rounded-b-[3rem] overflow-hidden shadow-2xl">
        <div 
          className="absolute inset-0 bg-cover bg-center saturate-[1.2] transform hover:scale-105 transition-transform duration-1000 ease-out"
          style={{ backgroundImage: `url('${coverUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        
        {/* Content over banner */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 flex flex-col items-start z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-4 items-center"
          >
            <PlatformTags platforms={game.categories} tagColors={game.tagColors} className="flex gap-1.5 z-20 relative" />
            
            {game.categories?.filter(cat => !['PC', 'STEAM', 'PS', 'PS4', 'PS5', 'XBOX'].includes(cat.toUpperCase())).map(cat => (
              <span key={cat} className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-black/50 backdrop-blur border border-white/20 text-white rounded-full shadow-sm">
                {cat}
              </span>
            ))}
            {game.genre && (
              <span className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-500/80 backdrop-blur border border-blue-400/50 text-white rounded-full shadow-sm">
                {game.genre}
              </span>
            )}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none mb-2 drop-shadow-lg"
          >
            {game.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2 mt-2 drop-shadow-lg"
          >
            {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="currentColor" />)}
            <span className="text-xs sm:text-sm text-amber-400 font-black ml-1">MASTERPIECE</span>
          </motion.div>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="px-4 sm:px-6 lg:px-12 xl:px-16 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 relative z-20">
        
        {/* Left Column: Description & Media */}
        <div className="lg:col-span-2 space-y-8">
          {/* Screenshots Gallery */}
          {displayScreenshots && displayScreenshots.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider mb-4 px-2">Gallery</h2>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory custom-scrollbar">
                {displayScreenshots.map((src, idx) => (
                  <img 
                    key={idx} 
                    src={src} 
                    alt={`Screenshot ${idx}`} 
                    onClick={() => setSelectedImage(src)} 
                    className="h-40 md:h-56 w-auto rounded-xl snap-center border border-[#E5E7EB] shadow-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                  />
                ))}
              </div>
            </motion.div>
          )}


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#FCFBF6] border border-[#E5E7EB] p-6 sm:p-8 rounded-3xl shadow-xl"
          >
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-[#E5E7EB] pb-4 flex items-center gap-2">
              About This Game
            </h2>
            <div 
              className="text-[#4B5563] text-sm sm:text-base leading-relaxed font-medium prose prose-invert max-w-none prose-p:mb-4 prose-a:text-blue-400 prose-ul:list-disc prose-ul:pl-4 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: game.description || `Experience the epic journey of ${game.title}. Dive into stunning graphics, intense gameplay, and an unforgettable story. This is a must-play title for any serious gamer.` }}
            />
          </motion.div>




        </div>

        {/* Right Column: Purchasing Panel */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-b from-[#FCFBF6] to-[#F5F4EE] border border-[#E5E7EB] p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] sticky top-[100px]"
          >

            {/* Platform Toggle */}
            {isAvailablePC && isAvailablePS && (
              <div className="mb-6 flex p-1 bg-[#F5F4EE] rounded-xl border border-[#E5E7EB]">
                <button
                  onClick={() => { setActivePlatform('PS'); setSelectedVariantIndex(game.variants && game.variants.length > 0 ? 0 : -1); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    isPSMode ? 'bg-[#E5E7EB] text-gray-900 shadow-md' : 'text-[#4B5563] hover:text-[#1F2937]'
                  }`}
                >
                  PlayStation Version
                </button>
                <button
                  onClick={() => { setActivePlatform('PC'); setSelectedVariantIndex(-1); }}
                  className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                    !isPSMode ? 'bg-[#E5E7EB] text-gray-900 shadow-md' : 'text-[#4B5563] hover:text-[#1F2937]'
                  }`}
                >
                  PC Version
                </button>
              </div>
            )}

            {/* Edition / Variant Selection */}
            {isPSMode && game.variants && game.variants.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-[11px] font-black text-[#4B5563] uppercase tracking-widest mb-3">Select Edition</h3>
                
                {game.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedVariantIndex === idx 
                        ? 'bg-[#E5E7EB] border-[#D1D5DB] shadow-md' 
                        : 'bg-[#FCFBF6] border-[#E5E7EB] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedVariantIndex === idx ? 'border-emerald-400' : 'border-[#D1D5DB]'}`}>
                        {selectedVariantIndex === idx && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${selectedVariantIndex === idx ? 'text-gray-900' : 'text-[#1F2937]'}`}>{variant.name}</span>
                      <div 
                        onClick={(e) => { e.stopPropagation(); setInfoVariant(variant.name); }} 
                        className="text-[#4B5563] hover:text-gray-900 bg-[#E5E7EB] hover:bg-[#D1D5DB] rounded-full transition-all p-1.5 ml-2 cursor-pointer shadow-sm flex items-center justify-center"
                        title="What does this mean?"
                      >
                        <Info className="w-4 h-4" />
                      </div>
                    </div>
                    <span className="text-sm font-black text-gray-900 shrink-0">{variant.price}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Permanent Purchase */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-black text-[#4B5563] uppercase tracking-widest">Buy Permanent</h3>
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${
                      isPSMode 
                        ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                        : 'bg-stone-100 text-stone-600 border-stone-200 shadow-sm'
                    }`}>
                      {isPSMode ? 'PlayStation' : 'PC'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {displayOriginalPrice && (
                      <span className="text-sm font-bold text-red-400 line-through decoration-red-400/50">{displayOriginalPrice}</span>
                    )}
                    <span className="text-4xl font-black text-gray-900">{displayPrice}</span>
                  </div>
                </div>
                {game.onSale && selectedVariantIndex === -1 && (
                  <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-red-500/50">
                    Discount
                  </span>
                )}
              </div>
              
              <button
                onClick={() => !inCartPermanent && addToCart(gameToAdd, 'permanent')}
                disabled={inCartPermanent}
                className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                  inCartPermanent 
                    ? 'bg-gray-200 text-gray-500 border border-transparent cursor-default shadow-inner'
                    : 'bg-gray-900 hover:bg-gray-800 text-white border border-transparent hover:scale-[1.02] active:scale-95 cursor-pointer'
                }`}
              >
                {inCartPermanent ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {inCartPermanent ? 'In Cart (Permanent)' : 'Add To Cart'}
              </button>
            </div>

            {/* Rental Purchase (If Available) */}
            {isPSMode && game.isRentable && game.rentPrice && (
              <div className="border-t border-[#E5E7EB] pt-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-black text-blue-300 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Secondary access - 30 days
                      </h3>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest border ${
                        isPSMode 
                          ? 'bg-blue-50 text-blue-600 border-blue-200 shadow-sm' 
                          : 'bg-stone-100 text-stone-600 border-stone-200 shadow-sm'
                      }`}>
                        {isPSMode ? 'PlayStation' : 'PC'}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-4">
                      <span className="text-3xl font-black text-gray-900">{game.rentPrice}</span>
                      <span className="text-xs font-bold text-[#4B5563] uppercase">/ 1 Month</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => !inCartRent && addToCart(rentGameToAdd, 'rent')}
                  disabled={inCartRent}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    inCartRent 
                      ? 'bg-gray-200 text-gray-500 border border-transparent cursor-default shadow-inner'
                      : 'bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-900 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  }`}
                >
                  {inCartRent ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  {inCartRent ? 'In Cart (30 Days)' : 'Secondary Access - 30 Days'}
                </button>
                <p className="text-center mt-3 text-[10px] text-[#D1D5DB] uppercase font-bold tracking-wider">
                  Digital Delivery • Secure Access
                </p>
              </div>
            )}
          </motion.div>

          {/* System Requirements */}
          {!isPSMode && (game.sysReqMinimum || game.sysReqRecommended) && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#FCFBF6] border border-[#E5E7EB] p-6 sm:p-8 rounded-3xl shadow-xl"
            >
              <h2 className="text-sm font-black text-[#4B5563] uppercase tracking-widest mb-4 border-b border-[#E5E7EB] pb-4 flex items-center gap-2">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 gap-4 text-[#4B5563] text-sm">
                {game.sysReqMinimum && (
                  <div dangerouslySetInnerHTML={{ __html: game.sysReqMinimum }} className="prose prose-invert max-w-none prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-4 text-xs" />
                )}
                {game.sysReqRecommended && (
                  <div dangerouslySetInnerHTML={{ __html: game.sysReqRecommended }} className="prose prose-invert max-w-none prose-strong:text-gray-900 prose-ul:list-disc prose-ul:pl-4 text-xs" />
                )}
              </div>
            </motion.div>
          )}

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-[#FCFBF6] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-lg">
              <ShieldCheck className="w-8 h-8 text-green-500" />
              <span className="text-[10px] font-black uppercase text-[#1F2937] tracking-wider">Secure Delivery</span>
            </div>
            <div className="bg-[#FCFBF6] border border-[#E5E7EB] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-gray-100 hover:border-gray-300 transition-colors shadow-lg">
              <Star className="w-8 h-8 text-amber-500" />
              <span className="text-[10px] font-black uppercase text-[#1F2937] tracking-wider">Top Rated</span>
            </div>
          </motion.div>
        </div>
        
      </div>
      
      {/* Variant Info Modal */}
      <AnimatePresence>
        {infoVariant && (
          <VariantInfoModal variant={infoVariant} onClose={() => setInfoVariant(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

const VariantInfoModal = ({ variant, onClose }: { variant: string, onClose: () => void }) => {
  const getVariantDetails = () => {
    const v = variant.toLowerCase();
    if (v.includes('primary online')) {
      return {
        title: '🟢 Primary Online — Permanent',
        points: [
          'Permanent access to the game on your PS5.',
          'Play the game from your main PSN account.',
          'Online multiplayer is supported.',
          'Trophies will be added to your own account.'
        ]
      };
    }
    if (v.includes('primary offline')) {
      return {
        title: '🔵 Primary Offline',
        points: [
          'Play the game on your main PSN account.',
          'Available in 30-day and Permanent options.',
          'Designed for offline gameplay - Trophies will be added to your own account.',
          'Have to completely turn off the internet until you finish the game.'
        ]
      };
    }
    if (v.includes('secondary')) {
      return {
        title: '🟣 Secondary Access',
        points: [
          'Play the game using the purchased PSN account.',
          'Available for 1 Month or Permanent access.',
          'Ideal for customers who don\'t need the game activated on their main PSN account.'
        ]
      };
    }
    
    return {
      title: variant,
      points: ['Details for this edition will be provided after purchase.']
    };
  };

  const details = getVariantDetails();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#F5F4EE]/80 backdrop-blur-sm cursor-pointer" onClick={onClose} />
      <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }} className="bg-[#FCFBF6] border border-[#E5E7EB] rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-md relative z-10 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-[#4B5563] hover:text-gray-900 bg-[#F5F4EE] rounded-full p-1 border border-[#E5E7EB] transition-colors"><X className="w-5 h-5" /></button>
        <h3 className="text-lg font-black text-gray-900 uppercase tracking-wider mb-4 border-b border-[#E5E7EB] pb-4 pr-6 leading-tight">{details.title}</h3>
        <ul className="space-y-3 mb-6">
          {details.points.map((pt, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[13px] text-[#1F2937] leading-relaxed">
              <span className="text-emerald-400 font-bold mt-0.5 shrink-0">•</span>
              <span>{pt}</span>
            </li>
          ))}
        </ul>
        <div className="bg-[#F5F4EE] p-5 rounded-2xl border border-[#E5E7EB]/80 shadow-inner">
          <p className="text-[11px] font-black text-red-400/90 uppercase tracking-widest flex items-center gap-1.5 mb-3 border-b border-[#E5E7EB]/50 pb-2">
            📌 Important
          </p>
          <ul className="space-y-1.5 text-[11px] sm:text-xs text-[#4B5563] list-disc pl-4 marker:text-[#D1D5DB]">
            <li>Please read the access type carefully before purchasing.</li>
            <li>Follow the provided activation/setup instructions.</li>
            <li>Account details and access terms will be provided after purchase.</li>
            <li><strong className="text-[#1F2937]">Do not change the account email, password, or security settings</strong> unless specifically instructed.</li>
          </ul>
          <div className="mt-4 pt-3 border-t border-[#E5E7EB]/50 text-[10px] sm:text-[11px] text-red-400/70 font-medium leading-relaxed italic">
            • There are no refunds in case of mood change / don't want the product anymore / you have selected the wrong version or you didn't like the game.
          </div>
        </div>
      </motion.div>
    </div>
  );
};
