const fs = require('fs');
let content = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
content = content.replace(
    `const navLinks = ['Store', 'Top Sellers', 'Popular Games', 'Upcoming', 'Collections'];`,
    `const navLinks = ['Store', 'Top Sellers', 'Upcoming', 'Popular Games', 'Collections'];`
);
fs.writeFileSync('src/components/Navbar.tsx', content);
