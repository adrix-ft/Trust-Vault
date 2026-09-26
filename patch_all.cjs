const fs = require('fs');

let nav = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
nav = nav.replace(
    `const navLinks = ['Store', 'Top Sellers', 'Upcoming', 'Popular Games', 'Collections'];`,
    `const navLinks = ['Store', 'Top Sellers', 'Popular games', 'Upcoming', 'Collections'];`
);
fs.writeFileSync('src/components/Navbar.tsx', nav);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(
    `{selectedCategory === 'Popular Games' && (`,
    `{selectedCategory === 'Popular games' && (`
).replace(
    `category="Popular Games"`,
    `category="Popular games"`
);
fs.writeFileSync('src/App.tsx', app);

let admin = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
admin = admin.replace(
    `{['Store', 'Top Sellers', 'Upcoming', 'Popular Games', 'Collections', 'PC', 'PS5'].map(cat => (`,
    `{['Store', 'Top Sellers', 'Popular games', 'Upcoming', 'Collections', 'PC', 'PS5'].map(cat => (`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', admin);

let games = fs.readFileSync('src/data/games.ts', 'utf8');
// The games that I mistakenly changed to Upcoming should be Popular games. 
// Note: only the 12 games at the bottom should be Popular games.
games = games.replace(/{ title: "Silent Hill f", price: "199Rs", categories: \["Store", "Upcoming"\] },/g, '{ title: "Silent Hill f", price: "199Rs", categories: ["Store", "Popular games"] },')
.replace(/"Upcoming"\] \}/g, '"Popular games"] }')
.replace(/"Store", "Popular games"\] \}\n\];/g, '"Store", "Popular games"] }\n];');
fs.writeFileSync('src/data/games.ts', games);

