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
    <section className="w-full bg-[#11212D] border border-[#253745] rounded-2xl py-4 px-4 sm:px-6 lg:px-8 shadow-xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 lg:divide-x divide-[#253745] lg:divide-dashed">
        {features.map((feat, idx) => {
          const Icon = feat.icon;
          const content = (
            <>
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#06141B] border border-[#253745] flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:text-emerald-300 group-hover:border-emerald-500/30 transition-all shadow-md">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <h4 className="text-white font-bold text-[15px] group-hover:text-emerald-400 transition-colors">{feat.title}</h4>
                <p className="text-[#9BA8AB] text-[12px] mt-0.5">{feat.desc}</p>
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
                className="flex items-center gap-4 lg:justify-center px-2 lg:px-6 group cursor-pointer"
              >
                {content}
              </a>
            );
          }

          return (
            <div key={idx} className="flex items-center gap-4 lg:justify-center px-2 lg:px-6 group">
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
