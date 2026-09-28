import GlobalOverlays from './components/GlobalOverlays';
import FloatingMobileCart from './components/FloatingMobileCart';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FeaturesBanner from './components/FeaturesBanner';
import GameLibrary from './components/GameLibrary';
import { StoreProvider, useStore } from './context/StoreContext';
import PlatformFilter from './components/PlatformFilter';
import { motion, AnimatePresence } from 'motion/react';
import { X, MessageCircle } from 'lucide-react';
import { useState, useEffect, lazy, Suspense } from 'react';

const loadSubscriptions = () => import('./components/Subscriptions');
const loadContactUs = () => import('./components/ContactUs');
const loadFooter = () => import('./components/Footer');
const loadCartDrawer = () => import('./components/CartDrawer');
const loadVideoModal = () => import('./components/VideoModal');
const loadProofSection = () => import('./components/ProofSection');
const loadAdminDashboard = () => import('./components/AdminDashboard');
const loadAdminLogin = () => import('./components/AdminLogin');
const loadGameDetailsView = () => import('./components/GameDetailsView');
const loadCustomBundleBuilder = () => import('./components/CustomBundleBuilder');

const Subscriptions = lazy(loadSubscriptions);
const ContactUs = lazy(loadContactUs);
const Footer = lazy(loadFooter);
const CartDrawer = lazy(loadCartDrawer);
const VideoModal = lazy(loadVideoModal);
const ProofSection = lazy(loadProofSection);
const AdminDashboard = lazy(loadAdminDashboard);
const AdminLogin = lazy(loadAdminLogin);
const GameDetailsView = lazy(loadGameDetailsView);
const CustomBundleBuilder = lazy(loadCustomBundleBuilder);

function FloatingWhatsApp() {
  const { isCartOpen } = useStore();
  
  if (isCartOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
      <AnimatePresence>
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-[#11212D] text-[#CCD0CF] text-[11px] font-bold py-2.5 px-4 rounded-2xl shadow-xl border border-[#253745] pointer-events-auto"
          >
            Didn't find your game? <br/>
            <span className="text-white">Ask us here!</span>
          </motion.div>
      </AnimatePresence>

      <a
        href="https://wa.me/918824647379?text=Hey,%20I%20didn't%20find%20what%20I%20was%20looking%20for.%20Can%20you%20help?"
        target="_blank"
        rel="noopener noreferrer"
        className="w-14 h-14 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] transition-transform hover:scale-110 pointer-events-auto"
      >
        <MessageCircle className="w-7 h-7" />
      </a>
    </div>
  );
}

function AppContent() {
  const { selectedCategory, setSelectedCategory, isAdmin, catalogLoaded } = useStore();
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  useEffect(() => {
    // Prefetch all lazy components in the background after initial render
    const prefetchComponents = () => {
      loadSubscriptions();
      loadContactUs();
      loadFooter();
      loadCartDrawer();
      loadVideoModal();
      loadProofSection();
      loadAdminDashboard();
      loadAdminLogin();
      loadGameDetailsView();
      loadCustomBundleBuilder();
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchComponents, { timeout: 2000 });
    } else {
      setTimeout(prefetchComponents, 2000);
    }
  }, []);

  // If Admin is logged in, show Dashboard but KEEP the Overlays so Toasts work!
  if (isAdmin) {
    return (
      <Suspense fallback={<div className="h-screen bg-[#06141B] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
        <AdminDashboard />
        <GlobalOverlays />
      </Suspense>
    );
  }

  // Removed navLinks as we only have PC, PS, Proofs now
  return (
    <div className="bg-[#06141B] text-[#CCD0CF] min-h-screen font-sans selection:bg-[#253745] selection:text-[#CCD0CF] overflow-x-hidden relative">
      {/* GLOBAL BLINK LOADING BAR */}
      {!catalogLoaded && (
        <div className="fixed top-0 left-0 right-0 h-1 z-[999999] bg-[#06141B] overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full animate-blink-bar" />
        </div>
      )}

      <Navbar />
      
      {/* Mobile-only Sticky Navigation */}
      <div className="md:hidden w-full bg-[#06141B]/95 backdrop-blur-2xl border-b border-[#253745]/60 sticky top-[64px] z-40 shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
        
        {/* Upper Row: Platform Filters & Proofs (Visible on all sizes) */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-start sm:justify-center overflow-x-auto hide-scrollbar">
          {/* PlatformFilter now contains the Proofs button automatically! */}
          <PlatformFilter />
        </div>

      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedCategory}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Suspense fallback={<div className="h-[50vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}>
            {selectedCategory === 'Store' && (
              <>
                <Hero />
                <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 space-y-10 md:space-y-16 py-6 md:py-12 relative z-10">
                  <FeaturesBanner />
                  <GameLibrary />
                </main>
              </>
            )}

            {selectedCategory === 'Proofs' && (
              <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
                <ProofSection onSelectImage={setSelectedProofImage} />
              </main>
            )}

            {selectedCategory === 'Contact Us' && (
              <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
                <ContactUs />
              </main>
            )}

            {selectedCategory === 'Custom Bundle' && (
              <main className="w-full relative z-10">
                <CustomBundleBuilder />
              </main>
            )}

            {selectedCategory.startsWith('Game: ') && (
              <main className="w-full relative z-10">
                <GameDetailsView gameTitle={selectedCategory.replace('Game: ', '')} />
              </main>
            )}

            {selectedCategory === 'Subscriptions' && (
              <main className="w-full relative z-10">
                <Subscriptions />
              </main>
            )}
          </Suspense>
        </motion.div>
      </AnimatePresence>

      <Suspense fallback={null}>
        <Footer />
        <CartDrawer />
        <AdminLogin />
        <VideoModal />
      </Suspense>

      {/* LIGHTBOX FOR PROOF IMAGES */}
      {selectedProofImage && (
        <div 
          onClick={() => setSelectedProofImage(null)}
          className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 overflow-y-auto cursor-pointer"
        >
          <div 
            onClick={(e) => e.stopPropagation()} 
            className="relative max-w-3xl w-full bg-[#11212D] rounded-2xl border border-[#4A5C6A] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-3 my-auto cursor-default"
          >
            <button 
              onClick={() => setSelectedProofImage(null)}
              className="absolute -top-4 -right-4 z-50 bg-[#06141B] hover:bg-[#253745] text-white p-2.5 rounded-full border border-[#4A5C6A] shadow-2xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedProofImage} 
              alt="Enlarged Proof" 
              className="w-full h-auto max-h-[82vh] object-contain rounded-xl block mx-auto"
            />
          </div>
        </div>
      )}
      
      {/* FLOATING MOBILE CART */}
      <FloatingMobileCart />

      {/* GLOBAL TOAST & CONFIRM OVERLAYS */}
      <GlobalOverlays />

      {/* FLOATING WHATSAPP BUTTON */}
      <FloatingWhatsApp />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}