import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

const target = `{selectedCategory === 'Top Sellers' && (
            <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
              <FilteredGames category="Top Sellers" title="TOP SELLERS" />
            </main>
          )}
          {selectedCategory === 'Upcoming' && (
            <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
              <FilteredGames category="Upcoming" title="UPCOMING & WISHLIST" actionType="preorder" />
            </main>
          )}`;

const replacement = `{selectedCategory === 'Top Sellers' && (
            <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
              <FilteredGames category="Top Sellers" title="TOP SELLERS" />
            </main>
          )}
          {selectedCategory === 'Popular Games' && (
            <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
              <FilteredGames category="Popular Games" title="POPULAR GAMES" />
            </main>
          )}
          {selectedCategory === 'Upcoming' && (
            <main className="w-full mx-auto px-4 sm:px-6 lg:px-12 xl:px-24 py-12 relative z-10">
              <FilteredGames category="Upcoming" title="UPCOMING" actionType="preorder" />
            </main>
          )}`;

// using regex for whitespaces
const regexPattern = target.replace(/\s+/g, '\\s*').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const regex = new RegExp(regexPattern.replace(/\\s\*/g, '\\s+'));
if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync('src/App.tsx', content);
    console.log("Success");
} else {
    console.log("Could not find match");
}
