import { useState, useEffect } from 'react';
import { ShieldCheck, ExternalLink } from 'lucide-react';

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://store-vault-backend.onrender.com';

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
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-hidden bg-white">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-10">
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-wider">
          Customer Screenshots
        </h2>
        <p className="text-gray-600 text-sm max-w-lg">
          Real WhatsApp screenshots from our customers.
        </p>
      </div>

      {/* Loading / Proofs Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : proofs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-gray-200 shadow-sm max-w-4xl mx-auto">
          <p className="text-gray-700 text-xs uppercase font-bold tracking-wider mb-2">
            No proof screenshots uploaded yet.
          </p>
          <p className="text-gray-500 text-[11px]">
            Upload your deal screenshots into your 'proof' bucket on your second Supabase account.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col gap-6 overflow-hidden w-full py-4 max-w-[100vw] -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          
          {/* Row 1: Moves Left */}
          <div className="flex gap-6 w-full group">
            <div className="flex animate-marquee gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3">
              {[...proofs].map((url, index) => (
                <div 
                  key={`r1-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 1 - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex animate-marquee gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3" aria-hidden="true">
              {[...proofs].map((url, index) => (
                <div 
                  key={`r1-dup-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 1 Dup - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Moves Right */}
          <div className="flex gap-6 w-full group">
            <div className="flex animate-marquee-reverse gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3">
              {/* Offset array so it looks different vertically */}
              {[...proofs].reverse().map((url, index) => (
                <div 
                  key={`r2-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 2 - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex animate-marquee-reverse gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3" aria-hidden="true">
              {[...proofs].reverse().map((url, index) => (
                <div 
                  key={`r2-dup-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 2 Dup - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Row 3: Moves Left */}
          <div className="flex gap-6 w-full group">
            <div className="flex animate-marquee gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3">
              {[...proofs.slice(Math.floor(proofs.length / 2)), ...proofs.slice(0, Math.floor(proofs.length / 2))].map((url, index) => (
                <div 
                  key={`r3-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 3 - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="flex animate-marquee gap-6 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-3" aria-hidden="true">
              {[...proofs.slice(Math.floor(proofs.length / 2)), ...proofs.slice(0, Math.floor(proofs.length / 2))].map((url, index) => (
                <div 
                  key={`r3-dup-${index}`} 
                  onClick={() => onSelectImage(url)}
                  className="relative shrink-0 w-[300px] sm:w-[350px] md:w-[420px] aspect-video bg-[#F5F4EE] rounded-xl border border-[#E5E7EB] shadow-md overflow-hidden cursor-pointer transform transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  <img src={url} alt={`Proof Row 3 Dup - ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
