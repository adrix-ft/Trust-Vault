import { Search, ShoppingCart, Check, X, MessageCircle, Zap, TrendingUp, Monitor, Gamepad2, ShieldCheck, Clock } from 'lucide-react';
import { useStore, Game } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { getGameCoverUrl } from '../utils/image';

export default function Navbar() {
  const { cart, setIsCartOpen, selectedCategory, setSelectedCategory, addToCart, catalog, platformFilter, setPlatformFilter } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);
  const [activeHoverTitle, setActiveHoverTitle] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const cartItemCount = cart.length;

  const filters = [
    { id: 'PC', label: 'PC Games', type: 'platform', icon: Monitor },
    { id: 'PS5', label: 'PS Games', type: 'platform', icon: Gamepad2 },
    { id: 'Proofs', label: 'Proofs', type: 'category', icon: ShieldCheck, iconClass: 'text-green-400' },
    { id: 'Contact Us', label: 'Contact Us', type: 'category', icon: MessageCircle, iconClass: 'text-blue-400' }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        if (window.innerWidth < 640 && !searchQuery) {
          setIsMobileSearchActive(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // UPGRADE: Lightning Fast Search Logic
  // 1. If typing, filter and hard-cap to 8 results max to completely eliminate typing lag.
  // 2. If empty, show 6 popular/sale items as instant suggestions.
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return catalog
        .filter(game => (game.showInHero || game.onSale) && !game.categories?.includes('Bundles'))
        .slice(0, 6);
    }

    return catalog.filter(game => {
      if (game.categories?.some(cat => cat.toLowerCase() === 'bundles')) return false;
      return game.title.toLowerCase().includes(searchQuery.toLowerCase());
    }).slice(0, 8); // HARD CAP prevents DOM overload
  }, [catalog, searchQuery]);

  const handleBuyNow = (game: Game) => {
    setSelectedCategory('Game: ' + game.title);
    setIsSearchFocused(false);
    setIsMobileSearchActive(false);
    setActiveHoverTitle(null);
  };

  return (
    <nav className="relative flex items-center justify-between px-4 sm:px-6 lg:px-12 xl:px-24 py-4 sm:py-5 bg-[#06141B]/95 backdrop-blur-2xl border-b border-[#253745]/60 shadow-[0_4px_30px_rgba(0,0,0,0.4)] sticky top-0 z-50 gap-3 min-h-[64px]">

      <div className={`flex items-center gap-4 sm:gap-8 md:gap-14 overflow-hidden transition-all duration-300 ease-in-out ${isSearchFocused ? 'hidden sm:flex flex-1' : 'flex-1'} ${isMobileSearchActive ? 'hidden sm:flex' : 'flex'}`}>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex items-center gap-2 cursor-pointer shrink-0 group"
          onClick={() => setSelectedCategory('Store')}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-[#CCD0CF] to-[#9BA8AB] group-hover:opacity-90 transition-opacity">
              Store
            </span>
            <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded-full bg-[#253745]/50 border border-[#4A5C6A]/30 text-[#CCD0CF] whitespace-nowrap shadow-sm">
              VAULT
            </span>
          </motion.div>
        </motion.div>

        <div className={`hidden md:flex items-center gap-6 lg:gap-8 text-[11px] lg:text-xs font-bold tracking-wider uppercase text-[#9BA8AB] transition-opacity duration-200`}>
          {filters.map(filter => {
            const Icon = filter.icon;
            const isActive = filter.type === 'category'
              ? selectedCategory === filter.id
              : platformFilter === filter.id && selectedCategory === 'Store';

            const isProofsHover = filter.id === 'Proofs' && !isActive
              ? 'hover:border-green-500/50 hover:bg-green-500/5 hover:text-white'
              : 'hover:border-[#4A5C6A] hover:text-white';

            return (
              <button
                key={filter.id}
                onClick={() => {
                  if (filter.type === 'category') {
                    setSelectedCategory(filter.id);
                  } else {
                    setPlatformFilter(filter.id);
                    setSelectedCategory('Store');
                  }
                }}
                className={`group flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 border shadow-sm cursor-pointer shrink-0 whitespace-nowrap ${isActive
                    ? 'bg-[#4A5C6A] text-white border-[#4A5C6A]'
                    : `bg-[#11212D] text-[#9BA8AB] border-[#253745] ${isProofsHover}`
                  }`}
              >
                <Icon className={`w-3.5 h-3.5 transition-colors ${filter.iconClass || ''} ${isActive && filter.id === 'Proofs' ? 'text-green-300' : ''}`} />
                <span>{filter.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className={`flex items-center gap-2 sm:gap-4 transition-all duration-300 ${isMobileSearchActive ? 'w-full' : ''}`}>

        {!isMobileSearchActive && (
          <button
            onClick={() => setIsMobileSearchActive(true)}
            className="sm:hidden p-2 rounded-full text-[#9BA8AB] hover:text-white hover:bg-[#11212D] transition-colors"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <div
          className={`relative group transition-all duration-300 ease-in-out ${isMobileSearchActive ? 'flex-1 flex' : 'hidden sm:block'} ${isSearchFocused ? 'sm:w-[350px] lg:w-[400px]' : 'sm:w-[200px] lg:w-64'}`}
          ref={searchRef}
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5C6A] group-focus-within:text-white transition-colors z-10" />

          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            autoFocus={isMobileSearchActive}
            className="bg-[#11212D]/80 border border-[#253745] rounded-full py-2.5 pl-10 pr-9 text-xs font-medium text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-[#4A5C6A] focus:ring-2 focus:ring-[#4A5C6A]/20 transition-all w-full relative z-10 shadow-inner"
          />

          <button
            onClick={() => {
              setSearchQuery('');
              setIsSearchFocused(false);
              setActiveHoverTitle(null);
              if (window.innerWidth < 640) setIsMobileSearchActive(false);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-[#4A5C6A] hover:text-white z-20 p-1 transition-colors ${!searchQuery && window.innerWidth >= 640 ? 'hidden' : 'block'}`}
          >
            <X className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {isSearchFocused && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full mt-3 left-0 w-full sm:w-[350px] lg:w-[400px] bg-[#11212D]/95 backdrop-blur-3xl border border-[#253745] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.7)] overflow-hidden z-[100]"
              >
                <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto scroll-smooth p-2 space-y-1">

                  {/* Instant Suggestions Header */}
                  {!searchQuery && searchResults.length > 0 && (
                    <div className="px-3 pb-2 pt-3 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px] font-black text-[#9BA8AB] uppercase tracking-widest">Popular Suggestions</span>
                    </div>
                  )}

                  {searchResults.length > 0 ? (
                    searchResults.map(game => {
                      const inCart = cart.some(item => item.title === game.title);
                      const coverUrl = game.customCoverUrl || getGameCoverUrl(game.title);
                      const isHovered = activeHoverTitle === game.title;
                      return (
                        <div
                          key={game.title}
                          onMouseEnter={() => setActiveHoverTitle(game.title)}
                          onMouseLeave={() => setActiveHoverTitle(null)}
                          onClick={() => {
                            setSelectedCategory('Game: ' + game.title);
                            setSearchQuery('');
                            setIsSearchFocused(false);
                            if (window.innerWidth < 640) setIsMobileSearchActive(false);
                          }}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#06141B] transition-all cursor-pointer group/item border border-transparent hover:border-[#253745]"
                        >
                          <div className="w-12 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-[#253745] bg-[#06141B] shadow-sm">
                            <img
                              src={coverUrl}
                              alt={game.title}
                              className="w-full h-full object-cover object-center"
                              onError={(e) => {
                                if (e.currentTarget.src.includes('placeholder.jpg')) return;
                                e.currentTarget.src = '/placeholder.jpg';
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-[#CCD0CF] group-hover/item:text-white truncate uppercase tracking-wide">{game.title}</h4>

                            <div className="flex flex-wrap gap-1 mt-1">
                              {game.categories?.map(cat => {
                                const upper = String(cat).toUpperCase();
                                if (upper === 'PC' || upper === 'PS5' || upper === 'PS4' || upper.includes('PS')) {
                                  return (
                                    <span
                                      key={cat}
                                      className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#06141B] text-[#9BA8AB] border border-[#253745]"
                                    >
                                      {cat}
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            <p className="text-xs font-black text-white mt-1.5">{game.price}</p>
                          </div>

                          <div className="shrink-0 ml-2 flex gap-1">
                            {isHovered && window.innerWidth >= 640 ? (
                              <>
                                <motion.button
                                  initial={{ opacity: 0, scale: 0.9 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.9 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleBuyNow(game);
                                  }}
                                  className="flex items-center gap-1.5 bg-[#253745] hover:bg-[#4A5C6A] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all border border-[#4A5C6A]"
                                >
                                  <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                                  <span>Buy</span>
                                </motion.button>
                                {game.isRentable && (
                                  <motion.button
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCategory('Game: ' + game.title);
                                      setIsCartOpen(false);
                                      setSearchQuery('');
                                      setIsSearchFocused(false);
                                      if (window.innerWidth < 640) setIsMobileSearchActive(false);
                                    }}
                                    className="flex items-center gap-1.5 bg-[#253745] hover:bg-[#4A5C6A] text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-lg transition-all border border-[#4A5C6A]"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>Rent</span>
                                  </motion.button>
                                )}
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCategory('Game: ' + game.title);
                                    setIsSearchFocused(false);
                                    if (window.innerWidth < 640) setIsMobileSearchActive(false);
                                  }}
                                  disabled={inCart}
                                  className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all shadow-md ${inCart
                                      ? 'bg-[#4A5C6A] border-[#4A5C6A] text-white cursor-default'
                                      : 'bg-[#253745] border-[#4A5C6A]/50 text-[#9BA8AB] hover:text-white hover:bg-[#4A5C6A]'
                                    }`}
                                >
                                  {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                                </button>
                                {game.isRentable && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCategory('Game: ' + game.title);
                                      setIsCartOpen(false);
                                      setSearchQuery('');
                                      setIsSearchFocused(false);
                                      if (window.innerWidth < 640) setIsMobileSearchActive(false);
                                    }}
                                    className={`flex items-center justify-center w-9 h-9 rounded-full border transition-all shadow-md bg-[#253745] border-[#4A5C6A]/50 text-[#9BA8AB] hover:text-white hover:bg-[#4A5C6A]`}
                                  >
                                    <Clock className="w-4 h-4" />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-6 text-center space-y-3">
                      <p className="text-[#CCD0CF] text-xs font-bold uppercase tracking-wide">Didn't find your game?</p>
                      <p className="text-[#9BA8AB] text-[11px] leading-relaxed">
                        No titles found matching "{searchQuery}". Ask us directly and we'll get it for you!
                      </p>
                      <a
                        href={`https://wa.me/918824647379?text=${encodeURIComponent(`Hey, I am looking for a game not found in your store: "${searchQuery}"`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Ask on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className={`items-center gap-3 transition-all duration-300 flex ${isMobileSearchActive ? 'hidden' : ''}`}>
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-2.5 rounded-full bg-[#11212D]/60 border border-[#253745]/60 text-[#9BA8AB] hover:text-white hover:border-[#4A5C6A] transition-all cursor-pointer shadow-sm group shrink-0"
          >
            <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {cartItemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#4A5C6A] to-[#CCD0CF] text-[#06141B] text-[10px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-md border border-[#06141B]"
              >
                {cartItemCount}
              </motion.span>
            )}
          </button>
        </div>

      </div>
    </nav>
  );
}