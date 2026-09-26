const fs = require('fs');
const path = require('path');

const dir = 'public/assets/images';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (!file.endsWith('.jpg')) return;
  const title = file.replace('.jpg', '');
  const newName = title
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-") + '.jpg';
  
  fs.renameSync(path.join(dir, file), path.join(dir, newName));
  console.log(`Renamed "${file}" to "${newName}"`);
});
