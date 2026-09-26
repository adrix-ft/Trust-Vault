import { X, Trash2, User, Phone, Loader2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';
import { getGameCoverUrl } from '../utils/image';
import React, { useState } from 'react';

const STORE_WHATSAPP_NUMBER = "918824647379";

// FIXED: Dynamically load the API URL from Vercel Environment Variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://amin-game-store-backend.onrender.com';

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, clearCart } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = cart.reduce((acc, item) => {
    const priceStr = item.purchaseType === 'rent' ? (item.rentPrice || item.price) : item.price;
    const price = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    return acc + price;
  }, 0);

  const totalOriginal = cart.reduce((acc, item) => {
    if (item.purchaseType === 'rent') return acc + (parseInt((item.rentPrice || item.price).replace(/[^0-9]/g, '')) || 0);
    const origPriceStr = item.onSale && item.originalPrice ? item.originalPrice : item.price;
    const origPrice = parseInt(origPriceStr.replace(/[^0-9]/g, '')) || 0;
    return acc + origPrice;
  }, 0);

  const totalSavings = totalOriginal - total;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMobileNumber(val);
  };

  const handleCheckout = async () => {
    if (cart.length === 0 || isSubmitting) return;

    const trimmedName = customerName.trim();
    const trimmedPhone = mobileNumber.trim();

    if (!trimmedName || !trimmedPhone) {
      setFormError('Please enter your name and mobile number');
      return;
    }

    const nameRegex = /^[A-Za-z\s]{3,}$/;
    if (!nameRegex.test(trimmedName)) {
      setFormError('Please enter a valid proper name (at least 3 letters)');
      return;
    }

    if (trimmedPhone.length !== 10) {
      setFormError('Mobile number must be exactly 10 digits');
      return;
    }
    
    setFormError('');
    setIsSubmitting(true);

    try {
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: trimmedName,
          mobileNumber: trimmedPhone,
          totalAmount: total,
          items: cart
        })
      });

      const rentItems = cart.filter(item => item.purchaseType === 'rent');
      if (rentItems.length > 0) {
        await fetch(`${API_BASE_URL}/api/rents`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: trimmedName,
            mobileNumber: trimmedPhone,
            totalAmount: rentItems.reduce((acc, item) => acc + (parseInt((item.rentPrice || item.price).replace(/[^0-9]/g, '')) || 0), 0),
            items: rentItems
          })
        });
      }
    } catch (err) {
      console.error('Failed to save order on backend:', err);
    }
    
    let message = `*NEW ORDER*\n\n`;
    message += `👤 *Customer:* ${trimmedName}\n`;
    message += `📱 *Mobile:* ${trimmedPhone}\n\n`;
    message += `*Items:*\n`;
    
    cart.forEach((item, index) => {
      const platforms = item.categories?.filter(cat => cat === 'PC' || cat === 'PS5') || [];
      const platformStr = platforms.length > 0 ? ` [${platforms.join(', ')}]` : '';
      const priceStr = item.purchaseType === 'rent' ? (item.rentPrice || item.price) : item.price;
      const titleExtra = item.purchaseType === 'rent' ? ` (RENT: ${item.rentPeriod || 'Limited'})` : '';
      message += `${index + 1}. *${item.title}${titleExtra}*${platformStr} - ${priceStr}`;
      if (item.onSale && item.originalPrice && item.purchaseType !== 'rent') {
         message += ` (Discounted from ${item.originalPrice})`;
      }
      message += `\n`;
    });
    
    message += `\n*Total Bill: ${total}Rs*`;
    if (totalSavings > 0) {
      message += `\n*Total Savings: ${totalSavings}Rs*`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    clearCart();
    setIsCartOpen(false);
    setIsSubmitting(false);
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !isSubmitting && setIsCartOpen(false)}
            className="fixed inset-0 bg-black/80 z-[60]"
          />
          
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#06141B] border-l border-[#253745] z-[70] flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-[#253745] flex items-center justify-between bg-[#06141B]">
              <h2 className="text-xl font-black tracking-widest text-[#CCD0CF]">CART</h2>
              <button 
                onClick={() => !isSubmitting && setIsCartOpen(false)} 
                disabled={isSubmitting}
                className="p-2 text-[#9BA8AB] hover:text-white bg-[#11212D] rounded-full hover:bg-[#253745] transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#06141B]">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[#4A5C6A]">
                  <div className="text-6xl mb-4">🛒</div>
                  <p className="text-sm font-medium tracking-wide">Your cart is empty.</p>
                </div>
              ) : (
                <AnimatePresence>
                  {cart.map(item => {
                    const platforms = item.categories?.filter(cat => cat === 'PC' || cat === 'PS5') || [];
                    return (
                      <motion.div 
                        key={item.title}
                        layout="position"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="bg-[#11212D] border border-[#253745] rounded-lg p-4 flex items-start gap-4 shadow-sm relative overflow-hidden"
                      >
                        <div className="absolute inset-0 w-24 opacity-20 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url('${item.customCoverUrl || getGameCoverUrl(item.title)}')` }}></div>
                        
                        <div className="w-12 h-16 shrink-0 bg-cover bg-center rounded-sm border border-[#253745] z-10" style={{ backgroundImage: `url('${item.customCoverUrl || getGameCoverUrl(item.title)}')` }}></div>
                        
                        <div className="flex-1 z-10 min-w-0 pr-1">
                          <h3 className="text-sm font-bold text-[#CCD0CF] leading-snug">
                            {item.title} {item.purchaseType === 'rent' && <span className="text-orange-400 text-[10px] ml-1 uppercase">(Rent: {item.rentPeriod || 'Limited'})</span>}
                          </h3>
                          
                          {platforms.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {platforms.map(plat => (
                                <span key={plat} className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#06141B] text-[#9BA8AB] border border-[#253745]">
                                  {plat}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 mt-1">
                            {item.onSale && item.originalPrice && item.purchaseType !== 'rent' && (
                              <span className="text-xs font-bold text-red-400 line-through decoration-red-400/50">{item.originalPrice}</span>
                            )}
                            <p className="text-[#4A5C6A] text-xs font-semibold">
                              {item.purchaseType === 'rent' ? (item.rentPrice || item.price) : item.price}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end justify-start z-10 shrink-0">
                          <button 
                            onClick={() => !isSubmitting && removeFromCart(item.title)} 
                            disabled={isSubmitting}
                            className="p-2 text-[#4A5C6A] hover:text-red-400 transition-colors bg-[#06141B] rounded-full border border-[#253745] disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </div>
            
            {cart.length > 0 && (
              <div className="p-6 border-t border-[#253745] bg-[#06141B] space-y-4">
                <div className="space-y-3 bg-[#11212D]/60 p-3.5 rounded-xl border border-[#253745]">
                  <p className="text-[11px] font-bold text-[#9BA8AB] uppercase tracking-wider">Customer Details</p>
                  
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5C6A]" />
                    <input
                      type="text"
                      placeholder="Your Name (Letters only)"
                      value={customerName}
                      disabled={isSubmitting}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-[#4A5C6A] disabled:opacity-50"
                    />
                  </div>

                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A5C6A]" />
                    <input
                      type="tel"
                      placeholder="Mobile Number (10 digits)"
                      value={mobileNumber}
                      disabled={isSubmitting}
                      onChange={handlePhoneChange}
                      maxLength={10}
                      className="w-full bg-[#06141B] border border-[#253745] rounded-lg py-2 pl-9 pr-3 text-xs text-white placeholder:text-[#4A5C6A] focus:outline-none focus:border-[#4A5C6A] disabled:opacity-50"
                    />
                  </div>

                  {formError && (
                    <p className="text-[11px] font-bold text-red-400 tracking-wide">{formError}</p>
                  )}
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[#9BA8AB] text-xs font-medium">
                    <span>Subtotal</span>
                    <div className="flex gap-2">
                       {totalSavings > 0 && (
                         <span className="text-red-400 line-through">{totalOriginal}Rs</span>
                       )}
                       <span>{total}Rs</span>
                    </div>
                  </div>
                  {totalSavings > 0 && (
                    <div className="flex justify-between text-green-500 text-xs font-bold tracking-wide">
                      <span>Savings</span>
                      <span>- {totalSavings}Rs</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#CCD0CF] text-base font-black tracking-wide pt-1 border-t border-[#253745]/50">
                    <span>TOTAL</span>
                    <span>{total}Rs</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button 
                    onClick={() => !isSubmitting && clearCart()}
                    disabled={isSubmitting}
                    className="px-4 py-3 rounded-lg font-bold tracking-widest text-xs text-[#9BA8AB] bg-[#11212D] hover:bg-[#253745] transition-colors border border-[#253745] uppercase disabled:opacity-50 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={handleCheckout}
                    disabled={isSubmitting}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#253745] hover:bg-[#4A5C6A] border border-[#4A5C6A] text-[#CCD0CF] py-3 rounded-lg font-bold tracking-widest text-xs uppercase transition-all shadow-[0_0_15px_rgba(37,55,69,0.4)] disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <span>Confirm Order</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}