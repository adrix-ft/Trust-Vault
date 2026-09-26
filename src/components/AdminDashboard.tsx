import React, { useState, useEffect } from 'react';
import { useStore, Game } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Trash2, Edit2, Copy, X, RefreshCw, Image as ImageIcon, Upload, ChevronLeft, ChevronRight, ShieldCheck, Clock, Layers, Gamepad2, Database, Package, Search } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

export default function AdminDashboard() {
  const { catalog, updateGame, addGame, removeGame, resetCatalog, setIsAdmin, collections, updateCollection, addCollection, removeCollection, showToast, setConfirmReq } = useStore();
  
  const [activeTab, setActiveTab] = useState<'catalog' | 'bundles' | 'upcoming' | 'collections' | 'proofs'>('bundles');
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
      console.error("Failed to fetch upcoming catalog:", err);
    }
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

  const defaultGame: Game = { title: '', price: '', categories: ['Store'], description: '', onSale: false, originalPrice: '', customCoverUrl: '', showInHero: false, isFeaturedPromo: false, isPlayerReview: false, trailer: '' };
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
  const openEditForm = (game: Game) => { setEditingTitle(game.title); setFormData({ ...defaultGame, ...game }); setShowForm(true); };

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
      const res = await fetch(`${API_BASE_URL}/api/games/details/${appid}`);
      const details = await res.json();
      
      const steamGame = steamResults.find(g => g.steam_app_id === appid);
      
      const rawDesc = details.detailed_description || details.about_the_game || details.short_description || '';
      
      const screenshots = details.screenshots?.map((s: any) => s.path_full) || [];
      const sysReqMin = details.pc_requirements?.minimum || '';
      const sysReqRec = details.pc_requirements?.recommended || '';

      setFormData({
        ...formData,
        title: details.name || steamGame?.title || formData.title,
        description: rawDesc || formData.description,
        customCoverUrl: steamGame?.header_image_url || formData.customCoverUrl,
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
    if (formData.title && formData.price) {
      const savedGame = {
        ...formData,
        price: formData.price.endsWith('Rs') ? formData.price : `${formData.price}Rs`,
        originalPrice: formData.onSale && formData.originalPrice ? (formData.originalPrice.endsWith('Rs') ? formData.originalPrice : `${formData.originalPrice}Rs`) : undefined,
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
  const existingBundles = catalog.filter(g => g.categories?.includes('Bundles'));

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
              <p className="text-[#9BA8AB] text-xs font-semibold tracking-wide mt-0.5">Amin Game Store Control Center</p>
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
            { id: 'bundles', label: 'Game Bundles', icon: Package, count: existingBundles.length },
            { id: 'upcoming', label: 'Upcoming Pre-Orders', icon: Clock, count: upcomingGames.length },
            { id: 'collections', label: 'Curated Collections', icon: Layers, count: collections.length },
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
                  {['All', 'PC', 'PS5', 'PS4', 'Bundles'].map(platform => (
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
                  Game Bundles Manager
                </h2>
                <p className="text-[#9BA8AB] text-xs mt-1">Combine multiple games into special deals with one click.</p>
              </div>
              <button 
                onClick={() => {
                  setBundleFormData(defaultBundle);
                  setBundleGameSearch('');
                  setShowBundleForm(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-500 hover:to-emerald-400 text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border border-emerald-500/50"
              >
                <Plus className="w-4 h-4" /> Create Bundle
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {existingBundles.map(bundle => (
                <div key={bundle.title} className="bg-[#11212D] rounded-2xl border border-[#253745] p-5 shadow-lg flex flex-col relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase tracking-wider mb-1">{bundle.title}</h3>
                      <div className="flex items-center gap-2 text-sm font-bold">
                        {bundle.originalPrice && <span className="text-red-400 line-through">{bundle.originalPrice}</span>}
                        <span className="text-white">{bundle.price}</span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => {
                          setBundleFormData({
                            title: bundle.title,
                            price: bundle.price,
                            originalPrice: bundle.originalPrice || '',
                            includedGames: bundle.description ? bundle.description.split(',').map(s => s.trim()) : [],
                            originalTitle: bundle.title,
                            platform: bundle.categories?.find(c => ['PC', 'PS5', 'PS4'].includes(c)) || 'All'
                          });
                          setBundleGameSearch('');
                          setShowBundleForm(true);
                        }}
                        className="p-2 bg-[#06141B] hover:bg-[#253745] text-[#9BA8AB] hover:text-white rounded-lg transition-colors border border-[#253745] cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { 
                          setConfirmReq({
                            message: `Delete bundle "${bundle.title}"?`,
                            onConfirm: () => {
                              removeGame(bundle.title);
                              showToast(`Deleted ${bundle.title}`, 'success');
                            }
                          });
                        }}
                        className="p-2 bg-[#06141B] hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-[#253745] hover:border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-auto bg-[#06141B] border border-[#253745] rounded-xl p-3">
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-[10px] text-[#4A5C6A] font-bold uppercase tracking-wider block">Games Included:</span>
                       {bundle.categories?.filter(c => ['PC', 'PS5', 'PS4'].includes(c)).map(plat => (
                          <span key={plat} className="text-[9px] bg-[#4A5C6A] text-white px-1.5 py-0.5 rounded font-bold">{plat}</span>
                       ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {bundle.description?.split(',').map(g => g.trim()).map(gameName => (
                        <span key={gameName} className="bg-[#253745] text-[#CCD0CF] text-[10px] px-2 py-1 rounded-md font-bold border border-[#4A5C6A]/50 truncate max-w-[150px]">
                          {gameName}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {existingBundles.length === 0 && (
                <div className="col-span-full py-16 text-center text-[#9BA8AB] text-xs font-bold uppercase tracking-wider border border-[#253745] border-dashed rounded-2xl bg-[#06141B]/50">
                  No bundles created yet. Click "Create Bundle" to combine games!
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'upcoming' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-[#253745] flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#11212D]">
              <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2.5">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Upcoming Pre-Order Games Catalog
                </h2>
                <p className="text-[#9BA8AB] text-xs mt-1">Manage upcoming games displayed on the client pre-order page</p>
              </div>
              <button 
                onClick={() => {
                  setEditingUpcomingId(null);
                  setUpcomingFormData(defaultUpcoming);
                  setShowUpcomingForm(true);
                }}
                className="flex items-center gap-2 bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white px-5 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border border-[#4A5C6A]/50"
              >
                <Plus className="w-4 h-4" /> Add Upcoming Game
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#06141B]/80 text-[#9BA8AB] text-[11px] uppercase tracking-wider border-b border-[#253745]">
                  <tr>
                    <th className="p-4 font-bold">Cover</th>
                    <th className="p-4 font-bold">Title</th>
                    <th className="p-4 font-bold">Price / Value</th>
                    <th className="p-4 font-bold">Expected Release Window</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253745]/60">
                  {upcomingGames.map((item) => (
                    <tr key={item.id} className="hover:bg-[#06141B]/40 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-16 bg-cover bg-center rounded-lg border border-[#253745] shadow-md" style={{ backgroundImage: `url('${item.customCoverUrl || getGameCoverUrl(item.title)}')` }} />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-sm text-white uppercase">{item.title}</div>
                        <span className="inline-block mt-1 bg-amber-500/15 text-amber-400 text-[9px] px-2 py-0.5 rounded-full font-black tracking-widest uppercase border border-amber-500/30">PRE-ORDER</span>
                      </td>
                      <td className="p-4 font-bold text-white text-sm">{item.price || 'TBA'}</td>
                      <td className="p-4 font-semibold text-amber-400 text-xs">{item.release_date || 'TBA'}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingUpcomingId(item.id); setUpcomingFormData({ title: item.title, price: item.price || '', release_date: item.release_date || '', customCoverUrl: item.customCoverUrl || '' }); setShowUpcomingForm(true); }} className="p-2.5 text-[#9BA8AB] hover:text-white hover:bg-[#253745] rounded-xl transition-colors border border-transparent hover:border-[#4A5C6A] cursor-pointer"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteUpcoming(item.id, item.title)} className="p-2.5 text-red-400 hover:bg-red-500/20 rounded-xl transition-colors border border-transparent hover:border-red-500/30 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'collections' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#11212D] border border-[#253745] p-6 rounded-2xl shadow-xl gap-4">
              <div>
                <h2 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2.5">
                  <Layers className="w-5 h-5 text-[#4A5C6A]" /> Curated Collections Manager
                </h2>
              </div>
              <button 
                onClick={() => {
                  setCollectionGameSearch('');
                  addCollection({ id: Date.now().toString(), title: 'New Collection', description: '', banner: 'default.jpg', keywords: [] });
                }} 
                className="flex items-center gap-2 bg-gradient-to-r from-[#253745] to-[#4A5C6A] text-white px-5 py-2.5 rounded-xl font-bold uppercase text-xs transition-all shadow-md cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add Collection
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {collections.map(collection => (
                <div key={collection.id} className="bg-[#11212D] border border-[#253745] rounded-2xl overflow-hidden shadow-2xl flex flex-col group relative">
                  <div className="aspect-[16/9] w-full relative overflow-hidden bg-[#06141B]">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105 saturate-[1.2]" style={{ backgroundImage: `url('${collection.customBannerUrl || getGameCoverUrl(collection.banner)}')` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#11212D] via-[#11212D]/30 to-black/40" />
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 z-20">
                      <button 
                        onClick={() => {
                          setCollectionGameSearch('');
                          setEditingCollection(collection);
                        }} 
                        className="p-2.5 bg-[#06141B]/90 hover:bg-[#253745] text-white rounded-xl shadow-lg border border-[#4A5C6A]/50 cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { 
                          setConfirmReq({
                            message: `Delete collection "${collection.title}"?`,
                            onConfirm: () => {
                              removeCollection(collection.id);
                              showToast(`Deleted ${collection.title}`, 'success');
                            }
                          });
                        }} 
                        className="p-2.5 bg-[#06141B]/90 hover:bg-red-500/20 text-red-400 rounded-xl shadow-lg border border-red-500/30 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 p-5 z-10 space-y-1">
                      <h3 className="text-lg font-black text-white uppercase tracking-wider">{collection.title}</h3>
                    </div>
                  </div>
                </div>
              ))}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#253745]">
                    {rents.map((rent: any) => (
                      <tr key={rent.id} className="hover:bg-[#06141B]/50 transition-colors">
                        <td className="p-4 text-white font-bold">{rent.customerName} <br/><span className="text-[#9BA8AB] font-normal">{rent.mobileNumber}</span></td>
                        <td className="p-4 text-white">
                          {rent.items?.map((item: any) => (
                            <div key={item.title}>{item.title} - {item.rentPeriod || 'Limited'}</div>
                          ))}
                        </td>
                        <td className="p-4 text-orange-400 font-bold">{rent.totalAmount}Rs</td>
                        <td className="p-4 text-[#9BA8AB]">{new Date(rent.created_at).toLocaleDateString()}</td>
                        <td className="p-4"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-md font-bold uppercase">{rent.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {showBundleForm && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBundleForm(false)} className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-sm cursor-pointer" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl relative z-10 my-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-black tracking-wider text-white uppercase flex items-center gap-2"><Package className="w-5 h-5 text-emerald-400" /> {bundleFormData.originalTitle ? 'Edit Bundle' : 'Create New Bundle'}</h2>
                  <button onClick={() => setShowBundleForm(false)} className="text-[#9BA8AB] hover:text-white cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleSaveBundle} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Bundle Name</label>
                      <input type="text" value={bundleFormData.title} onChange={e => setBundleFormData({...bundleFormData, title: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500" required placeholder="e.g. Spider-Man Ultimate Collection" />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Target Platform</label>
                      <select 
                        value={bundleFormData.platform} 
                        onChange={(e) => {
                          setBundleFormData({ ...bundleFormData, platform: e.target.value, includedGames: [] });
                        }} 
                        className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500"
                      >
                        <option value="All">All Platforms (Mixed Bundle)</option>
                        <option value="PC">PC Games Only</option>
                        <option value="PS5">PS5 Games Only</option>
                        <option value="PS4">PS4 Games Only</option>
                      </select>
                      <p className="text-[10px] text-[#4A5C6A] mt-1.5 font-semibold">Only games matching the selected platform can be added to this bundle.</p>
                    </div>

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Bundle Price (Rs)</label>
                      <input type="text" value={bundleFormData.price} onChange={e => setBundleFormData({...bundleFormData, price: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-emerald-500" required placeholder="199Rs" />
                    </div>
                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Original Value (Rs) - Optional</label>
                      <input type="text" value={bundleFormData.originalPrice} onChange={e => setBundleFormData({...bundleFormData, originalPrice: e.target.value})} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-red-400 text-xs focus:outline-none focus:border-emerald-500" placeholder="399Rs" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Select Games to Include</label>
                    <div className="relative mb-3">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5C6A]" />
                      <input 
                        type="text" 
                        placeholder={`Search ${bundleFormData.platform !== 'All' ? bundleFormData.platform : 'all'} catalog to add games...`} 
                        value={bundleGameSearch}
                        onChange={(e) => setBundleGameSearch(e.target.value)}
                        className="w-full bg-[#06141B] border border-[#253745] rounded-lg py-2 pl-9 pr-3 text-white text-xs focus:outline-none focus:border-emerald-500 shadow-inner"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-4 bg-[#06141B] border border-[#253745] rounded-xl shadow-inner">
                      {catalog
                        .filter(g => !g.categories?.includes('Bundles'))
                        .filter(g => {
                          if (bundleFormData.platform !== 'All') {
                            return g.categories?.includes(bundleFormData.platform);
                          }
                          return true;
                        })
                        .filter(g => g.title.toLowerCase().includes(bundleGameSearch.toLowerCase()))
                        .map(game => {
                          const isSelected = bundleFormData.includedGames.includes(game.title);
                          return (
                            <button
                              key={game.title} type="button"
                              onClick={() => {
                                const newIncluded = isSelected 
                                  ? bundleFormData.includedGames.filter(t => t !== game.title)
                                  : [...bundleFormData.includedGames, game.title];
                                setBundleFormData({...bundleFormData, includedGames: newIncluded});
                              }}
                              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border shadow-sm cursor-pointer ${
                                isSelected ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-[#11212D] text-[#9BA8AB] border-[#253745] hover:border-[#4A5C6A]'
                              }`}
                            >
                              {game.title}
                            </button>
                          );
                      })}
                    </div>
                    <p className="text-[10px] text-[#4A5C6A] mt-2 font-semibold uppercase tracking-wider">
                      Selected: {bundleFormData.includedGames.length} games
                    </p>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-[#253745]">
                    <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-500 hover:to-emerald-400 text-white py-3 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-md cursor-pointer border border-emerald-500/50">
                      Save Bundle
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {editingCollection && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setEditingCollection(null)} className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-sm cursor-pointer" />
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-xl relative z-10 my-8 space-y-5">
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-3xl relative z-10 my-8">
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

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Platforms & Categories</label>
                      <div className="flex gap-2 flex-wrap">
                        {['PC', 'PS5', 'PS4', 'Bundles'].map(plat => (
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
      </div>
    </div>
  );
}