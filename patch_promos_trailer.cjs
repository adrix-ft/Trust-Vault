const fs = require('fs');
let content = fs.readFileSync('src/components/Promos.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog, platformFilter } = useStore();
  
  const filteredCatalog = catalog.filter(game => {
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });
  
  const promoGames = filteredCatalog.slice(0, 4);`,
`  const { addToCart, catalog, platformFilter, setPlayingTrailerUrl } = useStore();
  
  const filteredCatalog = catalog.filter(game => {
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });
  
  let promoGames = filteredCatalog.filter(game => game.isFeaturedPromo);
  if (promoGames.length === 0) {
    promoGames = filteredCatalog.slice(0, 4);
  } else if (promoGames.length < 4) {
    const additional = filteredCatalog.filter(game => !game.isFeaturedPromo).slice(0, 4 - promoGames.length);
    promoGames = [...promoGames, ...additional];
  }
  `
);

content = content.replace(
`            <div className="w-14 h-14 bg-[#CCD0CF] backdrop-blur rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(204,208,207,0.1)] group-hover:scale-110 transition-all cursor-pointer pointer-events-auto mt-4 z-10">
              <Play className="w-5 h-5 text-[#06141B] ml-1" fill="currentColor" />
            </div>`,
`            <div 
              onClick={(e) => {
                e.stopPropagation();
                if (activePromo.trailerUrl) {
                  setPlayingTrailerUrl(activePromo.trailerUrl);
                } else {
                  alert('Trailer coming soon for ' + activePromo.title);
                }
              }}
              className="w-14 h-14 bg-[#CCD0CF] backdrop-blur rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(204,208,207,0.1)] group-hover:scale-110 transition-all cursor-pointer pointer-events-auto mt-4 z-10"
            >
              <Play className="w-5 h-5 text-[#06141B] ml-1" fill="currentColor" />
            </div>`
);

fs.writeFileSync('src/components/Promos.tsx', content);
