import { useStore, isPlayStationPlatform } from '../context/StoreContext';
import { Layers, Crown, ShieldCheck, Package, MessageCircle, Repeat } from 'lucide-react';
import { SteamIcon, PSIcon } from './Navbar';

export default function PlatformFilter() {
  const { platformFilter, setPlatformFilter, selectedCategory, setSelectedCategory } = useStore();

  const filters = [
    { id: 'PS', type: 'platform', icon: PSIcon, isCustom: true },
    { id: 'PC', type: 'platform', icon: SteamIcon, isCustom: true },
    { id: 'Subscriptions', label: 'Subscriptions', type: 'category', icon: Repeat, iconClass: 'text-purple-400' },
    { id: 'Custom Bundle', label: 'Build Bundle', icon: Package, type: 'category', iconClass: 'text-emerald-400' },
    { id: 'Proofs', label: 'Proofs', icon: ShieldCheck, type: 'category', iconClass: 'text-green-400' }
  ];

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto flex-wrap">
      {filters.map(filter => {
        const Icon = filter.icon;
        
        const isActive = filter.type === 'category' 
          ? selectedCategory === filter.id
          : (filter.id === 'PS' ? isPlayStationPlatform(platformFilter) : platformFilter === filter.id) && selectedCategory === 'Store';

        const isProofsHover = filter.id === 'Proofs' && !isActive 
          ? 'hover:border-green-500/50 hover:bg-green-500/5 hover:text-white' 
          : 'hover:border-[#D1D5DB] hover:text-gray-900';

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
            className={`group flex items-center justify-center gap-1 sm:gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 border shadow-sm cursor-pointer shrink-0 whitespace-nowrap ${
              isActive
                ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                : `bg-[#FFFFFF] text-[#4B5563] border-[#E5E7EB] hover:bg-gray-50 ${isProofsHover}`
            }`}
          >
            <Icon className={filter.isCustom ? `text-[9px] sm:text-[10px] ${filter.iconClass || ''}` : `w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${filter.iconClass || ''} ${isActive && filter.id === 'Proofs' ? 'text-green-300' : ''}`} />
            
            {!filter.isCustom && (
              <>
                <span className="hidden sm:inline">{filter.label}</span>
                <span className="sm:hidden">{filter.id === 'Custom Bundle' ? 'Bundles' : filter.id}</span>
              </>
            )}
          </button>
        );
      })}
    </div>
  );
}
