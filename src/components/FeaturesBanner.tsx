import { ShieldCheck, Clock, Star, HeadphonesIcon } from 'lucide-react';

export default function FeaturesBanner() {
  const features = [
    {
      icon: ShieldCheck,
      title: "GamerProtect",
      desc: "Every Transaction Covered"
    },
    {
      icon: Clock,
      title: "Instant Delivery",
      desc: "90% order under 5 min"
    },
    {
      icon: Star,
      title: "4.7 / 5 Rating",
      desc: "From 500+ verified reviews"
    },
    {
      icon: HeadphonesIcon,
      title: "24/7 Support",
      desc: "Ready to Help You Anytime",
      link: "https://wa.me/918824647379?text=Hey,%20I%20need%20some%20support%20with%20my%20order/account."
    }
  ];

  return (
    <section className="w-full bg-[#FCFBF6] border-y border-[#E5E7EB] py-4 shadow-sm overflow-hidden group">
      <div className="flex w-full">
        <div className="flex animate-marquee gap-8 sm:gap-12 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-4">
          {[...features, ...features].map((feat, idx) => {
            const Icon = feat.icon;
            const content = (
              <>
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5F4EE] border border-[#E5E7EB] flex items-center justify-center text-emerald-500 group-hover/item:scale-110 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all shadow-md">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-gray-900 font-bold text-[13px] sm:text-[15px] leading-tight group-hover/item:text-emerald-500 transition-colors">{feat.title}</h4>
                  <p className="text-[#4B5563] text-[10px] sm:text-[12px] mt-0.5 leading-tight">{feat.desc}</p>
                </div>
              </>
            );

            if (feat.link) {
              return (
                <a 
                  key={idx} 
                  href={feat.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 group/item cursor-pointer shrink-0"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={idx} className="flex items-center gap-3 sm:gap-4 group/item shrink-0">
                {content}
              </div>
            );
          })}
        </div>
        
        <div className="flex animate-marquee gap-8 sm:gap-12 whitespace-nowrap min-w-full shrink-0 items-center justify-around px-4" aria-hidden="true">
          {[...features, ...features].map((feat, idx) => {
            const Icon = feat.icon;
            const content = (
              <>
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#F5F4EE] border border-[#E5E7EB] flex items-center justify-center text-emerald-500 group-hover/item:scale-110 group-hover/item:text-emerald-400 group-hover/item:border-emerald-500/30 transition-all shadow-md">
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-gray-900 font-bold text-[13px] sm:text-[15px] leading-tight group-hover/item:text-emerald-500 transition-colors">{feat.title}</h4>
                  <p className="text-[#4B5563] text-[10px] sm:text-[12px] mt-0.5 leading-tight">{feat.desc}</p>
                </div>
              </>
            );

            if (feat.link) {
              return (
                <a 
                  key={`dup-${idx}`} 
                  href={feat.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 sm:gap-4 group/item cursor-pointer shrink-0"
                >
                  {content}
                </a>
              );
            }

            return (
              <div key={`dup-${idx}`} className="flex items-center gap-3 sm:gap-4 group/item shrink-0">
                {content}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
