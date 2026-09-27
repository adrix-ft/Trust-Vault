import { useStore } from '../context/StoreContext';
import { Monitor, Gamepad2, Layers, Crown, ShieldCheck, Package, MessageCircle } from 'lucide-react';

export default function PlatformFilter() {
  const { platformFilter, setPlatformFilter, selectedCategory, setSelectedCategory } = useStore();

  const filters = [
    { id: 'PC', label: 'PC Games', icon: Monitor, type: 'platform' },
    { id: 'PS5', label: 'PS Games', icon: Gamepad2, type: 'platform' },
    { id: 'Custom Bundle', label: 'Build Bundle', icon: Package, type: 'category', iconClass: 'text-emerald-400' },
    { id: 'Proofs', label: 'Proofs', icon: ShieldCheck, type: 'category', iconClass: 'text-green-400' }
  ];

  return (
    <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible hide-scrollbar flex-nowrap sm:flex-wrap">
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
            className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs tracking-wider uppercase transition-all duration-300 border shadow-sm cursor-pointer shrink-0 whitespace-nowrap ${
              isActive
                ? 'bg-[#4A5C6A] text-white border-[#4A5C6A]'
                : `bg-[#11212D] text-[#9BA8AB] border-[#253745] ${isProofsHover}`
            }`}
          >
            <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors ${filter.iconClass || ''} ${isActive && filter.id === 'Proofs' ? 'text-green-300' : ''}`} />
            
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{filter.id === 'Custom Bundle' ? 'Bundles' : filter.id}</span>
          </button>
        );
      })}
    </div>
  );
}