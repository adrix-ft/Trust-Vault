const fs = require('fs');
let content = fs.readFileSync('src/components/Discounts.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog } = useStore();
  
  const discountGames = catalog.filter(game => game.onSale);`,
`  const { addToCart, catalog, platformFilter } = useStore();
  
  const discountGames = catalog.filter(game => {
    if (!game.onSale) return false;
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });`
);
fs.writeFileSync('src/components/Discounts.tsx', content);
