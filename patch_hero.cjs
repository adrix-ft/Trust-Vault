const fs = require('fs');

let content = fs.readFileSync('src/components/Hero.tsx', 'utf8');
content = content.replace(
`  // Use top 5 games for Hero, prioritize trending/onSale
  const heroGames = [...catalog].sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0)).slice(0, 5);`,
`  // Use top 5 games for Hero, prioritize trending/onSale
  let heroGames = catalog.filter(game => game.showInHero);
  if (heroGames.length === 0) {
    heroGames = [...catalog].sort((a, b) => (b.onSale ? 1 : 0) - (a.onSale ? 1 : 0)).slice(0, 5);
  }`
);

fs.writeFileSync('src/components/Hero.tsx', content);
