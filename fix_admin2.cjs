const fs = require('fs');
let c = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

c = c.replace(/\s*\)\}\r?\n/g, '\n');

fs.writeFileSync('src/components/AdminDashboard.tsx', c);
console.log("Fixed syntax");
