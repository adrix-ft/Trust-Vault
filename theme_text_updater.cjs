const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileLoc = path.join(dir, file);
    const stat = fs.statSync(fileLoc);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fileLoc));
    } else {
      if (fileLoc.endsWith('.tsx') || fileLoc.endsWith('.ts')) {
        results.push(fileLoc);
      }
    }
  });
  return results;
}

const files = walkDir(srcDir);
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let lines = content.split('\n');
  let newLines = lines.map(line => {
    // If the line contains a prominent background color, don't change text-white
    if (line.match(/bg-(emerald|blue|red|green|indigo|purple|pink|yellow|orange)-/)) {
      return line;
    }
    // Also avoid changing text-white if it's explicitly a primary CTA
    if (line.includes('bg-gradient-to-r')) {
      return line;
    }
    return line.replace(/text-white/g, 'text-gray-900');
  });

  let newContent = newLines.join('\n');
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nCompleted replacing text-white in ${changedCount} files.`);
