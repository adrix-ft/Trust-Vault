import React, { useState, useEffect } from 'react';
import { useStore, Game } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Plus, Trash2, Edit2, Copy, X, RefreshCw, Image as ImageIcon, Upload, ChevronLeft, ChevronRight, ShieldCheck, Clock, Layers, Gamepad2, Database, Package, Search, MessageCircle, CheckCircle, Repeat, GripVertical, ExternalLink, Star, Monitor, ArrowUpToLine, ArrowDownToLine, List } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://store-vault-backend.onrender.com';

export default function AdminDashboard() {
  const { catalog, heroOrder, setHeroOrder, updateGame, addGame, removeGame, reorderCatalog, resetCatalog, setIsAdmin, collections, updateCollection, addCollection, removeCollection, bundleDiscounts, updateBundleDiscounts, showToast, setConfirmReq } = useStore();

  const [activeTab, setActiveTab] = useState<'pc_games' | 'ps_games' | 'hero_pc' | 'hero_ps' | 'bundles' | 'proofs' | 'rents' | 'subscriptions'>('bundles');
  const [showForm, setShowForm] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'basic' | 'media' | 'pricing' | 'tags'>('basic');
  const [customTagInput, setCustomTagInput] = useState('');
  const [editingTitle, setEditingTitle] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All');
  const [sortBy, setSortBy] = useState<'default' | 'az' | 'za' | 'priceLow' | 'priceHigh'>('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [viewAll, setViewAll] = useState(false);

  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [showUpcomingForm, setShowUpcomingForm] = useState(false);
  const [editingUpcomingId, setEditingUpcomingId] = useState<string | null>(null);
  const defaultUpcoming = { title: '', price: '', release_date: '', customCoverUrl: '' };
  const [upcomingFormData, setUpcomingFormData] = useState(defaultUpcoming);
  const [rents, setRents] = useState<any[]>([]);
  const [proofs, setProofs] = useState<string[]>([]);

  useEffect(() => {
    if (activeTab === 'proofs') {
      fetchProofsAdmin();
    }
  }, [activeTab]);

  const fetchProofsAdmin = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/proofs`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setProofs(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProof = (url: string) => {
    setConfirmReq({
      message: 'Are you sure you want to permanently delete this proof screenshot?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/proofs`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
          });
          if (res.ok) {
            setProofs(proofs.filter(p => p !== url));
            showToast('Proof deleted successfully', 'success');
          } else {
            showToast('Failed to delete proof', 'error');
          }
        } catch (err) {
          showToast('Network error deleting proof', 'error');
        }
      }
    });
  };

  const [showRentForm, setShowRentForm] = useState(false);
  const defaultRent = { customerName: '', mobileNumber: '', totalAmount: '', items: [{ title: '', startDate: '', endDate: '' }] };
  const [rentFormData, setRentFormData] = useState(defaultRent);
  const [activeRentGameSearch, setActiveRentGameSearch] = useState<number | null>(null);

  const handleSaveRent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rentFormData.customerName || !rentFormData.mobileNumber) {
      showToast('Name and mobile are required', 'error');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/rents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: rentFormData.customerName,
          mobileNumber: rentFormData.mobileNumber,
          totalAmount: parseInt(rentFormData.totalAmount) || 0,
          items: rentFormData.items.filter(i => i.title)
        })
      });
      if (res.ok) {
        const data = await res.json();
        setRents([...rents, data.data]);
        setShowRentForm(false);
        setRentFormData(defaultRent);
        showToast('Rent record created', 'success');
      } else {
        showToast('Failed to create rent', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const [editingCollection, setEditingCollection] = useState<any | null>(null);
  const [collectionGameSearch, setCollectionGameSearch] = useState('');

  const [showBundleForm, setShowBundleForm] = useState(false);
  const defaultBundle = { title: '', price: '', originalPrice: '', includedGames: [] as string[], originalTitle: '', platform: 'All' };
  const [bundleFormData, setBundleFormData] = useState(defaultBundle);
  const [bundleGameSearch, setBundleGameSearch] = useState('');

  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkGamesList, setBulkGamesList] = useState('');
  const [bulkProgress, setBulkProgress] = useState<string | null>(null);

  const defaultSubscription = { name: '', logoUrl: '', bannerUrl: '', themeColor: '#10b981', badge: '', description: '', pricing: [{ duration: '', price: '', originalPrice: '' }], details: '' };
  const [subFormData, setSubFormData] = useState(defaultSubscription);
  const [editingSubId, setEditingSubId] = useState<string | null>(null);

  const { subscriptions, addSubscription, updateSubscription, removeSubscription, reorderSubscriptions } = useStore();
  const [draggedSubIndex, setDraggedSubIndex] = useState<number | null>(null);
  const [draggedGameTitle, setDraggedGameTitle] = useState<string | null>(null);

  const handleSaveSubscription = () => {
    if (!subFormData.name || subFormData.pricing.length === 0) {
      showToast('Name and at least one pricing option are required', 'error');
      return;
    }

    const newSub = {
      id: editingSubId || Date.now().toString(),
      name: subFormData.name,
      logoUrl: subFormData.logoUrl,
      bannerUrl: subFormData.bannerUrl,
      themeColor: subFormData.themeColor,
      badge: subFormData.badge,
      description: subFormData.description,
      pricing: subFormData.pricing.filter(p => p.duration && p.price),
      details: subFormData.details.split('\n').map(d => d.trim()).filter(Boolean)
    };

    if (editingSubId) {
      updateSubscription(editingSubId, newSub);
      showToast('Subscription updated', 'success');
    } else {
      addSubscription(newSub);
      showToast('Subscription added', 'success');
    }

    setSubFormData(defaultSubscription);
    setEditingSubId(null);
  };

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
                { name: 'Secondary Access - 30 Days', price: '' },
                { name: 'Secondary Access - Permanent', price: '' },
                { name: 'Primary Offline - 30 Days', price: '' },
                { name: 'Primary Offline - Permanent', price: '' },
                { name: 'Primary online - Permanent', price: '' }
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
    fetch(`${API_BASE_URL}/api/rents`).then(res => res.json()).then(data => { if (Array.isArray(data)) setRents(data); }).catch(e => console.error('Failed to fetch rents', e));
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

  const calculateRemaining = (item: any, createdAt: string) => {
    if (item.endDate) {
      const end = new Date(item.endDate);
      const now = new Date();
      const diffTime = end.getTime() - now.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    if (!item.rentPeriod || item.rentPeriod === 'Limited') return null;
    const start = new Date(createdAt);
    const end = new Date(start);

    const parts = item.rentPeriod.split(' ');
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

  const handleDeleteRent = (id: string) => {
    setConfirmReq({
      message: 'Are you sure you want to completely delete this rent record?',
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/rents/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setRents(rents.filter(r => r.id !== id));
            showToast('Rent record deleted', 'success');
          } else {
            showToast('Failed to delete rent', 'error');
          }
        } catch (err) {
          showToast('Network error deleting rent', 'error');
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
      { name: 'Secondary Access - 30 Days', price: '' },
      { name: 'Secondary Access - Permanent', price: '' },
      { name: 'Primary Offline - 30 Days', price: '' },
      { name: 'Primary Offline - Permanent', price: '' },
      { name: 'Primary online - Permanent', price: '' }
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

    if (activeTab === 'hero_pc') {
      return game.showInHero && game.categories?.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM');
    } else if (activeTab === 'hero_ps') {
      return game.showInHero && game.categories?.some(c => c.toUpperCase().includes('PS'));
    } else if (activeTab === 'ps_games') {
      return game.categories?.some(c => c.toUpperCase().includes('PS'));
    } else if (activeTab === 'pc_games') {
      return game.categories?.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM');
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'az') return a.title.localeCompare(b.title);
    if (sortBy === 'za') return b.title.localeCompare(a.title);
    if (sortBy === 'priceLow') return parsePriceNum(a.price) - parsePriceNum(b.price);
    if (sortBy === 'priceHigh') return parsePriceNum(b.price) - parsePriceNum(a.price);

    
    if ((activeTab === 'hero_pc' || activeTab === 'hero_ps') && sortBy === 'default') {
      const idxA = heroOrder.indexOf(a.title);
      const idxB = heroOrder.indexOf(b.title);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    }
    
    return 0;
  });

  const totalPages = Math.ceil(filteredCatalog.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTableData = viewAll ? filteredCatalog : filteredCatalog.slice(startIndex, startIndex + itemsPerPage);

  const openAddForm = () => { setEditingTitle(null); setFormData(defaultGame); setShowForm(true); setActiveFormTab('basic'); };
  const openEditForm = (game: Game) => { setEditingTitle(game.title); setFormData({ ...defaultGame, ...game, variants: game.variants?.length ? game.variants : defaultGame.variants }); setShowForm(true); setActiveFormTab('basic'); };

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
        releaseDate: details.release_date?.date || formData.releaseDate,
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

  const handleTagColorChange = (tag: string, color: string) => {
    setFormData(prev => ({
      ...prev,
      tagColors: {
        ...(prev.tagColors || {}),
        [tag]: color
      }
    }));
  };

  const handleMoveToTop = (gameTitle: string) => {
    if (activeTab === 'hero_pc' || activeTab === 'hero_ps') {
      const newHeroOrder = [...heroOrder];
      if (newHeroOrder.length === 0) newHeroOrder.push(...catalog.filter(g => g.showInHero).map(g => g.title));
      const hIdx = newHeroOrder.indexOf(gameTitle);
      if (hIdx !== -1) {
        newHeroOrder.splice(hIdx, 1);
        newHeroOrder.unshift(gameTitle);
        setHeroOrder(newHeroOrder);
      }
    } else {
      const newCatalog = [...catalog];
      const idx = newCatalog.findIndex(g => g.title === gameTitle);
      if (idx !== -1) {
        const game = newCatalog[idx];
        newCatalog.splice(idx, 1);
        newCatalog.unshift(game);
        reorderCatalog(newCatalog);
      }
    }
  };

  const handleMoveToBottom = (gameTitle: string) => {
    if (activeTab === 'hero_pc' || activeTab === 'hero_ps') {
      const newHeroOrder = [...heroOrder];
      if (newHeroOrder.length === 0) newHeroOrder.push(...catalog.filter(g => g.showInHero).map(g => g.title));
      const hIdx = newHeroOrder.indexOf(gameTitle);
      if (hIdx !== -1) {
        newHeroOrder.splice(hIdx, 1);
        newHeroOrder.push(gameTitle);
        setHeroOrder(newHeroOrder);
      }
    } else {
      const newCatalog = [...catalog];
      const idx = newCatalog.findIndex(g => g.title === gameTitle);
      if (idx !== -1) {
        const game = newCatalog[idx];
        newCatalog.splice(idx, 1);
        newCatalog.push(game);
        reorderCatalog(newCatalog);
      }
    }
  };

  const handleMoveToPosition = (gameTitle: string, newPos: number) => {
    if (newPos < 0) newPos = 0;
    if (activeTab === 'hero_pc' || activeTab === 'hero_ps') {
      const newHeroOrder = [...heroOrder];
      if (newHeroOrder.length === 0) newHeroOrder.push(...catalog.filter(g => g.showInHero).map(g => g.title));
      
      const isPC = activeTab === 'hero_pc';
      const filteredHeroes = newHeroOrder.filter(title => {
        const g = catalog.find(x => x.title === title);
        if (!g) return false;
        if (isPC) return g.categories?.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM');
        return g.categories?.some(c => c.toUpperCase().includes('PS'));
      });
      
      const filteredWithoutGame = filteredHeroes.filter(t => t !== gameTitle);
      const targetTitle = filteredWithoutGame[newPos];
      
      const hIdx = newHeroOrder.indexOf(gameTitle);
      if (hIdx !== -1) {
        newHeroOrder.splice(hIdx, 1);
        if (targetTitle) {
          const insertIdx = newHeroOrder.indexOf(targetTitle);
          newHeroOrder.splice(insertIdx, 0, gameTitle);
        } else {
          const lastTitle = filteredWithoutGame[filteredWithoutGame.length - 1];
          if (lastTitle) {
             const insertIdx = newHeroOrder.indexOf(lastTitle);
             newHeroOrder.splice(insertIdx + 1, 0, gameTitle);
          } else {
             newHeroOrder.push(gameTitle);
          }
        }
        setHeroOrder(newHeroOrder);
      }
    } else {
      const newCatalog = [...catalog];
      const gameIdx = newCatalog.findIndex(g => g.title === gameTitle);
      if (gameIdx === -1) return;
      const game = newCatalog[gameIdx];
      
      const filteredWithoutGame = filteredCatalog.filter(g => g.title !== gameTitle);
      const targetGame = filteredWithoutGame[newPos];
      
      newCatalog.splice(gameIdx, 1);
      
      if (targetGame) {
        const insertIdx = newCatalog.findIndex(g => g.title === targetGame.title);
        newCatalog.splice(insertIdx, 0, game);
      } else {
        const lastGame = filteredWithoutGame[filteredWithoutGame.length - 1];
        if (lastGame) {
          const insertIdx = newCatalog.findIndex(g => g.title === lastGame.title);
          newCatalog.splice(insertIdx + 1, 0, game);
        } else {
          newCatalog.push(game);
        }
      }
      reorderCatalog(newCatalog);
    }
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
              <p className="text-[#9BA8AB] text-xs font-semibold tracking-wide mt-0.5">Trust Vault Control Center</p>
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
              onClick={() => {
                setIsAdmin(false);
                localStorage.removeItem('gaming_admin');
                window.location.href = '/';
              }}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all border border-red-500/30 cursor-pointer shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Sidebar Tabs */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col gap-1.5 bg-[#11212D]/50 border border-[#253745] p-2 rounded-2xl overflow-x-auto lg:overflow-x-visible">
            <div className="flex lg:flex-col gap-1.5">
          {[
            { id: 'hero_pc', label: 'Hero - PC', icon: Monitor, count: catalog.filter(g => g.showInHero && (g.categories?.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM'))).length },
            { id: 'hero_ps', label: 'Hero - PS5', icon: Gamepad2, count: catalog.filter(g => g.showInHero && (g.categories?.some(c => c.toUpperCase().includes('PS')))).length },
            { id: 'ps_games', label: 'PS Games', icon: Gamepad2, count: catalog.filter(g => g.categories?.some(c => c.toUpperCase().includes('PS'))).length },
            { id: 'pc_games', label: 'PC Games', icon: Monitor, count: catalog.filter(g => g.categories?.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM')).length },
            { id: 'bundles', label: 'Bundle Game List', icon: Package, count: existingBundles.length },
            { id: 'subscriptions', label: 'Subscriptions', icon: Repeat },
            { id: 'proofs', label: 'Customer Proofs', icon: ShieldCheck },
            { id: 'rents', label: 'Rent Tracking', icon: Database, count: rents.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                title={tab.label}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center justify-center p-3.5 rounded-xl transition-all cursor-pointer relative ${isActive ? 'bg-gradient-to-r from-[#253745] to-[#4A5C6A] text-white shadow-lg border border-[#4A5C6A]' : 'text-[#9BA8AB] hover:text-white hover:bg-[#11212D] border border-transparent'
                  }`}
              >
                <Icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-white' : 'text-[#4A5C6A]'}`} />
                {tab.count !== undefined && (
                  <span className={`absolute -top-1 -right-1 text-[9px] px-1.5 py-0.5 rounded-full font-black shadow-md ${isActive ? 'bg-cyan-500 text-black' : 'bg-[#06141B] text-[#9BA8AB] border border-[#253745]'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full min-w-0">
            {activeTab === 'subscriptions' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl overflow-hidden shadow-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-4">Manage Subscriptions</h2>
            <p className="text-[#9BA8AB] text-sm">Add, edit, or remove subscription offerings from your store.</p>

            <div className="mt-6 border border-[#253745] p-6 rounded-xl bg-[#06141B]">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">{editingSubId ? 'Edit Subscription' : 'Add New Subscription'}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Name</label>
                  <input type="text" value={subFormData.name} onChange={e => setSubFormData({ ...subFormData, name: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="e.g. Netflix Premium" />
                </div>
                <div>
                  <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Logo URL</label>
                  <input type="text" value={subFormData.logoUrl} onChange={e => setSubFormData({ ...subFormData, logoUrl: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Banner Image URL</label>
                  <input type="text" value={subFormData.bannerUrl} onChange={e => setSubFormData({ ...subFormData, bannerUrl: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="https://..." />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Theme Color</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={subFormData.themeColor || '#10b981'} onChange={e => setSubFormData({ ...subFormData, themeColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border border-[#253745] bg-[#11212D]" />
                      <input type="text" value={subFormData.themeColor} onChange={e => setSubFormData({ ...subFormData, themeColor: e.target.value })} className="flex-1 bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="#HEX" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Badge Text</label>
                    <input type="text" value={subFormData.badge} onChange={e => setSubFormData({ ...subFormData, badge: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="e.g. Popular" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Short Description</label>
                  <input type="text" value={subFormData.description} onChange={e => setSubFormData({ ...subFormData, description: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="A short catchy description of the plan..." />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider">Pricing Options</label>
                    <button onClick={() => setSubFormData({ ...subFormData, pricing: [...subFormData.pricing, { duration: '', price: '' }] })} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold flex items-center gap-1 cursor-pointer"><Plus className="w-3 h-3" /> Add Option</button>
                  </div>
                  {(subFormData.pricing || []).map((p, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input type="text" value={p.duration} onChange={e => { const newP = [...subFormData.pricing]; newP[idx].duration = e.target.value; setSubFormData({ ...subFormData, pricing: newP }); }} className="flex-1 bg-[#11212D] text-white px-4 py-2 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="Duration (1 Month)" />
                      <input type="text" value={p.price} onChange={e => { const newP = [...subFormData.pricing]; newP[idx].price = e.target.value; setSubFormData({ ...subFormData, pricing: newP }); }} className="flex-1 bg-[#11212D] text-white px-4 py-2 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="Price (500Rs)" />
                      <input type="text" value={p.originalPrice || ''} onChange={e => { const newP = [...subFormData.pricing]; newP[idx].originalPrice = e.target.value; setSubFormData({ ...subFormData, pricing: newP }); }} className="flex-1 bg-[#11212D] text-[#9BA8AB] px-4 py-2 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none" placeholder="Old Price (Optional)" />
                      <button onClick={() => setSubFormData({ ...subFormData, pricing: subFormData.pricing.filter((_, i) => i !== idx) })} className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[#9BA8AB] text-[10px] font-bold uppercase tracking-wider mb-1">Subscription Details (One feature per line)</label>
                  <textarea value={subFormData.details} onChange={e => setSubFormData({ ...subFormData, details: e.target.value })} className="w-full bg-[#11212D] text-white px-4 py-2.5 rounded-xl border border-[#253745] focus:border-[#4A5C6A] outline-none h-24" placeholder="4K Ultra HD&#10;4 Screens&#10;No Ads"></textarea>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button onClick={handleSaveSubscription} className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer">
                  {editingSubId ? 'Update Subscription' : 'Save Subscription'}
                </button>
                {editingSubId && (
                  <button onClick={() => { setEditingSubId(null); setSubFormData(defaultSubscription); }} className="bg-[#253745] hover:bg-[#4A5C6A] text-white font-bold uppercase tracking-wider text-xs px-6 py-2.5 rounded-xl shadow-lg transition-colors cursor-pointer">
                    Cancel
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Current Subscriptions ({subscriptions.length})</h3>
              {subscriptions.length === 0 ? (
                <div className="text-[#9BA8AB] text-sm text-center py-10 bg-[#06141B] rounded-xl border border-[#253745]">
                  No subscriptions added yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub, index) => (
                    <div 
                      key={sub.id} 
                      draggable
                      onDragStart={() => setDraggedSubIndex(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (draggedSubIndex === null || draggedSubIndex === index) return;
                        const newSubs = [...subscriptions];
                        const dragged = newSubs[draggedSubIndex];
                        newSubs.splice(draggedSubIndex, 1);
                        newSubs.splice(index, 0, dragged);
                        reorderSubscriptions(newSubs);
                        setDraggedSubIndex(null);
                      }}
                      className="bg-[#06141B] border border-[#253745] p-4 rounded-xl flex flex-col justify-between shadow-lg cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-5 h-5 text-[#4A5C6A] cursor-grab" />
                          {sub.logoUrl ? (
                            <img src={sub.logoUrl} alt={sub.name} className="w-10 h-10 rounded-lg object-cover bg-white p-0.5" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-[#253745] flex items-center justify-center text-[#9BA8AB]">
                              <Repeat className="w-5 h-5" />
                            </div>
                          )}
                          <h4 className="text-base font-bold text-white">{sub.name}</h4>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => {
                            setEditingSubId(sub.id);
                            setSubFormData({
                              name: sub.name || sub.title || '',
                              logoUrl: sub.logoUrl || '',
                              bannerUrl: sub.bannerUrl || '',
                              themeColor: sub.themeColor || '#10b981',
                              badge: sub.badge || '',
                              description: sub.description || '',
                              pricing: Array.isArray(sub.pricing) ? sub.pricing : [],
                              details: (sub.details || sub.features || []).join('\n')
                            });
                          }} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg cursor-pointer">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => {
                            setConfirmReq({ message: `Delete ${sub.name}?`, onConfirm: () => removeSubscription(sub.id) });
                          }} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 text-[11px] text-[#9BA8AB] space-y-1">
                        <p><strong className="text-[#CCD0CF]">Pricing:</strong> {sub.pricing ? sub.pricing.map(p => `${p.duration} (${p.price})`).join(', ') : ''}</p>
                        <p><strong className="text-[#CCD0CF]">Features:</strong> {(sub.details || sub.features || []).length} listed</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {(activeTab === 'pc_games' || activeTab === 'ps_games' || activeTab === 'hero_pc' || activeTab === 'hero_ps') && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl overflow-hidden shadow-2xl space-y-0">
            <div className="p-5 border-b border-[#253745] flex flex-col lg:flex-row justify-between items-center gap-4 bg-[#11212D]">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                <input
                  type="text" placeholder="Search inventory..." value={searchTerm}
                  onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="bg-[#06141B] border border-[#253745] rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-[#4A5C6A] w-full sm:w-72 shadow-inner"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={sortBy} onChange={(e) => { setSortBy(e.target.value as any); setCurrentPage(1); }}
                    className="bg-[#06141B] border border-[#253745] rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] w-full sm:w-auto shadow-inner"
                  >
                    <option value="default">Sort: Newest First (Custom)</option>
                    <option value="az">Alphabetical (A - Z)</option>
                    <option value="za">Alphabetical (Z - A)</option>
                    <option value="priceLow">Price: Low to High</option>
                    <option value="priceHigh">Price: High to Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between w-full lg:w-auto gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9BA8AB] hidden xl:inline">
                    Showing {viewAll ? 'All' : `${startIndex + 1}-${Math.min(startIndex + itemsPerPage, filteredCatalog.length)}`} of {filteredCatalog.length}
                  </span>
                  <button
                    onClick={() => { setViewAll(!viewAll); setCurrentPage(1); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors cursor-pointer ${viewAll ? 'bg-cyan-900/50 text-cyan-400 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]' : 'bg-[#06141B] text-[#9BA8AB] border-[#253745] hover:text-white hover:bg-[#253745]'}`}
                  >
                    {viewAll ? <Layers className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
                    {viewAll ? 'Pages Mode' : 'View All'}
                  </button>
                </div>
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

            <div className="w-full">
              <table className="w-full text-left">
                <thead className="bg-[#06141B]/80 text-[#9BA8AB] text-[11px] uppercase tracking-wider border-b border-[#253745]">
                  <tr>
                    <th className="p-4 font-bold w-auto">Cover</th>
                    <th className="p-4 font-bold w-full max-w-[250px]">Title & Status</th>
                    <th className="p-4 font-bold w-auto whitespace-nowrap">Price</th>
                    <th className="p-4 font-bold w-auto">Platforms</th>
                    <th className="p-4 font-bold text-center w-auto">Store Placements</th>
                    <th className="p-4 font-bold text-right w-auto whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#253745]/60">
                  {currentTableData.map((game, index) => (
                    <tr 
                      key={game.title} 
                      className="hover:bg-[#06141B]/40 transition-colors cursor-grab active:cursor-grabbing"
                      draggable
                      onDragStart={() => setDraggedGameTitle(game.title)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!draggedGameTitle || draggedGameTitle === game.title) return;
                        
                        const newCatalog = [...catalog];
                        const draggedIdx = newCatalog.findIndex(g => g.title === draggedGameTitle);
                        const dropIdx = newCatalog.findIndex(g => g.title === game.title);
                        
                        if (draggedIdx !== -1 && dropIdx !== -1) {
                          if (activeTab === 'hero_pc' || activeTab === 'hero_ps') {
                            // Independent hero ordering
                            const newHeroOrder = [...heroOrder];
                            if (newHeroOrder.length === 0) {
                              // Initialize with current order if empty
                              newHeroOrder.push(...catalog.filter(g => g.showInHero).map(g => g.title));
                            }
                            
                            const hDraggedIdx = newHeroOrder.indexOf(draggedGameTitle);
                            const hDropIdx = newHeroOrder.indexOf(game.title);
                            
                            if (hDraggedIdx !== -1 && hDropIdx !== -1) {
                              newHeroOrder.splice(hDraggedIdx, 1);
                              const newDropIdx = hDraggedIdx < hDropIdx ? hDropIdx - 1 : hDropIdx;
                              newHeroOrder.splice(newDropIdx, 0, draggedGameTitle);
                              setHeroOrder(newHeroOrder);
                            }
                          } else {
                            // Regular catalog ordering
                            const draggedGame = newCatalog[draggedIdx];
                            newCatalog.splice(draggedIdx, 1);
                            const newDropIdx = draggedIdx < dropIdx ? dropIdx - 1 : dropIdx;
                            newCatalog.splice(newDropIdx, 0, draggedGame);
                            reorderCatalog(newCatalog);
                          }
                        }
                        setDraggedGameTitle(null);
                      }}
                    >
                      <td className="p-4 flex items-center gap-3">
                        <div className="flex flex-col items-center gap-1.5 shrink-0 bg-[#06141B] p-1.5 rounded-lg border border-[#253745]">
                          <button 
                            type="button" 
                            title="Move to Top"
                            onClick={() => handleMoveToTop(game.title)}
                            className="p-1 text-[#9BA8AB] hover:text-emerald-400 hover:bg-[#253745] rounded transition-colors"
                          >
                            <ArrowUpToLine className="w-3.5 h-3.5" />
                          </button>
                          <GripVertical className="w-4 h-4 text-[#4A5C6A] cursor-grab" />
                          <input 
                            type="text" 
                            title="Exact position (press Enter to move)"
                            defaultValue={viewAll ? index + 1 : (currentPage - 1) * itemsPerPage + index + 1}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleMoveToPosition(game.title, parseInt(e.currentTarget.value) - 1);
                              }
                            }}
                            className="w-7 h-5 text-center text-[9px] font-bold bg-[#11212D] border border-[#253745] rounded text-[#9BA8AB] focus:text-white focus:border-cyan-400 focus:outline-none"
                          />
                          <button 
                            type="button" 
                            title="Move to Bottom"
                            onClick={() => handleMoveToBottom(game.title)}
                            className="p-1 text-[#9BA8AB] hover:text-red-400 hover:bg-[#253745] rounded transition-colors"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          className="w-12 h-16 shrink-0 bg-cover bg-center rounded-lg border border-[#253745] shadow-md"
                          style={{ backgroundImage: `url('${game.customCoverUrl || getGameCoverUrl(game.title)}')` }}
                        />
                      </td>
                      <td className="p-4 truncate">
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
                        <div className="flex items-center justify-center gap-1.5 flex-wrap mx-auto">
                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.showInHero ? 'bg-[#4A5C6A] border-[#4A5C6A]' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input
                              type="checkbox" checked={game.showInHero || false}
                              onChange={(e) => updateGame(game.title, { ...game, showInHero: e.target.checked })}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.showInHero ? 'text-white' : 'text-[#9BA8AB]'}`}>Hero</span>
                          </label>

                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.categories?.includes('Bundle-Eligible') ? 'bg-[#4A5C6A] border-[#4A5C6A]' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input
                              type="checkbox" checked={game.categories?.includes('Bundle-Eligible') || false}
                              onChange={(e) => {
                                const newCategories = e.target.checked 
                                  ? [...(game.categories || []), 'Bundle-Eligible']
                                  : (game.categories || []).filter(c => c !== 'Bundle-Eligible');
                                updateGame(game.title, { ...game, categories: newCategories });
                              }}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.categories?.includes('Bundle-Eligible') ? 'text-white' : 'text-[#9BA8AB]'}`}>Bundle</span>
                          </label>

                          <label className={`flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border transition-all ${game.categories?.includes('DELUXE EDITION') ? 'bg-cyan-950/80 border-cyan-400' : 'bg-[#06141B] border-[#253745]'}`}>
                            <input
                              type="checkbox" checked={game.categories?.includes('DELUXE EDITION') || false}
                              onChange={(e) => {
                                const newCategories = e.target.checked 
                                  ? [...(game.categories || []), 'DELUXE EDITION']
                                  : (game.categories || []).filter(c => c !== 'DELUXE EDITION');
                                updateGame(game.title, { ...game, categories: newCategories });
                              }}
                              className="hidden"
                            />
                            <span className={`text-[9px] font-bold uppercase ${game.categories?.includes('DELUXE EDITION') ? 'text-cyan-400' : 'text-[#9BA8AB]'}`}>Deluxe</span>
                          </label>

                          <button
                            type="button"
                            onClick={() => {
                              const tag = window.prompt(`Enter custom tag for ${game.title}:`);
                              if (tag && tag.trim()) {
                                const newTag = tag.trim().toUpperCase();
                                if (!game.categories?.includes(newTag)) {
                                  updateGame(game.title, { ...game, categories: [...(game.categories || []), newTag] });
                                  showToast(`Added tag ${newTag} to ${game.title}`, 'success');
                                }
                              }
                            }}
                            className="flex items-center justify-center px-2 py-1 rounded-md border border-[#253745] bg-[#06141B] hover:bg-[#253745] text-[#9BA8AB] hover:text-white transition-colors cursor-pointer"
                            title="Add Custom Tag"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-6 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
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

            {!viewAll && totalPages > 1 && (
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

            <div className="bg-[#11212D] border border-[#253745] p-6 rounded-2xl shadow-xl">
              <h3 className="text-sm font-black tracking-wider text-white uppercase mb-4">Discount Configurations</h3>
              <div className="space-y-3">
                {bundleDiscounts.sort((a, b) => a.minGames - b.minGames).map((discount, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-[#06141B] p-3 rounded-xl border border-[#253745]">
                    <div className="flex flex-col flex-1">
                      <label className="text-[10px] uppercase text-[#9BA8AB] font-bold">Minimum Games</label>
                      <input
                        type="number"
                        value={discount.minGames}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 3) {
                            const newDiscounts = [...bundleDiscounts];
                            newDiscounts[idx].minGames = val;
                            updateBundleDiscounts(newDiscounts);
                          }
                        }}
                        className="bg-transparent border-none text-white text-xs font-bold focus:outline-none"
                        min="3"
                      />
                    </div>
                    <div className="flex flex-col flex-1 border-l border-[#253745] pl-3">
                      <label className="text-[10px] uppercase text-[#9BA8AB] font-bold">Discount %</label>
                      <input
                        type="number"
                        value={discount.discountPercentage}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          if (val >= 0 && val <= 100) {
                            const newDiscounts = [...bundleDiscounts];
                            newDiscounts[idx].discountPercentage = val;
                            updateBundleDiscounts(newDiscounts);
                          }
                        }}
                        className="bg-transparent border-none text-white text-xs font-bold focus:outline-none"
                        min="0" max="100"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const newDiscounts = bundleDiscounts.filter((_, i) => i !== idx);
                        updateBundleDiscounts(newDiscounts);
                      }}
                      className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  const newDiscounts = [...bundleDiscounts, { minGames: 3, discountPercentage: 10 }];
                  updateBundleDiscounts(newDiscounts);
                }}
                className="mt-4 flex items-center gap-2 bg-[#253745] hover:bg-[#4A5C6A] text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Discount Tier
              </button>
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
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center justify-center text-green-400 mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Manage Customer Proofs</h2>
              <p className="text-[#9BA8AB] text-xs max-w-sm mx-auto">Upload and manage transaction screenshots for the verification feed.</p>
            </div>

            <div className="bg-[#06141B] border border-[#253745] p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">Upload New Screenshot</span>
                <p className="text-[11px] text-[#9BA8AB]">Supports PNG, JPG, WEBP formats.</p>
              </div>
              <label className="cursor-pointer bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white px-6 py-3 rounded-xl flex items-center justify-center font-bold text-xs uppercase transition-all shadow-md shrink-0 border border-[#4A5C6A]/50">
                <Upload className="w-4 h-4 mr-2" />
                <span>Select & Upload</span>
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
                            fetchProofsAdmin();
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

            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-[#253745] pb-2">Uploaded Proofs</h3>
              {proofs.length === 0 ? (
                <p className="text-[#9BA8AB] text-xs">No proofs uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {proofs.map((url, i) => (
                    <div key={i} className="relative group rounded-xl overflow-hidden border border-[#253745] aspect-[3/4] bg-[#06141B]">
                      <img src={url} alt="Proof" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                         <a href={url} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/40 cursor-pointer">
                           <ExternalLink className="w-5 h-5" />
                         </a>
                         <button onClick={() => handleDeleteProof(url)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 cursor-pointer">
                           <Trash2 className="w-5 h-5" />
                         </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'rents' && (
          <div className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-400" /> Rent Tracking
              </h2>
              <button 
                onClick={() => {
                  setRentFormData(defaultRent);
                  setShowRentForm(true);
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Rent
              </button>
            </div>
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
                          <td className="p-4 text-white font-bold">{rent.customerName} <br /><span className="text-[#9BA8AB] font-normal">{rent.mobileNumber}</span></td>
                          <td className="p-4 text-white">
                            {rent.items?.map((item: any) => {
                              const remainingDays = calculateRemaining(item, rent.created_at);
                              const isOver = remainingDays !== null && remainingDays <= 0;

                              return (
                                <div key={item.title} className="mb-2">
                                  <div>{item.title} - {item.startDate ? `${item.startDate} to ${item.endDate}` : (item.rentPeriod || 'Limited')}</div>
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
                              {!isDone && (() => {
                                const isOver = rent.items?.some((item: any) => {
                                  const days = calculateRemaining(item, rent.created_at);
                                  return days !== null && days <= 0;
                                });
                                const waText = isOver 
                                  ? `Hi ${rent.customerName}, your game rent period is over. Please renew or return.`
                                  : `Hi ${rent.customerName},`;
                                return (
                                  <a
                                    href={`https://wa.me/${rent.mobileNumber}?text=${encodeURIComponent(waText)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="bg-green-500/20 text-green-400 p-2 rounded-lg hover:bg-green-500/40 transition-colors cursor-pointer"
                                    title="Send WhatsApp Message"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                );
                              })()}

                              {!isDone && (
                                <button
                                  onClick={() => markRentAsDone(rent.id)}
                                  className="bg-orange-500/20 text-orange-400 p-2 rounded-lg hover:bg-orange-500/40 transition-colors cursor-pointer"
                                  title="Mark as Final Done"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDeleteRent(rent.id)}
                                className="bg-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/40 transition-colors cursor-pointer"
                                title="Delete Rent Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rent Form Modal */}
        <AnimatePresence>
          {showRentForm && (
            <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#06141B] border border-[#253745] rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-black text-white uppercase">New Rent Record</h2>
                  <button onClick={() => setShowRentForm(false)} className="text-[#9BA8AB] hover:text-white cursor-pointer"><X className="w-6 h-6" /></button>
                </div>

                <form onSubmit={handleSaveRent} className="space-y-4 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#9BA8AB] uppercase tracking-wider mb-2">Customer Name</label>
                      <input type="text" required value={rentFormData.customerName} onChange={e => setRentFormData({...rentFormData, customerName: e.target.value})} className="w-full bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#9BA8AB] uppercase tracking-wider mb-2">Mobile Number</label>
                      <input type="text" required value={rentFormData.mobileNumber} onChange={e => setRentFormData({...rentFormData, mobileNumber: e.target.value.replace(/[^0-9]/g, '')})} maxLength={10} className="w-full bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9BA8AB] uppercase tracking-wider mb-2">Total Amount (Rs)</label>
                    <input type="number" required value={rentFormData.totalAmount} onChange={e => setRentFormData({...rentFormData, totalAmount: e.target.value})} className="w-full bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white focus:border-emerald-500 outline-none" />
                  </div>

                  <div className="border-t border-[#253745] pt-4 mt-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-sm font-bold text-white uppercase">Rented Games</h3>
                      <button type="button" onClick={() => setRentFormData({...rentFormData, items: [...rentFormData.items, { title: '', startDate: '', endDate: '' }]})} className="text-emerald-400 text-xs font-bold flex items-center gap-1 cursor-pointer hover:text-emerald-300">
                        <Plus className="w-3 h-3" /> Add Game
                      </button>
                    </div>

                    {rentFormData.items.map((item, idx) => (
                      <div key={idx} className="flex gap-2 mb-3 items-start">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            placeholder="Game Title" 
                            required 
                            value={item.title} 
                            onFocus={() => setActiveRentGameSearch(idx)}
                            onBlur={() => setTimeout(() => setActiveRentGameSearch(null), 200)}
                            onChange={e => {
                              const newItems = [...rentFormData.items];
                              newItems[idx].title = e.target.value;
                              setRentFormData({...rentFormData, items: newItems});
                            }} 
                            className="w-full bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white text-sm focus:border-emerald-500 outline-none" 
                          />
                          {activeRentGameSearch === idx && item.title.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#06141B] border border-[#253745] rounded-lg shadow-xl max-h-40 overflow-y-auto z-[200]">
                              {catalog.filter(g => g.title.toLowerCase().includes(item.title.toLowerCase())).map(game => (
                                <div 
                                  key={game.title} 
                                  className="p-3 text-sm text-white hover:bg-[#253745] cursor-pointer border-b border-[#253745]/50 last:border-0"
                                  onClick={() => {
                                    const newItems = [...rentFormData.items];
                                    newItems[idx].title = game.title;
                                    setRentFormData({...rentFormData, items: newItems});
                                    setActiveRentGameSearch(null);
                                  }}
                                >
                                  {game.title}
                                </div>
                              ))}
                              {catalog.filter(g => g.title.toLowerCase().includes(item.title.toLowerCase())).length === 0 && (
                                <div className="p-3 text-sm text-[#9BA8AB] italic">No games found</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="flex w-1/2 gap-2">
                          <input type="date" title="Start Date" required value={item.startDate || ''} onChange={e => {
                            const newItems = [...rentFormData.items];
                            newItems[idx].startDate = e.target.value;
                            setRentFormData({...rentFormData, items: newItems});
                          }} className="w-1/2 bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white text-xs focus:border-emerald-500 outline-none" />
                          <input type="date" title="End Date" required value={item.endDate || ''} onChange={e => {
                            const newItems = [...rentFormData.items];
                            newItems[idx].endDate = e.target.value;
                            setRentFormData({...rentFormData, items: newItems});
                          }} className="w-1/2 bg-[#11212D] border border-[#253745] rounded-lg p-3 text-white text-xs focus:border-emerald-500 outline-none" />
                        </div>
                        {rentFormData.items.length > 1 && (
                          <button type="button" onClick={() => {
                            const newItems = rentFormData.items.filter((_, i) => i !== idx);
                            setRentFormData({...rentFormData, items: newItems});
                          }} className="bg-red-500/20 text-red-400 p-3 rounded-lg hover:bg-red-500/40 cursor-pointer">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-xl font-black uppercase tracking-widest transition-colors mt-6 cursor-pointer">
                    Create Rent Record
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

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
                      onChange={(e) => setEditingCollection({ ...editingCollection, title: e.target.value })}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Description</label>
                    <textarea
                      value={editingCollection.description || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A] h-20 resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Banner Image URL</label>
                    <input
                      type="text"
                      value={editingCollection.customBannerUrl || ''}
                      onChange={(e) => setEditingCollection({ ...editingCollection, customBannerUrl: e.target.value })}
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
                                setEditingCollection({ ...editingCollection, keywords: updatedKw });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors border cursor-pointer ${isAssigned
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
                    <div className="flex border-b border-[#253745] mb-2 overflow-x-auto no-scrollbar">
                      {['basic', 'media', 'pricing', 'tags'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveFormTab(tab as any)}
                          className={`px-3 py-2 text-xs font-bold uppercase transition-colors border-b-2 whitespace-nowrap ${activeFormTab === tab ? 'text-white border-cyan-500' : 'text-[#4A5C6A] border-transparent hover:text-[#9BA8AB]'}`}
                        >
                          {tab === 'basic' ? 'Basic Info' : tab === 'media' ? 'Media' : tab === 'pricing' ? 'Pricing & Rent' : 'Tags & Variants'}
                        </button>
                      ))}
                    </div>

                    {activeFormTab === 'basic' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Game Title</label>
                          <div className="flex gap-2">
                            <input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" required />
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

                        <div className="mt-4">
                          <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Game Description (Optional for Non-Steam)</label>
                          <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A] min-h-[120px]" placeholder="Enter description manually for games not on Steam (supports HTML formatting)"></textarea>
                        </div>
                      </div>
                    )}

                    {activeFormTab === 'media' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Cover URL / Upload</label>
                      <div className="flex gap-2">
                        <input type="text" value={formData.customCoverUrl || ''} onChange={e => setFormData({ ...formData, customCoverUrl: e.target.value })} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="Image URL" />
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
                                  if (data.url) setFormData({ ...formData, customCoverUrl: data.url });
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
                        <input type="text" value={formData.horizontalCoverUrl || ''} onChange={e => setFormData({ ...formData, horizontalCoverUrl: e.target.value })} className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="Horizontal Image URL (for Hero Banner)" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Game Description (Optional for Non-Steam)</label>
                      <textarea value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A] min-h-[100px]" placeholder="Enter description manually for games not on Steam (supports HTML formatting)"></textarea>
                    </div>

                    <div className="mt-4 mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[#9BA8AB] text-[11px] font-bold uppercase">Gallery Image URLs</label>
                        <button
                          type="button"
                          onClick={() => {
                            const currentScreenshots = formData.screenshots || [];
                            setFormData({ ...formData, screenshots: [...currentScreenshots, ''] });
                          }}
                          className="bg-[#253745] hover:bg-[#4A5C6A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                        >
                          + Add Image
                        </button>
                      </div>
                      
                      {(!formData.screenshots || formData.screenshots.length === 0) && (
                        <div className="text-xs text-[#4A5C6A] bg-[#06141B] border border-dashed border-[#253745] rounded-xl p-4 text-center">
                          No gallery images. Click + Add Image to add URLs manually for non-Steam games.
                        </div>
                      )}
                      
                      {formData.screenshots && formData.screenshots.length > 0 && (
                        <div className="space-y-2">
                          {formData.screenshots.map((url, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input
                                type="text"
                                value={url}
                                onChange={e => {
                                  const newScreenshots = [...(formData.screenshots || [])];
                                  newScreenshots[idx] = e.target.value;
                                  setFormData({ ...formData, screenshots: newScreenshots });
                                }}
                                className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]"
                                placeholder="https://image-url.jpg"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newScreenshots = (formData.screenshots || []).filter((_, i) => i !== idx);
                                  setFormData({ ...formData, screenshots: newScreenshots.length > 0 ? newScreenshots : undefined });
                                }}
                                className="text-red-400 hover:text-white hover:bg-red-500/20 px-3 py-2 rounded-xl border border-[#253745] hover:border-red-500/50 transition-colors shrink-0"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                  {activeFormTab === 'pricing' && (
                    <div className="space-y-4">
                      {/* UPGRADE: New section for Store Placements inside the Edit Game modal */}
                      <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Store Placements</label>
                      <div className="flex items-center gap-3 bg-[#06141B] border border-[#253745] rounded-xl p-3 h-[42px]">
                        <label className="flex items-center gap-2 cursor-pointer text-white text-xs">
                          <input type="checkbox" checked={formData.showInHero || false} onChange={e => setFormData({ ...formData, showInHero: e.target.checked })} className="accent-[#4A5C6A] cursor-pointer" />
                          <span>Hero Carousel</span>
                        </label>

                      </div>
                    </div>

                    {(formData.categories?.some(c => c.includes('PC')) || !formData.categories?.some(c => c.includes('PS'))) && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Price (Rs)</label>
                            <input type="text" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="199Rs" required />
                          </div>
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Sale Status</label>
                            <label className="flex items-center gap-2 bg-[#06141B] border border-[#253745] rounded-xl p-3 cursor-pointer text-white text-xs h-[42px]">
                              <input type="checkbox" checked={formData.onSale || false} onChange={e => setFormData({ ...formData, onSale: e.target.checked })} className="accent-[#4A5C6A] cursor-pointer" />
                              <span>Mark On Sale</span>
                            </label>
                          </div>
                        </div>

                        {formData.onSale && (
                          <div>
                            <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Original Price (Rs)</label>
                            <input type="text" value={formData.originalPrice || ''} onChange={e => setFormData({ ...formData, originalPrice: e.target.value })} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-red-400 text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="399Rs" />
                          </div>
                        )}
                      </>
                    )}

                    <div>
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Rent Options</label>
                      <label className="flex items-center gap-2 bg-[#06141B] border border-[#253745] rounded-xl p-3 cursor-pointer text-white text-xs h-[42px] mb-3">
                        <input type="checkbox" checked={formData.isRentable || false} onChange={e => setFormData({ ...formData, isRentable: e.target.checked })} className="accent-[#4A5C6A] cursor-pointer" />
                        <span>Enable Renting</span>
                      </label>
                    </div>

                    {formData.isRentable && (
                      <div className="grid grid-cols-1 gap-3 mb-4">
                        <div>
                          <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Rent Price Per Month (Rs)</label>
                          <input type="text" value={formData.rentPrice || ''} onChange={e => setFormData({ ...formData, rentPrice: e.target.value })} className="w-full bg-[#06141B] border border-[#253745] rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#4A5C6A]" placeholder="99Rs" />
                        </div>
                      </div>
                    )}

                    </div>
                  )}

                {activeFormTab === 'tags' && (
                  <div className="space-y-4">
                    {formData.categories?.some(c => c.includes('PS')) && (
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-[#9BA8AB] text-[11px] font-bold uppercase">Game Variants (Editions)</label>
                          <button
                            type="button"
                            onClick={() => {
                              const currentVariants = formData.variants || [];
                              setFormData({ ...formData, variants: [...currentVariants, { name: 'New Edition', price: '' }] });
                            }}
                            className="bg-[#253745] hover:bg-[#4A5C6A] text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-colors"
                          >
                            + Add Variant
                          </button>
                        </div>

                        {formData.variants && formData.variants.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {formData.variants.map((variant, index) => (
                              <div 
                                key={index} 
                                draggable
                                onDragStart={(e) => {
                                  e.dataTransfer.setData('variantIndex', index.toString());
                                  e.currentTarget.style.opacity = '0.5';
                                }}
                                onDragEnd={(e) => {
                                  e.currentTarget.style.opacity = '1';
                                }}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const dragIndex = parseInt(e.dataTransfer.getData('variantIndex'));
                                  if (isNaN(dragIndex) || dragIndex === index) return;
                                  const newVariants = [...(formData.variants || [])];
                                  const dragged = newVariants.splice(dragIndex, 1)[0];
                                  newVariants.splice(index, 0, dragged);
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="flex gap-2 items-start bg-[#06141B] border border-[#253745] p-3 rounded-xl cursor-move hover:border-[#4A5C6A] transition-colors"
                              >
                                <div className="pt-2 text-[#4A5C6A] shrink-0">
                                  <GripVertical className="w-5 h-5" />
                                </div>
                                <div className="flex-1 space-y-2">
                                  <input
                                    type="text"
                                    value={variant.name}
                                    onChange={e => {
                                      const newVariants = [...(formData.variants || [])];
                                      newVariants[index].name = e.target.value;
                                      setFormData({ ...formData, variants: newVariants });
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
                                        setFormData({ ...formData, variants: newVariants });
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
                                        setFormData({ ...formData, variants: newVariants });
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
                                    setFormData({ ...formData, variants: newVariants });
                                  }}
                                  className="text-red-400 hover:text-white hover:bg-red-500/20 p-2 rounded-lg transition-colors shrink-0"
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
                        {['PC', 'PS5', 'PS4', 'Bundle-Eligible'].map(plat => (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleCategoryToggle(plat)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-colors cursor-pointer ${formData.categories?.includes(plat)
                                ? 'bg-white text-[#06141B] border-white shadow-md'
                                : 'bg-[#06141B] text-[#9BA8AB] border-[#253745] hover:border-[#4A5C6A]'
                              }`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="block text-[#9BA8AB] text-[11px] font-bold mb-1.5 uppercase">Custom Tags / Editions</label>
                      <div className="flex flex-col gap-3">
                        <div className="flex gap-2 items-center">
                          <button
                            type="button"
                            onClick={() => handleCategoryToggle('DELUXE EDITION')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-colors cursor-pointer ${formData.categories?.includes('DELUXE EDITION')
                                ? 'bg-cyan-950/80 text-cyan-400 border-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
                                : 'bg-[#06141B] text-[#9BA8AB] border-[#253745] hover:border-cyan-500/50 hover:text-cyan-400'
                              }`}
                          >
                            Deluxe Edition
                          </button>
                          {formData.categories?.includes('DELUXE EDITION') && (
                            <div className="flex items-center gap-2 bg-[#06141B] border border-[#253745] px-2 py-1 rounded-xl h-full shadow-sm">
                              <label className="text-[9px] text-[#9BA8AB] font-bold uppercase tracking-wider">Color:</label>
                              <input 
                                type="color" 
                                value={formData.tagColors?.['DELUXE EDITION'] || '#22d3ee'} 
                                onChange={(e) => handleTagColorChange('DELUXE EDITION', e.target.value)}
                                className="w-5 h-5 rounded cursor-pointer bg-transparent border-0 p-0"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={customTagInput}
                            onChange={(e) => setCustomTagInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (customTagInput.trim()) {
                                  const tag = customTagInput.trim().toUpperCase();
                                  if (!formData.categories?.includes(tag)) {
                                    setFormData({ ...formData, categories: [...(formData.categories || []), tag] });
                                  }
                                  setCustomTagInput('');
                                }
                              }
                            }}
                            placeholder="Add custom tag (e.g. ULTIMATE EDITION)..."
                            className="flex-1 bg-[#06141B] border border-[#253745] rounded-xl p-2.5 text-sm text-white placeholder-[#4A5C6A] focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customTagInput.trim()) {
                                const tag = customTagInput.trim().toUpperCase();
                                if (!formData.categories?.includes(tag)) {
                                  setFormData({ ...formData, categories: [...(formData.categories || []), tag] });
                                }
                                setCustomTagInput('');
                              }
                            }}
                            className="bg-[#253745] hover:bg-[#4A5C6A] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Add
                          </button>
                        </div>
                        {/* Display custom tags that are already added but aren't standard platforms/Deluxe */}
                        {formData.categories && formData.categories.filter(c => !['PC', 'PS5', 'PS4', 'PS', 'XBOX', 'STEAM', 'BUNDLE-ELIGIBLE', 'DELUXE EDITION', 'STORE'].includes(c.toUpperCase())).length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {formData.categories.filter(c => !['PC', 'PS5', 'PS4', 'PS', 'XBOX', 'STEAM', 'BUNDLE-ELIGIBLE', 'DELUXE EDITION', 'STORE'].includes(c.toUpperCase())).map(tag => (
                              <div key={tag} className="flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 pl-2 pr-1 py-1 rounded-lg text-[10px] font-bold uppercase">
                                <span>{tag}</span>
                                <input 
                                  type="color" 
                                  value={formData.tagColors?.[tag] || '#22d3ee'} 
                                  onChange={(e) => handleTagColorChange(tag, e.target.value)}
                                  className="w-4 h-4 ml-1 rounded cursor-pointer bg-transparent border-0 p-0"
                                  title="Choose Tag Color"
                                />
                                <button type="button" onClick={() => handleCategoryToggle(tag)} className="text-cyan-400 hover:text-white hover:bg-cyan-500/50 rounded-full p-0.5 transition-colors ml-0.5">
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

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
        </div>
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
