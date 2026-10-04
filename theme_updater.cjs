const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = {
  '#06141B': '#F9FAFB', // Darkest bg -> Lightest bg (Gray 50)
  '#11212D': '#FFFFFF', // Card bg -> White
  '#253745': '#E5E7EB', // Borders -> Gray 200
  '#4A5C6A': '#D1D5DB', // Light Borders -> Gray 300
  '#CCD0CF': '#1F2937', // Light Text -> Dark Text (Gray 800)
  '#9BA8AB': '#4B5563', // Muted Text -> Gray 600
};

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const fileLoc = path.join(dir, file);
    const stat = fs.statSync(fileLoc);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fileLoc));
    } else {
      if (fileLoc.endsWith('.tsx') || fileLoc.endsWith('.ts') || fileLoc.endsWith('.css')) {
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
  let newContent = content;
  
  for (const [dark, light] of Object.entries(replacements)) {
    // We use a global regex with ignore case to catch #06141B and #06141b
    const regex = new RegExp(dark, 'gi');
    newContent = newContent.replace(regex, light);
  }

  // Handle text-white where the background is now light. 
  // This is tricky, but let's replace `text-white` with `text-gray-900` globally EXCEPT if it's on a button with a green/emerald/blue background.
  // Actually, wait, doing global text-white replace is risky. Let's just stick to the hex codes first.

  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log(`Updated ${file}`);
  }
});

console.log(`\nCompleted replacing colors in ${changedCount} files.`);
