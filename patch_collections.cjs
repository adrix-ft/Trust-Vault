const fs = require('fs');
let content = fs.readFileSync('src/components/CollectionsView.tsx', 'utf8');

content = content.replace(
`  const { addToCart, catalog } = useStore();`,
`  const { addToCart, catalog, platformFilter } = useStore();`
);

content = content.replace(
`          const collectionGames = catalog.filter(game => 
            collection.keywords.some(kw => game.title.includes(kw))
          );`,
`          const collectionGames = catalog.filter(game => {
            if (!collection.keywords.some(kw => game.title.includes(kw))) return false;
            if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
            return true;
          });`
);
fs.writeFileSync('src/components/CollectionsView.tsx', content);
