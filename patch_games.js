const fs = require('fs');
let content = fs.readFileSync('src/data/games.ts', 'utf8');
content = content.replace(/"Popular Games"/g, '"Upcoming"');
fs.writeFileSync('src/data/games.ts', content);
