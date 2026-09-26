import GlobalOverlays from './components/GlobalOverlays';
import FloatingMobileCart from './components/FloatingMobileCart';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Promos from './components/Promos';
import GameBundles from './components/GameBundles';
import PlayerReviews from './components/PlayerReviews';
import Discounts from './components/Discounts';
import GameLibrary from './components/GameLibrary';
import Subscriptions from './components/Subscriptions';
import ContactUs from './components/ContactUs';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import { StoreProvider, useStore } from './context/StoreContext';
import PlatformFilter from './components/PlatformFilter';
import VideoModal from './components/VideoModal';
import FilteredGames from './components/FilteredGames';
import CollectionsView from './components/CollectionsView';
import ProofSection from './components/ProofSection';
import AdminDashboard from './components/AdminDashboard';
import AdminLogin from './components/AdminLogin';
import UpcomingView from './components/UpcomingView';
import GameDetailsView from './components/GameDetailsView';
import CustomBundleBuilder from './components/CustomBundleBuilder';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';

function AppContent() {
  const { selectedCategory, setSelectedCategory, isAdmin } = useStore();
  const [selectedProofImage, setSelectedProofImage] = useState<string | null>(null);

  // If Admin is logged in, show Dashboard but KEEP the Overlays so Toasts work!
  if (isAdmin) {
    return (
      <>
        <AdminDashboard />
        <GlobalOverlays />
      </>
    );
  }

  // Removed navLinks as we only have PC, PS, Proofs now
  return (
    <div className="bg-[#06141B] text-[#CCD0CF] min-h-screen font-sans selection:bg-[#253745] selection:text-[#CCD0CF] overflow-x-hidden relative">
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
          {selectedCategory === 'Store' && (
            <>
              <Hero />
              <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 space-y-10 md:space-y-16 py-6 md:py-12 relative z-10">
                <PlayerReviews />
                <Discounts />
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
        </motion.div>
      </AnimatePresence>

      <Footer />
      <CartDrawer />
      <AdminLogin />
      <VideoModal />

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