const fs = require('fs');
let content = fs.readFileSync('src/components/Promos.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog } = useStore();
  
  const promoGames = catalog.slice(0, 4);`,
`  const { addToCart, catalog, platformFilter } = useStore();
  
  const filteredCatalog = catalog.filter(game => {
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });
  
  const promoGames = filteredCatalog.slice(0, 4);`
);
fs.writeFileSync('src/components/Promos.tsx', content);
