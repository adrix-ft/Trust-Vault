const fs = require('fs');

const ps5Titles = [
  "God of War Ragnarök",
  "Ghost of Tsushima",
  "Spider-Man Remastered",
  "Spider-Man Miles Morales",
  "Spider-Man 2",
  "Black Myth Wukong",
  "The Last of Us Part I",
  "The Last of Us Part II Remastered",
  "Resident Evil 4 Remake",
  "Resident Evil Requiem",
  "Silent Hill f",
  "Dead Space Remake",
  "Horizon Zero Dawn",
  "Horizon Forbidden West",
  "Assassin’s Creed Mirage",
  "Assassin’s Creed Shadows",
  "Assassin’s Creed Valhalla",
  "Cyberpunk 2077 Phantom Liberty",
  "Elden Ring Shadow of the Erdtree",
  "Elden Ring Nightreign",
  "FC 26",
  "Cricket 26",
  "Pragmata"
];

let content = fs.readFileSync('src/data/games.ts', 'utf8');

// First parse the content to array
// Because we have it exactly formatted, we can use regex to replace categories array
let lines = content.split('\n');
let modifiedLines = lines.map(line => {
  let match = line.match(/{ title: "(.*?)",.*categories: \[(.*?)\]/);
  if (match) {
    let title = match[1];
    let catStr = match[2];
    
    // Parse categories from string
    let cats = catStr.split(',').map(s => s.trim().replace(/"/g, ''));
    
    // Remove "Upcoming" if present
    cats = cats.filter(c => c !== 'Upcoming');
    
    // Add PC to all games
    if (!cats.includes('PC')) cats.push('PC');
    
    // Add PS5 to specific games
    if (ps5Titles.includes(title) && !cats.includes('PS5')) {
      cats.push('PS5');
    }
    
    let newCatStr = cats.map(c => '"' + c + '"').join(', ');
    return line.replace(`categories: [${catStr}]`, `categories: [${newCatStr}]`);
  }
  return line;
});

fs.writeFileSync('src/data/games.ts', modifiedLines.join('\n'));

