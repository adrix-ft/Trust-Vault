const fs = require('fs');
let content = fs.readFileSync('src/components/FilteredGames.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog } = useStore();
  const games = catalog.filter(game => game.categories?.includes(category));`,
`  const { addToCart, catalog, platformFilter } = useStore();
  const games = catalog.filter(game => {
    if (!game.categories?.includes(category)) return false;
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });`
);
fs.writeFileSync('src/components/FilteredGames.tsx', content);
