import { X, ShieldCheck, Copyright, AlertTriangle, FileText, Info } from 'lucide-react';

interface FooterModalProps {
  type: 'discount' | 'privacy' | 'legal' | 'terms' | 'about' | null;
  onClose: () => void;
}

export default function FooterModal({ type, onClose }: FooterModalProps) {
  if (!type) return null;

  const getContent = () => {
    switch (type) {
      case 'terms':
        return {
          title: 'Terms & Conditions',
          icon: FileText,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9BA8AB] leading-relaxed">
              <p className="text-white font-semibold">
                Welcome to Amin Game Store. By purchasing from us, you agree to the following terms and usage guidelines:
              </p>
              
              <div className="bg-[#06141B] p-4 rounded-xl border border-[#253745] space-y-2">
                <h4 className="text-white font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Platform License Durations
                </h4>
                <ul className="list-disc pl-5 space-y-1 text-xs">
                  <li><strong className="text-white">PC Games:</strong> Provided with permanent access terms as specified per individual listing.</li>
                  <li><strong className="text-white">PS5 Games:</strong> Provided with 1-month access terms/accounts as per digital delivery guidelines.</li>
                </ul>
              </div>

              <p>
                All digital product deliveries are verified upon purchase. Users are strictly prohibited from redistributing account credentials, modifying files, or attempting unauthorized resales. Violation of these terms will result in immediate termination of access without refund.
              </p>
            </div>
          )
        };

      case 'legal':
        return {
          title: 'Legal & Copyright Notice',
          icon: Copyright,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9BA8AB] leading-relaxed">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer of Ownership:</strong> Amin Game Store is an independent digital game store facilitator. We do not claim ownership of any third-party intellectual properties.
                </span>
              </div>

              <p>
                All game titles, logos, cover arts, trademarks, and associated imagery displayed on this website are the sole property of their respective copyright holders and publishers, including but not limited to:
              </p>

              <div className="bg-[#06141B] p-4 rounded-xl border border-[#253745] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#CCD0CF]">
                <div>• Sony Interactive Entertainment</div>
                <div>• Rockstar Games</div>
                <div>• Capcom Co., Ltd.</div>
                <div>• Electronic Arts (EA)</div>
                <div>• Ubisoft Entertainment</div>
                <div>• FromSoftware / Bandai Namco</div>
                <div>• Square Enix & Nintendo</div>
                <div>• Telltale Games & Others</div>
              </div>

              <p className="text-[11px]">
                All assets are used strictly for identification, promotional, and informational context under fair use principles to connect gamers with digital content.
              </p>
            </div>
          )
        };

      case 'privacy':
        return {
          title: 'Privacy Policy',
          icon: ShieldCheck,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9BA8AB] leading-relaxed">
              <p>
                Your privacy is vital to us. Amin Game Store collects only necessary transaction details (such as contact handles and payment confirmations) required to deliver your game accounts or keys securely via WhatsApp or direct communication channels.
              </p>
              <p>
                We never store sensitive banking credentials or passwords on our servers. All information provided by customers remains confidential and is never sold or shared with external marketing third parties.
              </p>
            </div>
          )
        };

      case 'discount':
        return {
          title: 'Discount & Pricing Policy',
          icon: Info,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9BA8AB] leading-relaxed">
              <p>
                Prices and promotional discounts on Amin Game Store are subject to change based on regional availability, publisher updates, and special seasonal events. 
              </p>
              <p>
                Discounts marked with original price strikethroughs reflect promotional savings calculated directly against standard retail benchmarks at the time of catalog updates.
              </p>
            </div>
          )
        };

      case 'about':
        return {
          title: 'About Amin Game Store',
          icon: Info,
          content: (
            <div className="space-y-4 text-xs sm:text-sm text-[#9BA8AB] leading-relaxed">
              <p className="text-white font-semibold">
                Your trusted gateway to affordable, high-speed, next-gen gaming.
              </p>
              <p>
                Amin Game Store was built by gamers, for gamers. We bridge the gap between high-end entertainment and accessibility, ensuring quick verification, secure customer proofs, and seamless support for every title you play.
              </p>
            </div>
          )
        };

      default:
        return { title: '', icon: Info, content: null };
    }
  };

  const currentModal = getContent();
  const IconComponent = currentModal.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-[#11212D] border border-[#253745] rounded-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#06141B] border-b border-[#253745]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-[#253745]/50 border border-[#4A5C6A]/30 text-[#CCD0CF]">
              <IconComponent className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black tracking-wider uppercase">{currentModal.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full bg-[#11212D] hover:bg-[#253745] text-[#9BA8AB] hover:text-white transition-colors cursor-pointer border border-[#253745]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {currentModal.content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#06141B] border-t border-[#253745] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#253745] to-[#4A5C6A] hover:from-[#4A5C6A] hover:to-[#596F80] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}