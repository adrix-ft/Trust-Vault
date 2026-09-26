const fs = require('fs');

let games = `import { Game } from '../context/StoreContext';

export const MASTER_CATALOG: Game[] = [
  { title: "GTA V", price: "199Rs", originalPrice: "349Rs", onSale: true, categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "God of War Ragnarök", price: "199Rs", originalPrice: "399Rs", onSale: true, categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "Ghost of Tsushima", price: "199Rs", categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "Spider-Man Remastered", price: "99Rs", categories: ["Store", "Collections"] },
  { title: "Spider-Man Miles Morales", price: "99Rs", categories: ["Store", "Collections"] },
  { title: "Spider-Man 2", price: "199Rs", originalPrice: "349Rs", onSale: true, categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "Black Myth Wukong", price: "199Rs", originalPrice: "399Rs", onSale: true, categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "The Last of Us Part I", price: "149Rs", categories: ["Store", "Collections"] },
  { title: "The Last of Us Part II Remastered", price: "199Rs", categories: ["Store", "Collections"] },
  { title: "Resident Evil 4 Remake", price: "199Rs", categories: ["Store", "Top Sellers"] },
  { title: "Resident Evil Requiem", price: "149Rs", categories: ["Store", "Collections"] },
  { title: "Dead Space Remake", price: "149Rs", categories: ["Store", "Collections"] },
  { title: "Horizon Zero Dawn", price: "99Rs", categories: ["Store", "Collections"] },
  { title: "Horizon Forbidden West", price: "149Rs", categories: ["Store", "Collections"] },
  { title: "Assassin’s Creed Mirage", price: "149Rs", categories: ["Store", "Collections"] },
  { title: "Assassin’s Creed Valhalla", price: "99Rs", categories: ["Store", "Collections"] },
  { title: "Cyberpunk 2077 Phantom Liberty", price: "199Rs", originalPrice: "299Rs", onSale: true, categories: ["Store", "Popular games"] },
  { title: "Elden Ring Shadow of the Erdtree", price: "199Rs", originalPrice: "299Rs", onSale: true, categories: ["Store", "Top Sellers", "Popular games"] },
  { title: "Silent Hill f", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Assassin’s Creed Shadows", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Doom The Dark Ages", price: "249Rs", categories: ["Store", "Popular games"] },
  { title: "Elden Ring Nightreign", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "FC 26", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Cricket 26", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Mafia", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Kingdom Come Deliverance", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Dying Light The Beast", price: "149Rs", categories: ["Store", "Popular games"] },
  { title: "Pragmata", price: "199Rs", categories: ["Store", "Popular games"] },
  { title: "Battlefield 6", price: "249Rs", categories: ["Store", "Popular games"] },
  { title: "Hollow Knight Silksong", price: "149Rs", categories: ["Store", "Popular games"] }
];

export const gamesList = [...MASTER_CATALOG];
`;

fs.writeFileSync('src/data/games.ts', games);
