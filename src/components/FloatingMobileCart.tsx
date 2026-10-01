import { ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { motion, AnimatePresence } from 'motion/react';

export default function FloatingMobileCart() {
  const { cart, setIsCartOpen } = useStore();

  if (cart.length === 0) return null;

  const total = cart.reduce((acc, item) => acc + parseInt(item.price.replace(/[^0-9]/g, '')), 0);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="md:hidden fixed bottom-4 left-4 right-4 z-[60]"
      >
        <div 
          onClick={() => setIsCartOpen(true)}
          className="bg-[#11212D]/95 backdrop-blur-2xl border border-[#4A5C6A]/60 rounded-2xl p-4 flex items-center justify-between shadow-[0_10px_40px_rgba(0,0,0,0.8)] cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#253745] flex items-center justify-center text-white border border-[#4A5C6A]">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-[#06141B] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md border border-[#06141B]">
                {cart.length}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#9BA8AB] font-bold uppercase tracking-wider">Cart Total</span>
              <span className="text-white font-black">{total}Rs</span>
            </div>
          </div>
          
          <button className="relative overflow-hidden bg-gradient-to-r from-emerald-600 to-green-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(16,185,129,0.3)] group border border-emerald-400/50">
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer pointer-events-none" />
            <span className="relative z-10">Checkout</span>
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
