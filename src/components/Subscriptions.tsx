import { Check, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function Subscriptions() {
  const { addToCart } = useStore();
  const gamingSubs = [
    {
      id: 'sub-ps-plus-1m',
      platform: 'PS5',
      title: 'PS Plus Extra (1 Month)',
      price: '499Rs',
      originalPrice: '999Rs',
      duration: '1 Month Access',
      description: 'Access hundreds of PS5 titles, classic catalog games, and online multiplayer perks.',
      features: [
        'Huge PS5 Game Catalog access',
        'Online Multiplayer enabled',
        'Monthly free games included',
        'Secure account delivery & verification'
      ],
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLo6i-iw5V0UdIabSaI_1l7fEYzaHRrI_j4LrlHCwWlA&s=10',
      badge: 'Popular'
    },
    {
      id: 'sub-ps-plus-1y',
      platform: 'PS5',
      title: 'PS Plus Extra (1 Year)',
      price: '3999Rs',
      originalPrice: '8709Rs',
      duration: '1 Year Access',
      description: 'Full 1-year pass for PS5 with uninterrupted gaming and complete access to the library.',
      features: [
        'Full 12 months access on PS5',
        'Online Multiplayer enabled',
        'Maximum savings value',
        'Instant WhatsApp delivery & support'
      ],
      logoUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLo6i-iw5V0UdIabSaI_1l7fEYzaHRrI_j4LrlHCwWlA&s=10',
      badge: 'Best Value'
    },
    {
      id: 'sub-xbox-pass',
      platform: 'Xbox & PC',
      title: 'Xbox Game Pass',
      price: '350Rs',
      originalPrice: '899Rs',
      duration: '1 Month Pass',
      description: 'Play hundreds of high-quality games on PC and console with day-one releases.',
      features: [
        'Day-one new releases included',
        'Cross-platform play support',
        'Reliable customer support guarantee',
        'Instant activation instructions'
      ],
      logoUrl: 'https://sm.ign.com/ign_in/screenshot/default/48de604b-99ee-4400-a600-6958a71f0959_caj1.jpg',
      badge: 'Featured'
    }
  ];

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-16">
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#253745]/50 border border-[#4A5C6A]/30 text-[#CCD0CF] text-xs font-bold uppercase tracking-wider">
          <span>Official Gaming Subscriptions</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-wider">
          Console & PC Subscriptions
        </h2>
        <p className="text-[#9BA8AB] text-sm max-w-lg">
          Get verified gaming passes and membership accounts instantly with guaranteed safety and support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        {gamingSubs.map((sub) => {
          return (
            <div 
              key={sub.id}
              className="relative bg-[#11212D] rounded-2xl border border-[#253745] hover:border-[#4A5C6A] p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 shadow-xl group"
            >
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#4A5C6A] to-[#CCD0CF] text-[#06141B] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                {sub.badge}
              </div>

              <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                  <div className="w-12 h-12 rounded-xl bg-[#06141B] border border-[#253745] flex items-center justify-center overflow-hidden shadow-inner">
                    <img 
                      src={sub.logoUrl} 
                      alt={sub.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#9BA8AB] uppercase tracking-wider">{sub.duration}</span>
                </div>

                <div className="text-[10px] font-extrabold text-[#4A5C6A] uppercase tracking-widest mb-1">{sub.platform}</div>
                <h3 className="text-lg font-black text-white uppercase tracking-wider mb-2">{sub.title}</h3>
                <p className="text-xs text-[#9BA8AB] leading-relaxed mb-6">{sub.description}</p>

                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-3xl sm:text-4xl font-black text-white">{sub.price}</span>
                  <span className="text-xs text-red-400 line-through font-semibold">{sub.originalPrice}</span>
                </div>

                <div className="space-y-3 mb-8 border-t border-[#253745]/60 pt-6">
                  {sub.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs text-[#CCD0CF]">
                      <div className="w-4 h-4 rounded-full bg-[#253745] flex items-center justify-center shrink-0 text-white">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => addToCart({
                  title: sub.title,
                  price: sub.price,
                  originalPrice: sub.originalPrice,
                  onSale: true,
                  customCoverUrl: sub.logoUrl,
                  description: sub.description
                })}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] border border-[#4A5C6A]/60 text-white font-bold transition-all text-center uppercase tracking-wider text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2 group/btn"
              >
                <ShoppingCart className="w-4 h-4 text-[#CCD0CF] group-hover/btn:scale-110 transition-transform" />
                <span>Add to Cart</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}