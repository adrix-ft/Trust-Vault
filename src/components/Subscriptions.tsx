import { Check, ShoppingCart, Repeat } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import React, { useState, useEffect } from 'react';

export default function Subscriptions() {
  const { addToCart, subscriptions, subscriptionsLoaded } = useStore();
  const [selectedPricing, setSelectedPricing] = useState<Record<string, number>>({});

  const handleSelectPricing = (subId: string, idx: number) => {
    setSelectedPricing(prev => ({ ...prev, [subId]: idx }));
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-16">
      <div className="flex flex-col items-center text-center space-y-3 mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5E7EB]/50 border border-[#D1D5DB]/30 text-[#1F2937] text-xs font-bold uppercase tracking-wider">
          <span>Official Subscriptions</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 uppercase tracking-wider">
          Premium Subscriptions
        </h2>
        <p className="text-[#4B5563] text-sm max-w-lg">
          Get verified passes and membership accounts instantly with guaranteed safety and support.
        </p>
      </div>

      {(!subscriptionsLoaded) ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#FCFBF6] rounded-3xl overflow-hidden border border-[#E5E7EB] animate-pulse h-96 flex flex-col">
              <div className="h-40 bg-[#E5E7EB]" />
              <div className="p-6 flex-1 flex flex-col gap-4">
                <div className="flex gap-4 items-end -mt-10">
                  <div className="w-20 h-20 bg-[#F5F4EE] rounded-2xl border-2 border-[#FCFBF6] z-10" />
                  <div className="flex-1 space-y-2 pb-2">
                    <div className="h-5 bg-[#E5E7EB] rounded w-3/4" />
                    <div className="h-3 bg-[#E5E7EB] rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="h-3 bg-[#E5E7EB] rounded w-full" />
                  <div className="h-3 bg-[#E5E7EB] rounded w-5/6" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="text-center py-20 bg-[#FCFBF6]/50 border border-[#E5E7EB] rounded-2xl max-w-3xl mx-auto">
          <Repeat className="w-12 h-12 text-[#D1D5DB] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider mb-2">No Subscriptions Available</h3>
          <p className="text-[#4B5563] text-sm">We are currently updating our subscription plans. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {subscriptions.map((sub) => {
            const currentPricingIdx = selectedPricing[sub.id] || 0;
            const currentPricingArray = Array.isArray(sub.pricing) ? sub.pricing : [];
            const currentPricing = currentPricingArray.length > 0 ? currentPricingArray[currentPricingIdx] : { duration: '', price: '', originalPrice: '' };
            if (!currentPricing) return null;

            const featureList = Array.isArray(sub.details) ? sub.details : Array.isArray(sub.features) ? sub.features : [];

            return (
              <div 
                key={sub.id}
                className="relative bg-[#0a151b] rounded-3xl overflow-hidden border border-[#E5E7EB] hover:border-[#D1D5DB] flex flex-col justify-between transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.5)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.8)] group transform hover:-translate-y-1"
                style={{ 
                  '--sub-color': sub.themeColor || '#10b981',
                } as React.CSSProperties}
              >
                {/* Banner & Badge */}
                <div className="relative h-40 w-full bg-[#FCFBF6]">
                  {sub.bannerUrl ? (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a151b] via-transparent to-transparent z-10" />
                      <div className="absolute inset-0 bg-[var(--sub-color)] opacity-20 mix-blend-overlay z-10" />
                      <img src={sub.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-80" />
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--sub-color)] to-[#0a151b] opacity-20 z-0" />
                  )}
                  
                  {sub.badge && (
                    <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-[var(--sub-color)]/30 text-gray-900 text-[10px] font-black uppercase tracking-widest shadow-lg">
                      {sub.badge}
                    </div>
                  )}
                </div>

                <div className="px-6 relative z-20 -mt-10 flex-1 flex flex-col">
                  {/* Logo & Title */}
                  <div className="flex items-end gap-4 mb-5">
                    <div 
                      className="w-20 h-20 rounded-2xl bg-[#0a151b] border-2 border-white/20 flex items-center justify-center overflow-hidden shadow-xl shrink-0 relative z-30"
                      style={{ borderColor: 'color-mix(in srgb, var(--sub-color) 30%, rgba(255,255,255,0.2))' }}
                    >
                      {sub.logoUrl ? (
                        <img src={sub.logoUrl} alt={sub.name} className="w-full h-full object-cover" />
                      ) : (
                        <Repeat className="w-8 h-8 text-white/50" />
                      )}
                    </div>
                    <div className="pb-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-wider leading-tight drop-shadow-md">{sub.name || sub.title || 'Subscription'}</h3>
                      <div className="text-[10px] font-extrabold uppercase tracking-widest mt-0.5" style={{ color: 'var(--sub-color)' }}>Official Subscription</div>
                    </div>
                  </div>

                  {/* Description */}
                  {sub.description && (
                    <p className="text-gray-300 text-xs leading-relaxed mb-6">
                      {sub.description}
                    </p>
                  )}

                  {/* Pricing Selection */}
                  <div className="mb-6 bg-white/10 p-4 rounded-2xl border border-white/20">
                    <label className="block text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-3">Select Plan</label>
                    <div className="space-y-2">
                      {currentPricingArray.map((p, idx) => {
                        const isSelected = currentPricingIdx === idx;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectPricing(sub.id, idx)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                              isSelected 
                                ? 'bg-white text-gray-900 shadow-lg' 
                                : 'bg-black/20 border-white/10 text-gray-300 hover:border-white/30 hover:bg-black/40'
                            }`}
                            style={isSelected ? { borderColor: 'var(--sub-color)' } : {}}
                          >
                            <span>{p.duration || 'Standard Plan'}</span>
                            <div className="flex items-baseline gap-2">
                              {p.originalPrice && (
                                <span className="text-[10px] text-red-400/80 line-through font-semibold">{p.originalPrice}</span>
                              )}
                              <span style={isSelected ? { color: 'var(--sub-color)' } : {}} className={isSelected ? '' : 'text-gray-300'}>
                                {p.price || 'Free'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8 flex-1">
                    {featureList.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3 text-xs text-gray-300">
                        <div 
                          className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                          style={{ backgroundColor: 'color-mix(in srgb, var(--sub-color) 20%, #FCFBF6)', color: 'var(--sub-color)' }}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add to Cart Button */}
                <div className="p-6 pt-0 mt-auto">
                  <button
                    onClick={() => addToCart({
                      title: `${sub.name || sub.title || 'Subscription'} - ${currentPricing?.duration || ''}`,
                      price: currentPricing?.price || sub.price || '0',
                      originalPrice: currentPricing?.originalPrice,
                      categories: ['Subscriptions'],
                      customCoverUrl: sub.logoUrl || undefined,
                      description: sub.description || featureList.join(', ')
                    })}
                    disabled={currentPricingArray.length === 0}
                    className="relative w-full py-4 rounded-2xl font-black transition-all text-center uppercase tracking-wider text-xs shadow-xl flex items-center justify-center gap-2 cursor-pointer overflow-hidden group/btn"
                    style={{ 
                      backgroundColor: currentPricingArray.length === 0 ? '#FCFBF6' : 'var(--sub-color)',
                      color: currentPricingArray.length === 0 ? '#D1D5DB' : '#000',
                      opacity: currentPricingArray.length === 0 ? 0.5 : 1
                    }}
                  >
                    {currentPricingArray.length > 0 && (
                      <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-[0%] transition-transform duration-300 ease-out" />
                    )}
                    <ShoppingCart className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Add to Cart - {currentPricing?.price || sub.price || 'N/A'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
