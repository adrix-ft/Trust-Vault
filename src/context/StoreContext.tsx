import React, { createContext, useContext, useState, useEffect } from 'react';
import { gamesList as defaultGamesList, MASTER_CATALOG } from '../data/games';
import { getGameCoverUrl } from '../utils/image';

export type GameVariant = {
  name: string;
  price: string;
  originalPrice?: string;
};

export type Game = {
  title: string;
  price: string;
  categories?: string[];
  description?: string;
  originalPrice?: string;
  onSale?: boolean;
  customCoverUrl?: string;
  showInHero?: boolean;
  isFeaturedPromo?: boolean;
  isPlayerReview?: boolean;
  trailer?: string;
  genre?: string;
  isRentable?: boolean;
  rentPrice?: string;
  rentPeriod?: string;
  variants?: GameVariant[];
  screenshots?: string[];
  sysReqMinimum?: string;
  sysReqRecommended?: string;
};

export type Collection = {
  id: string;
  title: string;
  description: string;
  keywords: string[];
  banner: string;
  customBannerUrl?: string;
};

export type CartItem = Game & { purchaseType?: 'permanent' | 'rent' };
export type ToastType = 'success' | 'error' | 'info';
export type ToastMessage = { id: number; message: string; type: ToastType };
export type ConfirmRequest = { message: string; onConfirm: () => void };

type StoreContextType = {
  collections: Collection[];
  updateCollection: (id: string, updatedCollection: Collection) => void;
  addCollection: (collection: Collection) => void;
  removeCollection: (id: string) => void;
  cart: CartItem[];
  addToCart: (game: Game, purchaseType?: 'permanent' | 'rent') => void;
  removeFromCart: (title: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  playingTrailerUrl: string | null;
  setPlayingTrailerUrl: (url: string | null) => void;
  platformFilter: string;
  setPlatformFilter: (platform: string) => void;
  catalogLoaded: boolean;
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  showAdminLogin: boolean;
  setShowAdminLogin: (show: boolean) => void;
  catalog: Game[];
  updateGame: (oldTitle: string, updatedGame: Game) => void;
  addGame: (game: Game) => void;
  removeGame: (title: string) => void;
  resetCatalog: () => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastType) => void;
  removeToast: (id: number) => void;
  confirmReq: ConfirmRequest | null;
  setConfirmReq: (req: ConfirmRequest | null) => void;
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { const saved = localStorage.getItem('gaming_cart'); return saved ? JSON.parse(saved) : []; } catch { return []; }
  });

  const [catalog, setCatalog] = useState<Game[]>(() => {
    try {
      const savedCatalog = localStorage.getItem('amin_game_catalog');
      if (savedCatalog) {
        const parsed = JSON.parse(savedCatalog);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  });

  const [catalogLoaded, setCatalogLoaded] = useState(() => {
    try { return !!localStorage.getItem('amin_game_catalog'); } catch { return false; }
  });

  const [isAdmin, setIsAdmin] = useState(() => {
    try { return localStorage.getItem('gaming_admin') === 'true'; } catch { return false; }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmReq, setConfirmReq] = useState<ConfirmRequest | null>(null);

  const showToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const defaultCollections: Collection[] = [
    { id: 'spiderman', title: 'Spider-Man Franchise', description: 'Swing through the city...', keywords: ['Spider-Man'], banner: 'spider-man-miles-morales.jpg', customBannerUrl: '/assets/images/spider-man-miles-morales.jpg' },
    { id: 'tlou', title: 'The Last of Us Series', description: 'Experience the emotional storytelling...', keywords: ['The Last of Us'], banner: 'the-last-of-us-part-i.jpg', customBannerUrl: '/assets/images/the-last-of-us-part-i.jpg' },
    { id: 'assassinscreed', title: 'Assassin\'s Creed Collection', description: 'Explore history...', keywords: ['Assassin\'s Creed', 'Assassins Creed', 'Assassin s Creed'], banner: 'assassins-creed-shadows.jpg', customBannerUrl: '/assets/images/assassins-creed-shadows.jpg' },
    { id: 'soulslike', title: 'Soulslike & RPGs', description: 'Challenge yourself...', keywords: ['Elden Ring', 'Black Myth Wukong', 'Ghost of Tsushima'], banner: 'elden-ring-shadow-of-the-erdtree.jpg', customBannerUrl: '/assets/images/black-myth-wukong.jpg' }
  ];

  const [collections, setCollections] = useState<Collection[]>(() => {
    try {
      const saved = localStorage.getItem('amin_game_collections');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return defaultCollections;
  });

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/collections`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c: any) => ({
            ...c,
            customBannerUrl: c.custom_banner_url || c.customBannerUrl
          }));
          setCollections(formatted);
          localStorage.setItem('amin_game_collections', JSON.stringify(formatted));
        }
      } catch (error) { console.error(error); }
    };
    fetchCollections();
  }, []);

  const updateCollection = async (id: string, updatedCollection: Collection) => {
    setCollections(prev => {
      const next = prev.map(c => c.id === id ? updatedCollection : c);
      localStorage.setItem('amin_game_collections', JSON.stringify(next));
      return next;
    });
    try { await fetch(`${API_BASE_URL}/api/collections/${encodeURIComponent(id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedCollection) }); } catch (err) {}
  };

  const addCollection = async (newCollection: Collection) => {
    setCollections(prev => {
      const next = [...prev, newCollection];
      localStorage.setItem('amin_game_collections', JSON.stringify(next));
      return next;
    });
    try { await fetch(`${API_BASE_URL}/api/collections`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newCollection) }); } catch (err) {}
  };

  const removeCollection = async (id: string) => {
    setCollections(prev => {
      const next = prev.filter(c => c.id !== id);
      localStorage.setItem('amin_game_collections', JSON.stringify(next));
      return next;
    });
    try { await fetch(`${API_BASE_URL}/api/collections/${encodeURIComponent(id)}`, { method: 'DELETE' }); } catch (err) {}
  };

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setCatalog(data);
          localStorage.setItem('amin_game_catalog', JSON.stringify(data));
        }
        setCatalogLoaded(true);
      } catch (error) {
        setCatalogLoaded(true);
      }
    };
    fetchGames();
  }, []);

  useEffect(() => { localStorage.setItem('gaming_cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('gaming_admin', isAdmin.toString()); }, [isAdmin]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Store');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [playingTrailerUrl, setPlayingTrailerUrl] = useState<string | null>(null);

  const [platformFilter, setPlatformFilter] = useState(() => {
    try { return localStorage.getItem('gaming_platform_filter') || 'PC'; } catch { return 'PC'; }
  });

  useEffect(() => { localStorage.setItem('gaming_platform_filter', platformFilter); }, [platformFilter]);

  const addToCart = (game: Game, purchaseType: 'permanent' | 'rent' = 'permanent') => {
    setCart(prev => {
      const existing = prev.find(item => item.title === game.title);
      if (existing) return prev;
      return [...prev, { ...game, purchaseType }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (title: string) => { setCart(prev => prev.filter(item => item.title !== title)); };
  const clearCart = () => setCart([]);

  const updateGame = async (oldTitle: string, updatedGame: Game) => {
    setCatalog(prev => {
      const nextCatalog = prev.map(game => game.title === oldTitle ? updatedGame : game);
      localStorage.setItem('amin_game_catalog', JSON.stringify(nextCatalog));
      return nextCatalog;
    });
    setCart(prev => prev.map(item => item.title === oldTitle ? updatedGame : item));
    try { await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(oldTitle)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedGame) }); } catch (err) {}
  };

  const addGame = async (game: Game) => {
    setCatalog(prev => {
      const nextCatalog = [game, ...prev];
      localStorage.setItem('amin_game_catalog', JSON.stringify(nextCatalog));
      return nextCatalog;
    });
    try { await fetch(`${API_BASE_URL}/api/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(game) }); } catch (err) {}
  };

  const removeGame = async (title: string) => {
    setCatalog(prev => {
      const nextCatalog = prev.filter(game => game.title !== title);
      localStorage.setItem('amin_game_catalog', JSON.stringify(nextCatalog));
      return nextCatalog;
    });
    setCart(prev => prev.filter(item => item.title !== title));
    try { await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(title)}`, { method: 'DELETE' }); } catch (err) {}
  };

  const resetCatalog = () => {
    setCatalog([]);
    localStorage.setItem('amin_game_catalog', JSON.stringify([]));
    setCart([]);
  };

  return React.createElement(StoreContext.Provider, {
    value: {
      collections, updateCollection, addCollection, removeCollection,
      cart, addToCart, removeFromCart, clearCart,
      isCartOpen, setIsCartOpen,
      selectedCategory, setSelectedCategory,
      playingTrailerUrl, setPlayingTrailerUrl,
      platformFilter, setPlatformFilter,
      catalogLoaded,
      isAdmin, setIsAdmin,
      showAdminLogin, setShowAdminLogin,
      catalog, updateGame, addGame, removeGame, resetCatalog,
      toasts, showToast, removeToast, confirmReq, setConfirmReq
    }
  }, children);
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};