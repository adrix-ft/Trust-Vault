import React from 'react';
import { useStore } from '../context/StoreContext';

export default function PlatformTags({ platforms, tagColors, className }: { platforms?: string[], tagColors?: Record<string, string>, className?: string }) {
  const { globalTagColors } = useStore();
  
  if (!platforms) return null;
  const isPC = platforms.some(p => p.toUpperCase() === 'PC' || p.toUpperCase() === 'STEAM');
  const isPS5 = platforms.some(p => p.toUpperCase() === 'PS5');
  const isPS4 = platforms.some(p => p.toUpperCase() === 'PS4');
  const isXbox = platforms.some(p => p.toUpperCase().includes('XBOX'));

  // If there's a generic PS tag but no PS4 or PS5
  const isGenericPS = platforms.some(p => p.toUpperCase() === 'PS') && !isPS4 && !isPS5;

  // Extract non-platform custom tags
  const knownPlatformTags = ['PC', 'STEAM', 'PS5', 'PS4', 'XBOX', 'PS', 'BUNDLE-ELIGIBLE', 'STORE'];
  const customTags = platforms.filter(p => !knownPlatformTags.includes(p.toUpperCase()));

  return (
    <div className={className || "absolute top-1.5 right-1.5 md:top-2 md:right-2 flex flex-col items-end gap-1.5 z-20 max-w-[90%]"}>
      <div className="flex flex-wrap justify-end gap-1">
      {isPS5 && (
        <span className="bg-white text-black px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm shadow-md flex items-center justify-center">
          <svg viewBox="0 9.2 24 5.6" className="h-[7px] md:h-[8px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.4499 14.56905a1.38287 1.38287 0 001.38287-1.38287v-2.37841a.83315.83315 0 01.83416-.83315h2.68403a.03732.03732 0 00.03631-.03732V9.4612a.03631.03631 0 00-.0363-.0363H12.1172a1.38287 1.38287 0 00-1.38388 1.38286v2.38043a.83416.83416 0 01-.83315.83415H7.25347a.03631.03631 0 00-.03631.03632v.47608a.03631.03631 0 00.03631.03631zm6.04488-3.21156V9.4612a.03631.03631 0 01.0363-.0363h7.30772a.03732.03732 0 01.03732.0363v.47609a.03833.03833 0 01-.03732.03732h-6.20929a.03631.03631 0 00-.0363.03631v1.2356a.3954.3954 0 00.3964.39741h4.62267a1.46457 1.46457 0 010 2.9251h-6.0812a.03631.03631 0 01-.0363-.0363v-.47407a.03631.03631 0 01.0363-.03632h5.53047a.91586.91586 0 10-.00706-1.8307h-4.72656a.83315.83315 0 01-.83315-.83416m-10.84608.28645a.83466.83466 0 000-1.66932H.03654a.03732.03732 0 01-.03632-.03732V9.4612a.03631.03631 0 01.03632-.0363h6.1528a1.38388 1.38388 0 010 2.76673H1.9328a.83315.83315 0 00-.83315.83416v1.51299a.03631.03631 0 01-.03631.0363H.03654a.03631.03631 0 01-.03632-.04034v-1.51298a1.38287 1.38287 0 011.38388-1.37783Z"/>
          </svg>
        </span>
      )}
      {(isPS4 || isGenericPS) && (
        <span className="bg-black text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm shadow-md flex items-center justify-center border border-white/10">
          {isPS4 ? (
            <svg viewBox="0 9.2 24 5.6" className="h-[7px] md:h-[8px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.302 13.18v-2.387c0-.486.227-.834.712-.834h2.99c.017 0 .035-.018.035-.036v-.475c0-.004 0-.008-.003-.012h-3.66c-.792.1-1.18.653-1.18 1.357v2.386c0 .482-.233.831-.71.831H7.332c-.018 0-.036.012-.036.036v.475c0 .02.01.035.023.04h3.584c.933-.025 1.393-.62 1.393-1.385zM.024 14.564h1.05a.042.042 0 00.025-.04v-1.52c0-.487.275-.823.676-.823h4.323c.974 0 1.445-.6 1.445-1.384 0-.705-.386-1.257-1.18-1.357H.006c0 .003-.006.005-.006.01v.475c0 .024.013.036.037.036h5.697c.484 0 .712.35.712.833 0 .484-.227.836-.712.836H1.226c-.7 0-1.226.592-1.226 1.373v1.519c0 .02.01.036.028.04zm15.998-.55h5.738c.017 0 .03.012.03.024v.483c0 .024.017.036.035.036h1.035c.018 0 .036-.01.036-.036v-.475c0-.018.02-.036.04-.036h1.028c.024 0 .036-.018.036-.036v-.484c0-.018-.01-.036-.035-.036h-1.03c-.02 0-.037-.017-.037-.035V9.96c0-.283-.104-.463-.28-.523h-.3a1.153 1.153 0 00-.303.132l-6.18 3.815c-.24.15-.323.318-.263.445.048.104.185.182.454.182zm.895-.637l4.79-2.961c.03-.024.09-.018.09.048v2.961c0 .018-.016.036-.034.036h-4.817c-.04 0-.06-.012-.065-.024-.006-.024.005-.042.036-.06z"/>
            </svg>
          ) : (
            <span className="text-[7.5px] md:text-[8px] font-black tracking-wider">PS</span>
          )}
        </span>
      )}
      {isPC && (
        <span className="bg-[#1b2838] text-[#66c0f4] px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm shadow-md flex items-center justify-center border border-[#66c0f4]/20" title="Steam">
          <div className="flex items-center gap-1">
            <svg viewBox="0 0 24 24" className="h-[8px] md:h-[9px] w-auto fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>
            </svg>
            <span className="font-black tracking-widest text-[7.5px] md:text-[8px]">STEAM</span>
          </div>
        </span>
      )}
      {isXbox && (
        <span className="bg-green-600 text-white px-1.5 py-0.5 md:px-2 md:py-1 rounded-sm shadow-md flex items-center justify-center">
          <span className="text-[7.5px] md:text-[8px] font-black tracking-wider">XBOX</span>
        </span>
      )}
      </div>
      
      {customTags && customTags.length > 0 && (
        <div className="flex flex-wrap justify-end gap-1.5 mt-0.5">
          {customTags.map((tag, idx) => {
            const tagKey = Object.keys(tagColors || {}).find(k => k.toUpperCase() === tag.toUpperCase());
            const globalTagKey = Object.keys(globalTagColors || {}).find(k => k.toUpperCase() === tag.toUpperCase());
            const customColor = tagKey ? tagColors?.[tagKey] : (globalTagKey ? globalTagColors?.[globalTagKey] : undefined);
            const hasCustomColor = !!customColor;
            
            return (
              <span key={idx} 
                className={`font-black text-[9px] md:text-[10px] uppercase tracking-widest border-[1.5px] rounded-full px-2.5 py-0.5 backdrop-blur-sm ${hasCustomColor ? '' : 'bg-cyan-50 text-cyan-700 border-cyan-300 shadow-sm'}`}
                style={hasCustomColor ? { 
                  backgroundColor: `${customColor}15`, 
                  color: customColor, 
                  borderColor: customColor,
                  boxShadow: `0 2px 4px ${customColor}20` 
                } : undefined}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
