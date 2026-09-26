const fs = require('fs');
let content = fs.readFileSync('src/components/HotTrends.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog } = useStore();
  
  // Pick 5 games for the trending section (e.g. from Top Sellers or just first 5)
  // Give priority to games marked as onSale/Trending
  const trendingGames = [...catalog].sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0)).slice(0, 5);`,
`  const { addToCart, catalog, platformFilter } = useStore();
  
  // Filter by platform first
  const filteredCatalog = catalog.filter(game => {
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });

  // Pick 5 games for the trending section (e.g. from Top Sellers or just first 5)
  // Give priority to games marked as onSale/Trending
  const trendingGames = [...filteredCatalog].sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0)).slice(0, 5);`
);

fs.writeFileSync('src/components/HotTrends.tsx', content);
