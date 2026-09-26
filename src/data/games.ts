import { Game } from '../context/StoreContext';

export const MASTER_CATALOG: Game[] = [
  { title: "GTA V", price: "199Rs", genre: "Action-Adventure", categories: ["Store", "PC"], isRentable: true, rentPrice: "99Rs" },
  { title: "God of War Ragnarök", price: "199Rs", originalPrice: "399Rs", onSale: true, genre: "Action-Adventure", categories: ["Store", "Top Sellers", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Ghost of Tsushima", price: "199Rs", genre: "Action-Adventure", categories: ["Store", "Top Sellers", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Spider-Man Remastered", price: "99Rs", genre: "Action", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "49Rs" },
  { title: "Spider-Man Miles Morales", price: "99Rs", genre: "Action", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "49Rs" },
  { title: "Spider-Man 2", price: "199Rs", originalPrice: "349Rs", onSale: true, genre: "Action", categories: ["Store", "Top Sellers", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Black Myth Wukong", price: "199Rs", originalPrice: "399Rs", onSale: true, genre: "Action RPG", categories: ["Store", "Top Sellers", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "The Last of Us Part I", price: "149Rs", genre: "Action-Adventure", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "79Rs" },
  { title: "The Last of Us Part II Remastered", price: "199Rs", genre: "Action-Adventure", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Resident Evil 4 Remake", price: "199Rs", genre: "Survival Horror", categories: ["Store", "Top Sellers", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Resident Evil Requiem", price: "149Rs", genre: "Survival Horror", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "79Rs" },
  { title: "Dead Space Remake", price: "149Rs", genre: "Sci-Fi Horror", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "79Rs" },
  { title: "Horizon Zero Dawn", price: "99Rs", genre: "Action RPG", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "49Rs" },
  { title: "Horizon Forbidden West", price: "149Rs", genre: "Action RPG", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "79Rs" },
  { title: "Assassin’s Creed Mirage", price: "149Rs", genre: "Stealth Action", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "79Rs" },
  { title: "Assassin’s Creed Valhalla", price: "99Rs", genre: "Action RPG", categories: ["Store", "Collections", "PC", "PS5"], isRentable: true, rentPrice: "49Rs" },
  { title: "Cyberpunk 2077 Phantom Liberty", price: "199Rs", originalPrice: "299Rs", onSale: true, genre: "Action RPG", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Elden Ring Shadow of the Erdtree", price: "199Rs", originalPrice: "299Rs", onSale: true, genre: "Action RPG", categories: ["Store", "Top Sellers", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Silent Hill f", price: "199Rs", genre: "Psychological Horror", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Assassin’s Creed Shadows", price: "199Rs", genre: "Stealth Action", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Doom The Dark Ages", price: "249Rs", genre: "First-Person Shooter", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "129Rs" },
  { title: "Elden Ring Nightreign", price: "199Rs", genre: "Action RPG", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "FC 26", price: "199Rs", genre: "Sports", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Cricket 26", price: "199Rs", genre: "Sports", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Mafia", price: "199Rs", genre: "Action-Adventure", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "99Rs" },
  { title: "Kingdom Come Deliverance", price: "199Rs", genre: "Action RPG", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "99Rs" },
  { title: "Dying Light The Beast", price: "149Rs", genre: "Survival Horror", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "79Rs" },
  { title: "Pragmata", price: "199Rs", genre: "Action-Adventure", categories: ["Store", "Popular games", "PC", "PS5"], isRentable: true, rentPrice: "99Rs" },
  { title: "Battlefield 6", price: "249Rs", genre: "First-Person Shooter", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "129Rs" },
  { title: "Hollow Knight Silksong", price: "149Rs", genre: "Metroidvania", categories: ["Store", "Popular games", "PC"], isRentable: true, rentPrice: "79Rs" }
];

export const gamesList = [...MASTER_CATALOG];