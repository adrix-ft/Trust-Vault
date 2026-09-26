const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
content = content.replace(
`{['Store', 'Top Sellers', 'Upcoming', 'Collections', 'PC', 'PS5'].map(cat => (`,
`{['Store', 'Top Sellers', 'Popular Games', 'Upcoming', 'Collections', 'PC', 'PS5'].map(cat => (`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
