import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function GlobalOverlays() {
  const { toasts, removeToast, confirmReq, setConfirmReq } = useStore();

  return (
    <>
      {/* 1. TOAST NOTIFICATIONS (Xbox Achievement Style) */}
      <div className="fixed bottom-6 right-6 z-[99999] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => {
            const Icon = toast.type === 'success' ? CheckCircle2 : toast.type === 'error' ? AlertCircle : Info;
            const colors = toast.type === 'success' 
                ? 'bg-green-500/10 border-green-500/30 text-green-400' 
                : toast.type === 'error' 
                ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                : 'bg-sky-500/10 border-sky-500/30 text-sky-400';

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="pointer-events-auto flex items-center gap-3 px-4 py-3.5 rounded-xl border shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-2xl bg-[#06141B]/90 min-w-[280px] max-w-sm"
              >
                <div className={`p-2 rounded-lg ${colors}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold text-white tracking-wide flex-1 leading-snug">
                  {toast.message}
                </p>
                <button 
                  onClick={() => removeToast(toast.id)} 
                  className="text-[#9BA8AB] hover:text-white transition-colors bg-[#11212D] hover:bg-[#253745] p-1 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* 2. CUSTOM CONFIRMATION DIALOG */}
      <AnimatePresence>
        {confirmReq && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmReq(null)}
              className="fixed inset-0 bg-[#06141B]/90 backdrop-blur-md cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#11212D] border border-[#253745] rounded-2xl p-6 sm:p-8 shadow-2xl w-full max-w-sm relative z-10 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto mb-5 shadow-inner">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Confirm Action</h3>
              <p className="text-[#9BA8AB] text-sm mb-8 leading-relaxed">
                {confirmReq.message}
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmReq(null)}
                  className="flex-1 bg-[#06141B] hover:bg-[#253745] text-[#9BA8AB] hover:text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors border border-[#253745] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    confirmReq.onConfirm();
                    setConfirmReq(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3.5 rounded-xl font-bold uppercase tracking-wider text-xs transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}