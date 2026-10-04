import { useState, useEffect } from 'react';
import { Clock, MessageCircle, Send } from 'lucide-react';
import { getGameCoverUrl } from '../utils/image';
import PlatformTags from './PlatformTags';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://store-vault-backend.onrender.com';
const STORE_WHATSAPP_NUMBER = "918824647379";

export default function UpcomingView() {
  const [upcomingGames, setUpcomingGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcoming() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/upcoming`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setUpcomingGames(data);
        }
      } catch (err) {
        console.error("Failed to fetch upcoming games:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchUpcoming();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Notice Banner */}
      <div className="bg-gradient-to-r from-[#FFFFFF] via-[#E5E7EB]/40 to-[#FFFFFF] border border-[#D1D5DB] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>Pre-Order Available</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-wider">Upcoming Releases</h2>
          <p className="text-[#4B5563] text-sm max-w-xl">
            Want to pre-order any upcoming title? Contact us directly on WhatsApp to secure your spot instantly!
          </p>
        </div>
        <button
          onClick={() => {
            const text = encodeURIComponent("Hey Trust Vault, I want to pre-order an upcoming game!");
            window.location.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${text}`;
          }}
          className="w-full md:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shrink-0 cursor-pointer border-none"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Pre-Order on WhatsApp</span>
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#4B5563] text-xs uppercase font-bold tracking-wider">
          Loading upcoming titles...
        </div>
      ) : upcomingGames.length === 0 ? (
        <div className="text-center py-16 bg-[#FFFFFF]/30 rounded-2xl border border-[#E5E7EB] border-dashed">
          <p className="text-[#1F2937] text-xs font-bold uppercase tracking-wider mb-1">No upcoming games listed yet.</p>
          <p className="text-[#4B5563] text-[11px]">Check back soon or contact us via WhatsApp for upcoming pre-orders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {upcomingGames.map((game) => {
            const coverUrl = game.customCoverUrl || game.custom_cover_url || getGameCoverUrl(game.title);

            const gamePrice = String(game.price || 'TBA');

            return (
              <div key={game.id || game.title} className="bg-[#FFFFFF] rounded-xl overflow-hidden border border-[#E5E7EB] hover:border-[#D1D5DB] transition-all group flex flex-col shadow-lg">
                <div className="aspect-[3/4] relative overflow-hidden bg-[#F9FAFB]">
                  <img
                    src={coverUrl}
                    alt={game.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      if (e.currentTarget.src.includes('placeholder.jpg')) return;
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#F9FAFB] via-transparent to-transparent opacity-80" />
                  <PlatformTags platforms={game.categories} tagColors={game.tagColors} />
                  <div className="absolute top-2 left-2 bg-amber-500 text-[9px] font-black px-2 py-0.5 rounded text-[#F9FAFB] uppercase tracking-wider shadow">
                    SOON
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1 justify-between bg-[#FFFFFF]">
                  <div>
                    <h3 className="font-bold text-[#1F2937] text-sm leading-tight mb-1 tracking-wide uppercase truncate">{game.title}</h3>
                    {(game.release_date || game.releaseDate) && (
                      <p className="text-[10px] text-[#4B5563] font-semibold uppercase tracking-wider">Expected: {game.release_date || game.releaseDate}</p>
                    )}
                  </div>

                  <div className="mt-auto pt-3 border-t border-[#E5E7EB]/60 flex flex-col gap-2.5">
                    <span className="font-black text-[#1F2937] text-sm sm:text-base">{gamePrice}</span>
                    <button
                      onClick={() => {
                        const msg = `Hey Trust Vault, I would like to pre-order "${game.title}" for ${gamePrice}!`;
                        window.location.href = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
                      }}
                      className="w-full flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-colors shadow cursor-pointer border-none"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Pre-Order</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
