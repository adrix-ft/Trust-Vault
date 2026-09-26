import React, { useState, useEffect } from 'react';
import { useStore, Game } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Trash2, Edit2, Copy, X, RefreshCw, Image as ImageIcon, Upload, ChevronLeft, ChevronRight, ShieldCheck, Clock, Layers, Gamepad2, Database, Package, Search, MessageCircle, CheckCircle } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

export default function AdminDashboard() {
  const { catalog, updateGame, addGame, removeGame, resetCatalog, setIsAdmin, collections, updateCollection, addCollection, removeCollection, showToast, setConfirmReq } = useStore();
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'bundles' | 'proofs' | 'rents'>('bundles');
  const [showForm, setShowForm] = useState(false);
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'za' | 'priceLow' | 'priceHigh'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [showUpcomingForm, setShowUpcomingForm] = useState(false);
  const [editingUpcomingId, setEditingUpcomingId] = useState<string | null>(null);
  const defaultUpcoming = { title: '', price: '', release_date: '', customCoverUrl: '' };
  const [upcomingFormData, setUpcomingFormData] = useState(defaultUpcoming);
  const [rents, setRents] = useState<any[]>([]);

  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [collectionGameSearch, setCollectionGameSearch] = useState('');

  const [showBundleForm, setShowBundleForm] = useState(false);
  const defaultBundle = { title: '', price: '', originalPrice: '', includedGames: [] as string[], originalTitle: '', platform: 'All' };
  const [bundleFormData, setBundleFormData] = useState(defaultBundle);
  const [bundleGameSearch, setBundleGameSearch] = useState('');

  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkGamesList, setBulkGamesList] = useState('');
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const handleBulkAddSubmit = async () => {
    const lines = bulkGamesList.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) {
      showToast('Please enter at least one game name', 'error');
      return;
    }
    
    setBulkProgress(`Starting... 0/${lines.length}`);
    let successCount = 0;
    
    for (let i = 0; i < lines.length; i++) {
      const query = lines[i];
      setBulkProgress(`Searching Steam for "${query}" (${i + 1}/${lines.length})...`);
      
      try {
        const searchRes = await fetch(`${API_BASE_URL}/api/games/search?q=${encodeURIComponent(query)}`);
        const searchData = await searchRes.json();
        
        if (searchData.games && searchData.games.length > 0) {
          const bestMatch = searchData.games[0];

          // 🛡️ Deduplication Check: Skip if already in store
          const alreadyListed = catalog.some(game => game.title.toLowerCase() === bestMatch.title.toLowerCase());
          if (alreadyListed) {
            console.log(`Skipping ${bestMatch.title}, already in catalog`);
            continue;
          }

          setBulkProgress(`Fetching details for "${bestMatch.title}"...`);
          
          let res = await fetch(`${API_BASE_URL}/api/games/details/${bestMatch.steam_app_id}`);
          let details: any = null;
          
          if (!res.ok) {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${bestMatch.steam_app_id}&l=english`)}`;
            const proxyRes = await fetch(proxyUrl);
            const proxyData = await proxyRes.json();
            const rawSteamData = JSON.parse(proxyData.contents);
            if (rawSteamData && rawSteamData[bestMatch.steam_app_id]) {
              details = rawSteamData[bestMatch.steam_app_id].data;
            }
          } else {
            details = await res.json();
          }
          
          if (details) {
            const priceFinal = details.price_overview?.final;
            const priceRs = priceFinal ? Math.round(priceFinal / 100) : 0;
            const originalPriceFinal = details.price_overview?.initial;
            const originalPriceRs = originalPriceFinal && originalPriceFinal !== priceFinal ? Math.round(originalPriceFinal / 100) : undefined;
            
            const reqs = details.pc_requirements || {};
            const screenshots = details.screenshots?.map((s: any) => s.path_full) || [];
            const rawDesc = details.detailed_description || details.about_the_game || details.short_description || '';
            
            const gameObj: Game = {
              title: details.name,
              price: priceRs ? `${priceRs}Rs` : 'Free',
              onSale: !!originalPriceRs,
              originalPrice: originalPriceRs ? `${originalPriceRs}Rs` : undefined,
              categories: ['Store', 'PC', 'Steam'],
              description: rawDesc,
              customCoverUrl: bestMatch.library_image_url || bestMatch.header_image_url,
              horizontalCoverUrl: details.header_image || '',
              sysReqMinimum: reqs.minimum || '',
              sysReqRecommended: reqs.recommended || '',
              screenshots: screenshots,
              isRentable: false,
              variants: [
                { name: 'Primary online', price: '' },
                { name: 'Primary offline', price: '' },
                { name: 'Secondary access', price: '' }
              ]
            };
            
            await addGame(gameObj);
            successCount++;
          }
        } else {
          console.warn('No match found for: ' + query);
        }
      } catch (err) {
        console.error('Failed to add ' + query, err);
      }
    }
    
    setBulkProgress(null);
    setShowBulkAdd(false);
    setBulkGamesList('');
    showToast(`Bulk add complete. Added ${successCount} games.`, 'success');
  };

  useEffect(() => {
    fetchUpcomingAdmin();
    fetch(`${API_BASE_URL}/api/rents`).then(res => res.json()).then(data => { if(Array.isArray(data)) setRents(data); }).catch(e => console.error('Failed to fetch rents', e));
  }, []);

  const fetchUpcomingAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/upcoming`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUpcomingGames(data);
      }
    } catch (err) {
      // Upcoming endpoint removed, ignoring error
    }
  };

  const calculateRemaining = (createdAt: string, rentPeriod: string) => {
    if (!rentPeriod || rentPeriod === 'Limited') return null;
    const start = new Date(createdAt);
    const end = new Date(start);
    
    const parts = rentPeriod.split(' ');
    const num = parseInt(parts[0]);
    const unit = parts[1]?.toLowerCase();
    
    if (unit?.includes('month')) {
      end.setMonth(end.getMonth() + num);
    } else if (unit?.includes('day')) {
      end.setDate(end.getDate() + num);
    } else if (unit?.includes('week')) {
      end.setDate(end.getDate() + (num * 7));
    } else if (unit?.includes('year')) {
      end.setFullYear(end.getFullYear() + num);
    } else {
      return null;
    }
    
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const markRentAsDone = (id: string) => {
    setConfirmReq({
      message: 'Are you sure you want to mark this rent as Final Done?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/rents/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'DONE' })
          });
          if (res.ok) {
            setRents(rents.map(r => r.id === id ? { ...r, status: 'DONE' } : r));
            showToast('Rent marked as done', 'success');
          } else {
            showToast('Failed to update rent', 'error');
          }
        } catch (err) {
          showToast('Network error updating rent', 'error');
        }
      }
    });
  };

  const handleSaveUpcoming = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upcomingFormData.title) return;

    const payload = {
      title: upcomingFormData.title,
      price: upcomingFormData.price ? (upcomingFormData.price.endsWith('Rs') ? upcomingFormData.price : `${upcomingFormData.price}Rs`) : 'TBA',
      release_date: upcomingFormData.release_date || 'Coming Soon',
      customCoverUrl: upcomingFormData.customCoverUrl
    };

    try {
      if (editingUpcomingId) {
        await fetch(`${API_BASE_URL}/api/upcoming/${editingUpcomingId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        showToast('Upcoming game updated', 'success');
      } else {
        await fetch(`${API_BASE_URL}/api/upcoming`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        showToast('Upcoming game added', 'success');
      }
      setShowUpcomingForm(false);
      setEditingUpcomingId(null);
      setUpcomingFormData(defaultUpcoming);
      fetchUpcomingAdmin();
    } catch (err) {
      showToast("Network error saving upcoming game.", "error");
    }
  };

  const handleDeleteUpcoming = async (id: string, title: string) => {
    setConfirmReq({
      message: `Delete upcoming game "${title}" from catalog?`,
      onConfirm: async () => {
        try {
          await fetch(`${API_BASE_URL}/api/upcoming/${id}`, { method: 'DELETE' });
          fetchUpcomingAdmin();
          showToast(`Deleted ${title}`, 'success');
        } catch (err) {
          showToast('Failed to delete game', 'error');
        }
      }
    });
  };

  const handleSaveBundle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bundleFormData.title || !bundleFormData.price || bundleFormData.includedGames.length === 0) {
      showToast("Please provide a title, price, and select at least one game.", "error");
      return;
    }

    const bundleCategories = ['Store', 'Bundles'];
    if (bundleFormData.platform !== 'All') {
      bundleCategories.push(bundleFormData.platform);
    }

    const gameObj: Game = {
      title: bundleFormData.title,
      price: bundleFormData.price.endsWith('Rs') ? bundleFormData.price : `${bundleFormData.price}Rs`,
      originalPrice: bundleFormData.originalPrice ? (bundleFormData.originalPrice.endsWith('Rs') ? bundleFormData.originalPrice : `${bundleFormData.originalPrice}Rs`) : undefined,
      onSale: !!bundleFormData.originalPrice,
      description: bundleFormData.includedGames.join(', '), 
      categories: bundleCategories,
      customCoverUrl: '', 
      showInHero: false,
      isFeaturedPromo: false,
      trailer: ''
    };

    if (bundleFormData.originalTitle) {
      updateGame(bundleFormData.originalTitle, gameObj);
      showToast('Bundle updated', 'success');
    } else {
      addGame(gameObj);
      showToast('Bundle created', 'success');
    }
    setShowBundleForm(false);
  };

  const defaultGame: Game = { 
    title: '', price: '', categories: ['Store'], description: '', onSale: false, originalPrice: '', customCoverUrl: '', horizontalCoverUrl: '', showInHero: false, isFeaturedPromo: false, isPlayerReview: false, trailer: '',
    variants: [
      { name: 'Primary online', price: '' },
      { name: 'Primary offline', price: '' },
      { name: 'Secondary access', price: '' }
    ]
  };
  const [formData, setFormData] = useState<Game>(defaultGame);

  const parsePriceNum = (priceStr?: string) => {
    if (!priceStr) return 0;
    return parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 0;
  };

  const filteredCatalog = catalog.filter(game => {
    const matchesSearch = game.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (selectedPlatform === 'All') return true;
    return game.categories?.some(cat => cat.toLowerCase() === selectedPlatform.toLowerCase());
  }).sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'za') return b.title.localeCompare(a.title);
    if (sortBy === 'priceLow') return parsePriceNum(a.price) - parsePriceNum(b.price);
    if (sortBy === 'priceHigh') return parsePriceNum(b.price) - parsePriceNum(a.price);
    return 0;
  });

  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = filteredCatalog.slice(startIndex, startIndex + itemsPerPage);

  const openAddForm = () => { setEditingTitle(null); setFormData(defaultGame); setShowForm(true); };
  const openEditForm = (game: Game) => { setEditingTitle(game.title); setFormData({ ...defaultGame, ...game, variants: game.variants?.length ? game.variants : defaultGame.variants }); setShowForm(true); };

  const [steamResults, setSteamResults] = useState<any[]>([]);
  const [isSearchingSteam, setIsSearchingSteam] = useState(false);

  const searchSteam = async (query: string) => {
    if (!query) return;
    setIsSearchingSteam(true);
    try {
      // NOTE: Using the proxy backend endpoint implemented in server.js
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      const res = await fetch(`${API_BASE_URL}/api/games/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSteamResults(data.games || []);
    } catch (err) {
      showToast('Failed to search Steam', 'error');
    }
    setIsSearchingSteam(false);
  };

  const selectSteamGame = async (appid: number | string) => {
    setIsSearchingSteam(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
      let res = await fetch(`${API_BASE_URL}/api/games/details/${appid}`);
      let details: any = null;
      
      if (!res.ok) {
        // Fallback: If Render backend is rate-limited by Steam, use a client-side CORS proxy
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`)}`;
        const proxyRes = await fetch(proxyUrl);
        if (!proxyRes.ok) throw new Error('Game details not found via proxy');
        const proxyData = await proxyRes.json();
        
        // allorigins returns the raw string in `contents`
        const rawSteamData = JSON.parse(proxyData.contents);
        if (rawSteamData && rawSteamData[appid] && rawSteamData[appid].success) {
          details = rawSteamData[appid].data;
        } else {
          throw new Error('Game details not found on server or proxy');
        }
      } else {
        details = await res.json();
      }
      
      const steamGame = steamResults.find(g => g.steam_app_id === appid);
      
      const rawDesc = details.detailed_description || details.about_the_game || details.short_description || '';
      
      const screenshots = details.screenshots?.map((s: any) => s.path_full) || [];
      const sysReqMin = details.pc_requirements?.minimum || '';
      const sysReqRec = details.pc_requirements?.recommended || '';

      setFormData({
        ...formData,
        title: details.name || steamGame?.title || formData.title,
        description: rawDesc || formData.description,
        customCoverUrl: steamGame?.library_image_url || steamGame?.header_image_url || formData.customCoverUrl,
        screenshots: screenshots,
        sysReqMinimum: sysReqMin,
        sysReqRecommended: sysReqRec,
        categories: Array.from(new Set([...(formData.categories || []), 'PC', 'Steam']))
      });
      setSteamResults([]);
      showToast('Steam data populated', 'success');
    } catch (err) {
      showToast('Failed to fetch details', 'error');
    }
    setIsSearchingSteam(false);
  };

  const handleDuplicateGame = (game: Game) => {
    let newTitle = `${game.title} (Copy)`;
    while (catalog.some(g => g.title.toLowerCase() === newTitle.toLowerCase())) newTitle += ' (Copy)';
    addGame({ ...game, title: newTitle, showInHero: false, isFeaturedPromo: false, isPlayerReview: false });
    showToast(`Duplicated ${game.title}`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isPSGame = formData.categories?.some(c => c.includes('PS'));
    const isPCGame = formData.categories?.some(c => c.includes('PC'));
    const hasPrice = (isPCGame || !isPSGame) ? formData.price : (formData.variants && formData.variants.length > 0 && formData.variants[0].price);
    
    if (formData.title && hasPrice) {
      const basePrice = (isPCGame || !isPSGame) ? formData.price : formData.variants![0].price;
      const baseOriginal = (isPCGame || !isPSGame) ? formData.originalPrice : undefined;

      const savedGame = {
        ...formData,
        price: basePrice.endsWith('Rs') ? basePrice : `${basePrice}Rs`,
        originalPrice: (formData.onSale && baseOriginal) ? (baseOriginal.endsWith('Rs') ? baseOriginal : `${baseOriginal}Rs`) : undefined,
        variants: formData.variants?.map(v => ({
          ...v,
          price: v.price.endsWith('Rs') ? v.price : `${v.price}Rs`,
          originalPrice: v.originalPrice ? (v.originalPrice.endsWith('Rs') ? v.originalPrice : `${v.originalPrice}Rs`) : undefined
        }))
      };
      
      if (editingTitle) {
        updateGame(editingTitle, savedGame);
        showToast('Game updated', 'success');
      } else {
        addGame(savedGame);
        showToast('Game added', 'success');
      }
      setShowForm(false);
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => {
      const cats = prev.categories || [];
      if (cats.includes(category)) return { ...prev, categories: cats.filter(c => c !== category) };
      return { ...prev, categories: [...cats, category] };
    });
  };

  const currentCoverPreview = formData.customCoverUrl || (formData.title ? getGameCoverUrl(formData.title) : '');
  const existingBundles = catalog.filter(g => g.categories?.includes('Bundle-Eligible'));

  return (
    <div className="min-h-screen bg-[#06141B] text-[#CCD0CF] p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center bg-[#11212D]/80 backdrop-blur-md border border-[#253745] p-6 rounded-2xl shadow-xl gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#253745] to-[#4A5C6A] border border-[#4A5C6A]/50 flex items-center justify-center text-white shadow-lg">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-wider uppercase text-white">Admin Management Hub</h1>
              <p className="text-[#9BA8AB] text-xs font-semibold tracking-wide mt-0.5">Store Vault Control Center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                setConfirmReq({
                  message: 'Reset catalog to default? All custom changes will be lost permanently.',
                  onConfirm: () => {
                    resetCatalog();
                    showToast('Catalog reset to default successfully', 'success');
                  }
                });
              }}
              className="flex items-center gap-2 bg-[#06141B] hover:bg-[#253745] text-[#CCD0CF] px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all border border-[#253745] hover:border-[#4A5C6A] cursor-pointer shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Catalog
            </button>
            <button 
              onClick={() => setIsAdmin(false)}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all border border-red-500/30 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#11212D]/50 border border-[#253745] p-1.5 rounded-2xl overflow-x-auto">
          {[
            { id: 'catalog', label: 'Store Catalog', icon: Gamepad2, count: catalog.length },
            { id: 'bundles', label: 'Bundle Game List', icon: Package, count: existingBundles.length },
            { id: 'proofs', label: 'Customer Proofs', icon: ShieldCheck },
            { id: 'rents', label: 'Rent Tracking', icon: Database, count: rents.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? 'bg-gradient-to-r from-[#253745] to-[#4A5C6A] text-white shadow-lg border border-[#4A5C6A]' : 'text-[#9BA8AB] hover:text-white hover:bg-[#11212D] border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#4A5C6A]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${isActive ? 'bg-black/30 text-white' : 'bg-[#06141B] text-[#9BA8AB]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'catalog' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-5 border-b border-[#253745] flex flex-col lg:flex-row justify-between items-center gap-4 bg-[#11212D]">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input 
                  type="text" placeholder="Search store inventory..." value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="bg-[#06141B] border border-[#253745] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-[#4A5C6A] w-full sm:w-72 shadow-inner"
                />
                <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'PC', 'PS5', 'Bundle-Eligible'].map(platform => (
                    <button
                      key={platform}
                      onClick={() => { setSelectedPlatform(platform); setCurrentPage(1); }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border cursor-pointer ${
                        selectedPlatform === platform ? 'bg-[#253745] border-[#4A5C6A] text-white shadow-md' : 'bg-[#06141B] border-[#253745] text-[#9BA8AB] hover:border-[#4A5C6A]'
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={sortBy} onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                    className="bg-[#06141B] border border-[#253745] rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] w-full sm:w-auto shadow-inner"
                  >
                    <option value="default">Sort: Newest Added</option>
                    <option value="az">Alphabetical (A - Z)</option>
                    <option value="za">Alphabetical (Z - A)</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                <span className="text-xs text-[#9BA8AB]">Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredCatalog.length)} of {filteredCatalog.length}</span>
                <button 
                  onClick={() => setShowBulkAdd(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-emerald-900 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md whitespace-nowrap cursor-pointer border border-emerald-600/50"
                >
                  <Database className="w-4 h-4" /> Bulk Add
                </button>
                <button 
                  onClick={openAddForm}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md whitespace-nowrap cursor-pointer border border-[#4A5C6A]/50"
                >
                  <Plus className="w-4 h-4" /> Add Game
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#06141B]/80 text-[#9BA8AB] text-[11px] uppercase tracking-wider border-b border-[#253745]">
                  <tr>
                    <th className="p-4 font-bold">Cover</th>
                    <th className="p-4 font-bold w-1/4">Title & Status</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Platforms</th>
                    <th className="p-4 font-bold text-center">Store Placements</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253745]/60">
                  {currentTableData.map(game => (
                    <tr key={game.title} className="hover:bg-[#06141B]/40 transition-colors">
                      <td className="p-4">
                        <div 
                          className="w-12 h-16 bg-cover bg-center rounded-lg border border-[#253745] shadow-md"
                          style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm tracking-wide text-white uppercase truncate" title={game.title}>{game.title}</div>
                        {game.onSale && (
                          <span className="inline-block mt-1 bg-green-500/15 text-green-400 text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border border-green-500/30 shadow-sm">
                            ON SALE
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{game.price}</span>
                          {game.onSale && game.originalPrice && (
                            <span className="text-[11px] text-red-400 line-through decoration-red-400/50">{game.originalPrice}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {game.categories?.map(cat => (
                            <span key={cat} className="bg-[#253745]/80 text-[#9BA8AB] text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider whitespace-nowrap border border-[#4A5C6A]/30">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-1.5 flex-wrap w-full max-w-[170px] mx-auto">
                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.showInHero ? 'bg-[#4A5C6A] border-[#4A5C6A]' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input 
                              type="checkbox" checked={game.showInHero || false}
                              onChange={(e) => updateGame(game.title, { ...game, showInHero: e.target.checked })}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.showInHero ? 'text-white' : 'text-[#9BA8AB]'}`}>Hero</span>
                          </label>
                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.isFeaturedPromo ? 'bg-[#4A5C6A] border-[#4A5C6A]' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input 
                              type="checkbox" checked={game.isFeaturedPromo || false}
                              onChange={(e) => updateGame(game.title, { ...game, isFeaturedPromo: e.target.checked })}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.isFeaturedPromo ? 'text-white' : 'text-[#9BA8AB]'}`}>Promo</span>
                          </label>
                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.isPlayerReview ? 'bg-[#4A5C6A] border-[#4A5C6A]' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input 
                              type="checkbox" checked={game.isPlayerReview || false}
                              onChange={(e) => updateGame(game.title, { ...game, isPlayerReview: e.target.checked })}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.isPlayerReview ? 'text-white' : 'text-[#9BA8AB]'}`}>Review</span>
                          </label>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => handleDuplicateGame(game)} className="p-2 text-[#9BA8AB] hover:text-white hover:bg-[#253745] rounded-xl transition-colors cursor-pointer"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => openEditForm(game)} className="p-2 text-[#9BA8AB] hover:text-white hover:bg-[#253745] rounded-xl transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                          <button 
                            onClick={() => {
                              setConfirmReq({
                                message: `Are you sure you want to permanently remove ${game.title}?`,
                                onConfirm: () => {
                                  removeGame(game.title);
                                  showToast(`${game.title} removed`, 'success');
                                }
                              });
                            }} 
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="p-4 border-t border-[#253745] flex items-center justify-between bg-[#06141B]">
                <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-xs font-bold uppercase disabled:opacity-40 cursor-pointer"><ChevronLeft className="w-4 h-4" /> Previous</button>
                <span className="text-xs font-bold text-[#9BA8AB]">Page {currentPage} of {totalPages}</span>
                <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#11212D] border border-[#253745] text-xs font-bold uppercase disabled:opacity-40 cursor-pointer">Next <ChevronRight className="w-4 h-4" /></button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bundles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#11212D] border border-[#253745] p-6 rounded-2xl shadow-xl gap-4">
              <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-emerald-400" />
                  Bundle Game List
                </h2>
                <p className="text-[#9BA8AB] text-xs mt-1">Games tagged for visitors to create their own custom bundles.</p>
              </div>
            </div>

            <div className="overflow-x-auto bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl">
              <table className="w-full text-left">
                <thead className="bg-[#06141B]/80 text-[#9BA8AB] text-[11px] uppercase tracking-wider border-b border-[#253745]">
                  <tr>
                    <th className="p-4 font-bold">Cover</th>
                    <th className="p-4 font-bold w-1/4">Title & Status</th>
                    <th className="p-4 font-bold">Price</th>
                    <th className="p-4 font-bold">Platforms</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253745]/60">
                  {existingBundles.map(game => (
                    <tr key={game.title} className="hover:bg-[#06141B]/40 transition-colors">
                      <td className="p-4">
                        <div 
                          className="w-12 h-16 bg-cover bg-center rounded-lg border border-[#253745] shadow-md"
                          style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm tracking-wide text-white uppercase truncate" title={game.title}>{game.title}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-sm">{game.price}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1 max-w-[150px]">
                          {game.categories?.map(cat => (
                            <span key={cat} className="bg-[#253745]/80 text-[#9BA8AB] text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase tracking-wider whitespace-nowrap border border-[#4A5C6A]/30">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => openEditForm(game)} className="p-2 text-[#9BA8AB] hover:text-white hover:bg-[#253745] rounded-xl transition-colors cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {existingBundles.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-[#9BA8AB] text-xs font-bold uppercase tracking-wider">
                        No games tagged for custom bundles yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'proofs' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl p-8 shadow-2xl max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Upload Customer Proof</h2>
              <p className="text-[#9BA8AB] text-xs max-w-sm mx-auto">Publish transaction screenshots directly to the verification feed.</p>
            </div>
            
            <div className="bg-[#06141B] border border-[#253745] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Select Screenshot</span>
                <p className="text-[11px] text-[#9BA8AB]">Supports PNG, JPG, WEBP formats.</p>
              </div>
              <label className="cursor-pointer bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white px-6 py-3 rounded-xl flex items-center justify-center font-bold text-xs uppercase transition-all shadow-md shrink-0 border border-[#4A5C6A]/50">
                <Upload className="w-4 h-4 mr-2" />
                <span>Upload Screenshot</span>
                <input 
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = async () => {
                        const base64Image = reader.result as string;
                        try {
                          const res = await fetch(`${API_BASE_URL}/api/upload-proof`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ base64Image })
                          });
                          const data = await res.json();
                          if (data.success) {
                            showToast('Customer proof uploaded successfully!', 'success');
                          } else {
                            showToast(`Upload failed: ${data.error || 'Unknown error'}`, 'error');
                          }
                        } catch (err) {
                          console.error('Proof upload failed', err);
                          showToast('Network error during upload.', 'error');
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          </div>
        )}

        {activeTab === 'rents' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 shadow-2xl">
            <h2 className="text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
              <Database className="w-5 h-5 text-orange-400" /> Rent Tracking
            </h2>
            {rents.length === 0 ? (
              <p className="text-[#9BA8AB] text-xs">No active rents found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#06141B] text-[#9BA8AB] uppercase tracking-wider border-b border-[#253745]">
                    <tr>
                      <th className="p-4 font-bold">Customer Info</th>
                      <th className="p-4 font-bold">Games</th>
                      <th className="p-4 font-bold">Amount</th>
                      <th className="p-4 font-bold">Date</th>
                      <th className="p-4 font-bold">Status</th>
                      <th className="p-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#253745]">
                    {rents.map((rent: any) => {
                      const isDone = rent.status === 'DONE';
                      return (
                      <tr key={rent.id} className="hover:bg-[#06141B]/50 transition-colors">
                        <td className="p-4 text-white font-bold">{rent.customerName} <br/><span className="text-[#9BA8AB] font-normal">{rent.mobileNumber}</span></td>
                        <td className="p-4 text-white">
                          {rent.items?.map((item: any) => {
                             const remainingDays = calculateRemaining(rent.created_at, item.rentPeriod);
                             const isOver = remainingDays !== null && remainingDays <= 0;
                             
                             return (
                               <div key={item.title} className="mb-2">
                                 <div>{item.title} - {item.rentPeriod || 'Limited'}</div>
                                 {!isDone && remainingDays !== null && (
                                   <div className={`text-[10px] font-bold ${isOver ? 'text-red-400' : 'text-emerald-400'}`}>
                                     {isOver ? 'Period Over' : `${remainingDays} Days Remaining`}
                                   </div>
                                 )}
                               </div>
                             );
                          })}
                        </td>
                        <td className="p-4 text-orange-400 font-bold">{rent.totalAmount}Rs</td>
                        <td className="p-4 text-[#9BA8AB]">{new Date(rent.created_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md font-bold uppercase ${isDone ? 'bg-gray-500/20 text-gray-400' : 'bg-green-500/20 text-green-400'}`}>
                            {rent.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {!isDone && rent.items?.some((item: any) => {
                               const days = calculateRemaining(rent.created_at, item.rentPeriod);
                               return days !== null && days <= 0;
                            }) && (
                              <a 
                                href={`https://wa.me/${rent.mobileNumber}?text=${encodeURIComponent('Hi ' + rent.customerName + ', your game rent period is over. Please renew or return.')}`} 
                                target="_blank" 
                                rel="noreferrer"
                                className="bg-green-500/20 text-green-400 p-2 rounded-lg hover:bg-green-500/40 transition-colors cursor-pointer"
                                title="Send WhatsApp Reminder"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            
                            {!isDone && (
                              <button 
                                onClick={() => markRentAsDone(rent.id)}
                                className="bg-orange-500/20 text-orange-400 p-2 rounded-lg hover:bg-orange-500/40 transition-colors cursor-pointer"
                                title="Mark as Final Done"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        

        <AnimatePresence>
          {editingCollection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCollection(null)} className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-sm cursor-pointer" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-xl relative z-10 my-8 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-black tracking-wider text-white uppercase">Edit Collection</h2>
                  <button onClick={() => setEditingCollection(null)} className="text-[#9BA8AB] hover:text-white p-2 cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Collection Title</label>
                    <input 
                      type="text" 
                      value={editingCollection.title} 
                      onChange={(e) => setEditingCollection({...editingCollection, title: e.target.value})}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" 
                    />
                  </div>
                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Description</label>
                    <textarea 
                      value={editingCollection.description || ''} 
                      onChange={(e) => setEditingCollection({...editingCollection, description: e.target.value})}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A] h-20 resize-none" 
                    />
                  </div>
                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Banner Image URL</label>
                    <input 
                      type="text" 
                      value={editingCollection.customBannerUrl || ''} 
                      onChange={(e) => setEditingCollection({...editingCollection, customBannerUrl: e.target.value})}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" 
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Assigned Games (Toggle Keywords)</label>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5C6A]" />
                      <input 
                        type="text" 
                        placeholder="Search catalog to assign..." 
                        value={collectionGameSearch}
                        onChange={(e) => setCollectionGameSearch(e.target.value)}
                        className="w-full bg-[#06141B] border border-[#253745] rounded-lg py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A] shadow-inner"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-3 bg-[#06141B] border border-[#253745] rounded-xl shadow-inner">
                      {catalog
                        .filter(g => g.title.toLowerCase().includes(collectionGameSearch.toLowerCase()))
                        .map(game => {
                          const isAssigned = editingCollection.keywords?.some((kw: string) => game.title.includes(kw));
                          return (
                            <button
                              key={game.title}
                              type="button"
                              onClick={() => {
                                const currentKw = editingCollection.keywords || [];
                                const updatedKw = isAssigned 
                                  ? currentKw.filter((k: string) => !game.title.includes(k))
                                  : [...currentKw, game.title];
                                setEditingCollection({...editingCollection, keywords: updatedKw});
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors border cursor-pointer ${
                                isAssigned 
                                  ? 'bg-[#4A5C6A] text-white border-[#4A5C6A]' 
                                  : 'bg-[#11212D] text-[#9BA8AB] border-[#253745] hover:border-[#4A5C6A]'
                              }`}
                            >
                              {game.title} {isAssigned ? ' ' : '+'}
                            </button>
                          );
                      })}
                      {catalog.filter(g => g.title.toLowerCase().includes(collectionGameSearch.toLowerCase())).length === 0 && (
                         <div className="text-xs text-[#4A5C6A] italic py-2">No games found matching your search.</div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#253745]">
                    <button 
                      onClick={() => {
                        updateCollection(editingCollection.id, editingCollection);
                        setEditingCollection(null);
                        showToast('Collection updated', 'success');
                      }}
                      className="w-full bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border border-[#4A5C6A]/50"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)} className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-sm cursor-pointer" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl relative z-10 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black tracking-wider text-white uppercase">{editingTitle ? 'Edit Game' : 'Add New Game'}</h2>
                  <button onClick={() => setShowForm(false)} className="text-[#9BA8AB] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-[#9BA8AB] text-[11px] font-bold uppercase tracking-wide">Cover Preview</label>
                    <div className="aspect-[3/4] rounded-xl border-2 border-dashed border-[#253745] overflow-hidden flex flex-col items-center justify-center bg-[#06141B] relative shadow-inner">
                      {currentCoverPreview ? (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${currentCoverPreview}')` }} />
                      ) : (
                        <>
                          <ImageIcon className="w-10 h-10 text-[#253745] mb-2" />
                          <span className="text-[#4A5C6A] text-xs">No image</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Game Title</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" required />
                        <button type="button" onClick={() => searchSteam(formData.title)} disabled={isSearchingSteam} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-3 flex items-center justify-center font-bold text-xs uppercase shrink-0 transition-colors disabled:opacity-50">
                          <Search className="w-3.5 h-3.5 mr-1.5" /> Steam
                        </button>
                      </div>

                      {steamResults.length > 0 && (
                        <div className="mt-2 bg-[#06141B] border border-[#253745] rounded-xl max-h-40 overflow-y-auto z-50 p-1 shadow-2xl relative">
                          <button type="button" onClick={() => setSteamResults([])} className="absolute right-2 top-2 text-[#4A5C6A] hover:text-white"><X className="w-3 h-3" /></button>
                          {steamResults.map(game => (
                             <div key={game.steam_app_id} onClick={() => selectSteamGame(game.steam_app_id)} className="flex items-center gap-3 p-2 hover:bg-[#11212D] cursor-pointer rounded-lg transition-colors mt-4 first:mt-0">
                               <img src={game.cover_image_url} alt={game.title} className="w-8 h-10 object-cover rounded" />
                               <span className="text-xs text-white font-bold">{game.title}</span>
                             </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Cover URL / Upload</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.customCoverUrl || ''} onChange={e => setFormData({...formData, customCoverUrl: e.target.value})} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="Image URL" />
                        <label className="cursor-pointer bg-[#253745] hover:bg-[#4A5C6A] border border-[#4A5C6A] text-white rounded-xl px-4 py-3 flex items-center justify-center font-bold text-xs uppercase transition-colors shrink-0">
                          <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = async () => {
                                const base64Image = reader.result as string;
                                try {
                                  const res = await fetch(`${API_BASE_URL}/api/upload`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ title: formData.title || 'untitled', base64Image })
                                  });
                                  const data = await res.json();
                                  if (data.url) setFormData({...formData, customCoverUrl: data.url});
                                } catch (err) { console.error(err); }
                              };
                              reader.readAsDataURL(file);
                            }
                          }} />
                        </label>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Hero Horizontal Cover URL</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.horizontalCoverUrl || ''} onChange={e => setFormData({...formData, horizontalCoverUrl: e.target.value})} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="Horizontal Image URL (for Hero Banner)" />
                      </div>
                    </div>

                    {/* UPGRADE: New section for Store Placements inside the Edit Game modal */}
                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Store Placements</label>
                      <div className="flex items-center gap-3 bg-[#06141B] border border-[#253745] rounded-xl p-3 h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                          <input type="checkbox" checked={formData.showInHero || false} onChange={e => setFormData({...formData, showInHero: e.target.checked})} className="accent-[#4A5C6A] cursor-pointer" />
                          <span>Hero Carousel</span>
                        </label>
                        <div className="w-px h-4 bg-[#253745]" />
                        <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                          <input type="checkbox" checked={formData.isFeaturedPromo || false} onChange={e => setFormData({...formData, isFeaturedPromo: e.target.checked})} className="accent-[#4A5C6A] cursor-pointer" />
                          <span>Promo Banner</span>
                        </label>
                        <div className="w-px h-4 bg-[#253745]" />
                        <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                          <input type="checkbox" checked={formData.isPlayerReview || false} onChange={e => setFormData({...formData, isPlayerReview: e.target.checked})} className="accent-[#4A5C6A] cursor-pointer" />
                          <span>Player Review</span>
                        </label>
                      </div>
                    </div>

                    {(formData.categories?.some(c => c.includes('PC')) || !formData.categories?.some(c => c.includes('PS'))) && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Price (Rs)</label>
                            <input type="text" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="199Rs" required />
                          </div>
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Sale Status</label>
                            <label className="flex items-center gap-2 bg-[#06141B] border border-[#253745] rounded-xl p-3 cursor-pointer text-white text-xs h-[42px]">
                              <input type="checkbox" checked={formData.onSale || false} onChange={e => setFormData({...formData, onSale: e.target.checked})} className="accent-[#4A5C6A] cursor-pointer" />
                              <span>Mark On Sale</span>
                            </label>
                          </div>
                        </div>

                        {formData.onSale && (
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Original Price (Rs)</label>
                            <input type="text" value={formData.originalPrice || ''} onChange={e => setFormData({...formData, originalPrice: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-red-400 text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="399Rs" />
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Rent Options</label>
                      <label className="flex items-center gap-2 bg-[#06141B] border border-[#253745] rounded-xl p-3 cursor-pointer text-white text-xs h-[42px] mb-3">
                        <input type="checkbox" checked={formData.isRentable || false} onChange={e => setFormData({...formData, isRentable: e.target.checked})} className="accent-[#4A5C6A] cursor-pointer" />
                        <span>Enable Renting</span>
                      </label>
                    </div>

                    {formData.isRentable && (
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div>
                          <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Rent Price Per Month (Rs)</label>
                          <input type="text" value={formData.rentPrice || ''} onChange={e => setFormData({...formData, rentPrice: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="99Rs" />
                        </div>
                      </div>
                    )}

                    {formData.categories?.some(c => c.includes('PS')) && (
                      <div className="pt-4 border-t border-[#253745]">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-[#9BA8AB] text-[11px] font-bold uppercase">Game Variants (Editions)</label>
                          <button 
                            type="button" 
                            onClick={() => {
                              const currentVariants = formData.variants || [];
                              setFormData({...formData, variants: [...currentVariants, { name: 'New Edition', price: '' }]});
                            }}
                            className="bg-[#253745] hover:bg-[#4A5C6A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            + Add Variant
                          </button>
                        </div>
                        
                        {formData.variants && formData.variants.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {formData.variants.map((variant, index) => (
                              <div key={index} className="flex gap-2 items-start bg-[#06141B] border border-[#253745] p-3 rounded-xl">
                                <div className="flex-1 space-y-2">
                                  <input 
                                    type="text" 
                                    value={variant.name} 
                                    onChange={e => {
                                      const newVariants = [...(formData.variants || [])];
                                      newVariants[index].name = e.target.value;
                                      setFormData({...formData, variants: newVariants});
                                    }} 
                                    placeholder="Edition Name" 
                                    className="w-full bg-[#11212D] border border-[#253745] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" 
                                  />
                                  <div className="flex gap-2">
                                    <input 
                                      type="text" 
                                      value={variant.price} 
                                      onChange={e => {
                                        const newVariants = [...(formData.variants || [])];
                                        newVariants[index].price = e.target.value;
                                        setFormData({...formData, variants: newVariants});
                                      }} 
                                      placeholder="Price" 
                                      className="w-1/2 bg-[#11212D] border border-[#253745] rounded-lg p-2 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" 
                                    />
                                    <input 
                                      type="text" 
                                      value={variant.originalPrice || ''} 
                                      onChange={e => {
                                        const newVariants = [...(formData.variants || [])];
                                        newVariants[index].originalPrice = e.target.value;
                                        setFormData({...formData, variants: newVariants});
                                      }} 
                                      placeholder="Original Price" 
                                      className="w-1/2 bg-[#11212D] border border-[#253745] rounded-lg p-2 text-red-400 text-xs focus:outline-none focus:border-[#4A5C6A]" 
                                    />
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    const newVariants = (formData.variants || []).filter((_, i) => i !== index);
                                    setFormData({...formData, variants: newVariants});
                                  }}
                                  className="text-red-400 hover:text-white hover:bg-red-500/20 p-2 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Platforms & Categories</label>
                      <div className="flex gap-2 flex-wrap">
                        {['PC', 'PS5', 'Bundle-Eligible'].map(plat => (
                          <button 
                            key={plat} 
                            type="button" 
                            onClick={() => handleCategoryToggle(plat)} 
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-colors cursor-pointer ${
                              formData.categories?.includes(plat) 
                                ? 'bg-white text-[#06141B] border-white shadow-md' 
                                : 'bg-[#06141B] text-[#9BA8AB] border-[#253745] hover:border-[#4A5C6A]'
                            }`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-[#253745]">
                      <button type="submit" className="bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border border-[#4A5C6A]/50">
                        {editingTitle ? 'Update Game' : 'Save Game'}
                      </button>
                    </div>

                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        {showBundleForm && (
          // existing code... omitted here to preserve context!
          null
        )}
      </div>

      {showBulkAdd && (
        <div className="fixed inset-0 bg-[#06141B]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#11212D] w-full max-w-xl rounded-3xl shadow-2xl border border-[#253745] overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-[#253745] flex justify-between items-center bg-[#06141B]/50 sticky top-0 z-10">
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                Bulk Add from Steam
              </h2>
              <button 
                onClick={() => !bulkProgress && setShowBulkAdd(false)} 
                disabled={!!bulkProgress}
                className="text-[#9BA8AB] hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-4">
                <p className="text-sm text-[#9BA8AB]">
                  Paste a list of game names (one per line). The system will automatically search Steam for the best match, pull all data (images, descriptions, system requirements, prices), and add them to your Store Catalog.
                </p>
                <textarea
                  value={bulkGamesList}
                  onChange={(e) => setBulkGamesList(e.target.value)}
                  disabled={!!bulkProgress}
                  placeholder="e.g.&#10;Grand Theft Auto V&#10;Red Dead Redemption 2&#10;God of War"
                  className="w-full h-64 bg-[#06141B] border border-[#253745] rounded-xl p-4 text-sm text-white placeholder-[#4A5C6A] focus:outline-none focus:border-emerald-500 transition-colors"
                />
                
                {bulkProgress && (
                  <div className="bg-[#06141B] border border-emerald-500/30 rounded-xl p-4 flex items-center gap-3">
                    <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                    <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">{bulkProgress}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-[#253745] flex justify-end gap-3 bg-[#06141B]/50 sticky bottom-0">
              <button 
                type="button" onClick={() => setShowBulkAdd(false)} disabled={!!bulkProgress}
                className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs border border-[#253745] text-[#9BA8AB] hover:text-white hover:bg-[#253745] transition-all cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleBulkAddSubmit} disabled={!!bulkProgress || !bulkGamesList.trim()}
                className="px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-xs bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {bulkProgress ? 'Processing...' : 'Start Bulk Import'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}