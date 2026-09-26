import { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

interface ProofSectionProps {
  onSelectImage: (url: string) => void;
}

export default function ProofSection({ onSelectImage }: ProofSectionProps) {
  const [proofs, setProofs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProofs() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/proofs`);
        
        // CRASH PROTECTION: Check if the server actually returned JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Server returned HTML instead of JSON. Render is likely still deploying the backend update.");
        }

        if (!response.ok) {
          throw new Error(`Server returned status: ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setProofs(data);
        }
      } catch (err) {
        console.error('Unexpected error fetching proofs:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProofs();
  }, []);

  return (
    <div className="space-y-8 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#253745]/50 border border-[#4A5C6A]/30 text-[#CCD0CF] text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-green-400" />
          <span>Verified Trust & Safety</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
          Customer Proofs & Deals
        </h2>
        <p className="text-[#9BA8AB] text-sm max-w-lg">
          Check out screenshots of our previous successful deliveries and happy gamers. Your satisfaction and trust come first!
        </p>
      </div>

      {/* Loading / Proofs Grid */}
      {loading ? (
        <div className="text-center py-16 text-[#9BA8AB] text-xs uppercase font-bold tracking-wider">
          Loading proofs...
        </div>
      ) : proofs.length === 0 ? (
        <div className="text-center py-16 bg-[#11212D]/40 rounded-2xl border border-[#253745] shadow-xl">
          <p className="text-[#CCD0CF] text-xs uppercase font-bold tracking-wider mb-2">
            No proof screenshots uploaded yet.
          </p>
          <p className="text-[#9BA8AB] text-[11px]">
            Upload your deal screenshots into your 'proof' bucket on your second Supabase account.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {proofs.map((url, index) => (
            <div 
              key={index} 
              onClick={() => onSelectImage(url)}
              className="bg-[#11212D] rounded-xl overflow-hidden border border-[#253745] hover:border-[#4A5C6A] transition-all cursor-pointer group shadow-lg flex flex-col"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-[#06141B]">
                <img 
                  src={url} 
                  alt={`Proof ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#06141B] via-transparent to-transparent opacity-60" />
                <div className="absolute top-2 right-2 bg-[#06141B]/80 backdrop-blur-md p-1.5 rounded-lg text-[#CCD0CF] opacity-0 group-hover:opacity-100 transition-opacity border border-[#253745]">
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              </div>
              <div className="p-3 bg-[#06141B]/60 flex items-center justify-between border-t border-[#253745]">
                <span className="text-[11px] font-bold text-[#CCD0CF] uppercase tracking-wider">
                  Verified Deal #{index + 1}
                </span>
                <span className="text-[10px] text-green-400 font-black uppercase">Secure</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}