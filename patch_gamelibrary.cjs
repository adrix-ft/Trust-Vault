const fs = require('fs');
let content = fs.readFileSync('src/components/GameLibrary.tsx', 'utf8');

content = content.replace(
`  const { selectedCategory, addToCart, cart, catalog } = useStore();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const filteredGames = catalog.filter(game => game.categories?.includes(selectedCategory));`,
`  const { selectedCategory, addToCart, cart, catalog, platformFilter } = useStore();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  const filteredGames = catalog.filter(game => {
    if (!game.categories?.includes(selectedCategory)) return false;
    if (platformFilter !== 'All' && !game.categories?.includes(platformFilter)) return false;
    return true;
  });`
);
fs.writeFileSync('src/components/GameLibrary.tsx', content);
