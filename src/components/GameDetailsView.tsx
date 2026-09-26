import { motion } from 'motion/react';
import { useStore } from '../context/StoreContext';
import { getGameCoverUrl } from '../utils/image';
import { ArrowLeft, ShoppingCart, Clock, Check, Star, ShieldCheck, Gamepad2, Minus, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface GameDetailsViewProps {
  gameTitle: string;
}

export default function GameDetailsView({ gameTitle }: GameDetailsViewProps) {
  const { catalog, addToCart, cart, setSelectedCategory } = useStore();
  const game = catalog.find(g => g.title === gameTitle);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(-1);
  const [rentMonths, setRentMonths] = useState<number>(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    setSelectedVariantIndex(-1); // Reset on game change
    setRentMonths(1);
  }, [gameTitle]);

  if (!game) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-[#9BA8AB]">
        <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-2">Game Not Found</h2>
        <p>The requested game could not be found in our catalog.</p>
        <button 
          onClick={() => setSelectedCategory('Store')}
          className="mt-6 px-6 py-2 rounded-full bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold transition-colors"
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

  const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);
  const inCartPermanent = cart.some(item => item.title === gameToAdd.title && item.purchaseType === 'permanent');
  const inCartRent = cart.some(item => item.title === gameToAdd.title && item.purchaseType === 'rent');

  const baseRentPrice = parseInt(game.rentPrice?.replace(/[^0-9]/g, '') || '0');
  const calculatedRentPrice = `${baseRentPrice * rentMonths}Rs`;
  const rentGameToAdd = { ...game, rentPeriod: `${rentMonths} Month${rentMonths > 1 ? 's' : ''}`, rentPrice: calculatedRentPrice };

  return (
    <div className="relative w-full max-w-7xl mx-auto pb-24">
      {/* Back Button */}
      <div className="absolute top-4 left-4 z-50">
        <button 
          onClick={() => setSelectedCategory('Store')}
          className="flex items-center gap-2 bg-[#06141B]/80 backdrop-blur-md border border-[#253745] text-[#CCD0CF] hover:text-white px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all hover:bg-[#253745] shadow-lg"
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-[#06141B]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06141B]/80 via-transparent to-transparent" />
        
        {/* Content over banner */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 flex flex-col items-start z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap gap-2 mb-4"
          >
            {game.categories?.map(cat => (
              <span key={cat} className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#253745]/80 backdrop-blur border border-[#4A5C6A]/50 text-[#CCD0CF] rounded-full shadow-sm">
                {cat}
              </span>
            ))}
            {game.genre && (
              <span className="px-3 py-1 text-[10px] sm:text-xs font-black uppercase tracking-wider bg-blue-500/20 backdrop-blur border border-blue-500/50 text-blue-300 rounded-full shadow-sm">
                {game.genre}
              </span>
            )}
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tight leading-none mb-2 drop-shadow-2xl"
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
          {game.screenshots && game.screenshots.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 px-2">Gallery</h2>
              <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#4A5C6A] scrollbar-track-[#11212D]">
                {game.screenshots.map((src, idx) => (
                  <img 
                    key={idx} 
                    src={src} 
                    alt={`Screenshot ${idx}`} 
                    onClick={() => setSelectedImage(src)} 
                    className="h-40 md:h-56 w-auto rounded-xl snap-center border border-[#253745] shadow-lg object-cover cursor-pointer hover:opacity-80 transition-opacity" 
                  />
                ))}
              </div>
            </motion.div>
          )}


          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#11212D] border border-[#253745] p-6 sm:p-8 rounded-3xl shadow-xl"
          >
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 border-b border-[#253745] pb-4 flex items-center gap-2">
              About This Game
            </h2>
            <div 
              className="text-[#9BA8AB] text-sm sm:text-base leading-relaxed font-medium prose prose-invert max-w-none prose-p:mb-4 prose-a:text-blue-400 prose-ul:list-disc prose-ul:pl-4 prose-strong:text-white"
              dangerouslySetInnerHTML={{ __html: game.description || `Experience the epic journey of ${game.title}. Dive into stunning graphics, intense gameplay, and an unforgettable story. This is a must-play title for any serious gamer.` }}
            />
          </motion.div>

          {/* System Requirements */}
          {(game.sysReqMinimum || game.sysReqRecommended) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-[#11212D] border border-[#253745] p-6 sm:p-8 rounded-3xl shadow-xl mt-6"
            >
              <h2 className="text-xl font-black text-white uppercase tracking-wider mb-4 border-b border-[#253745] pb-4 flex items-center gap-2">
                System Requirements
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[#9BA8AB] text-sm">
                {game.sysReqMinimum && (
                  <div dangerouslySetInnerHTML={{ __html: game.sysReqMinimum }} className="prose prose-invert max-w-none prose-strong:text-white prose-ul:list-disc prose-ul:pl-4 text-xs" />
                )}
                {game.sysReqRecommended && (
                  <div dangerouslySetInnerHTML={{ __html: game.sysReqRecommended }} className="prose prose-invert max-w-none prose-strong:text-white prose-ul:list-disc prose-ul:pl-4 text-xs" />
                )}
              </div>
            </motion.div>
          )}

          {/* Trust Badges */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-[#11212D]/50 border border-[#253745] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#11212D] hover:border-[#4A5C6A] transition-colors">
              <ShieldCheck className="w-8 h-8 text-green-400" />
              <span className="text-[10px] font-black uppercase text-[#CCD0CF] tracking-wider">Secure Delivery</span>
            </div>
            <div className="bg-[#11212D]/50 border border-[#253745] rounded-2xl p-4 flex flex-col items-center justify-center text-center gap-2 hover:bg-[#11212D] hover:border-[#4A5C6A] transition-colors">
              <Star className="w-8 h-8 text-amber-400" />
              <span className="text-[10px] font-black uppercase text-[#CCD0CF] tracking-wider">Top Rated</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Purchasing Panel */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-b from-[#11212D] to-[#06141B] border border-[#253745] p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)] sticky top-[100px]"
          >
            {/* Edition / Variant Selection */}
            {game.variants && game.variants.length > 0 && (
              <div className="mb-6 space-y-2">
                <h3 className="text-[11px] font-black text-[#9BA8AB] uppercase tracking-widest mb-3">Select Edition</h3>
                
                <button
                  onClick={() => setSelectedVariantIndex(-1)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedVariantIndex === -1 
                      ? 'bg-[#253745] border-[#4A5C6A] shadow-md' 
                      : 'bg-[#11212D] border-[#253745] hover:border-[#4A5C6A]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${selectedVariantIndex === -1 ? 'border-emerald-400' : 'border-[#4A5C6A]'}`}>
                      {selectedVariantIndex === -1 && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                    </div>
                    <span className={`text-xs font-bold uppercase tracking-wider ${selectedVariantIndex === -1 ? 'text-white' : 'text-[#CCD0CF]'}`}>Standard Edition</span>
                  </div>
                  <span className="text-sm font-black text-white">{game.price}</span>
                </button>

                {game.variants.map((variant, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedVariantIndex(idx)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedVariantIndex === idx 
                        ? 'bg-[#253745] border-[#4A5C6A] shadow-md' 
                        : 'bg-[#11212D] border-[#253745] hover:border-[#4A5C6A]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${selectedVariantIndex === idx ? 'border-emerald-400' : 'border-[#4A5C6A]'}`}>
                        {selectedVariantIndex === idx && <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${selectedVariantIndex === idx ? 'text-white' : 'text-[#CCD0CF]'}`}>{variant.name}</span>
                    </div>
                    <span className="text-sm font-black text-white">{variant.price}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Permanent Purchase */}
            <div className="mb-8">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h3 className="text-sm font-black text-[#9BA8AB] uppercase tracking-widest mb-1">Buy Permanent</h3>
                  <div className="flex items-center gap-2">
                    {displayOriginalPrice && (
                      <span className="text-sm font-bold text-red-400 line-through decoration-red-400/50">{displayOriginalPrice}</span>
                    )}
                    <span className="text-4xl font-black text-white">{displayPrice}</span>
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
                    ? 'bg-[#253745] text-[#9BA8AB] border border-[#4A5C6A] cursor-default'
                    : 'bg-gradient-to-r from-[#4A5C6A] to-[#596F80] hover:from-[#596F80] hover:to-[#4A5C6A] text-white border border-[#596F80] hover:scale-[1.02] active:scale-95 cursor-pointer'
                }`}
              >
                {inCartPermanent ? <Check className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                {inCartPermanent ? 'In Cart (Permanent)' : 'Add To Cart'}
              </button>
            </div>

            {/* Rental Purchase (If Available) */}
            {game.isRentable && game.rentPrice && (
              <div className="border-t border-[#253745] pt-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-sm font-black text-blue-300 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Clock className="w-4 h-4" /> Rent Game
                    </h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">{calculatedRentPrice}</span>
                      <span className="text-xs font-bold text-[#9BA8AB] uppercase">/ {rentMonths} Month{rentMonths > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-[#11212D] border border-[#253745] rounded-xl p-2 mb-4">
                  <span className="text-xs font-bold text-[#9BA8AB] uppercase tracking-wider ml-2">Duration (Months)</span>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setRentMonths(Math.max(1, rentMonths - 1))}
                      className="w-8 h-8 rounded-lg bg-[#253745] hover:bg-[#4A5C6A] flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-lg font-black text-white w-8 text-center">{rentMonths}</span>
                    <button 
                      onClick={() => setRentMonths(Math.min(120, rentMonths + 1))}
                      className="w-8 h-8 rounded-lg bg-[#253745] hover:bg-[#4A5C6A] flex items-center justify-center text-white transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <button
                  onClick={() => !inCartRent && addToCart(rentGameToAdd, 'rent')}
                  disabled={inCartRent}
                  className={`w-full py-4 px-6 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg ${
                    inCartRent 
                      ? 'bg-[#1A2C38] text-[#4A5C6A] border border-[#253745] cursor-default'
                      : 'bg-[#11212D] hover:bg-[#1A2C38] text-blue-300 border border-blue-500/30 hover:border-blue-500/80 hover:scale-[1.02] active:scale-95 cursor-pointer'
                  }`}
                >
                  {inCartRent ? <Check className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  {inCartRent ? 'In Cart (Rental)' : 'Rent Now'}
                </button>
                <p className="text-center mt-3 text-[10px] text-[#4A5C6A] uppercase font-bold tracking-wider">
                  Digital Delivery • Secure Access
                </p>
              </div>
            )}
          </motion.div>
        </div>
        
      </div>
    </div>
  );
}
