
import fs from 'fs/promises';
import path from 'path';

// Just make direct calls to the running backend on port 5000
const API_BASE = 'http://localhost:5000/api';
const gameExtraPath = path.join(process.cwd(), 'game_extra.json');

async function main() {
  console.log("Fetching products from backend API...");
  const res = await fetch(`${API_BASE}/products`);
  const products = await res.json();
  
  if (!Array.isArray(products)) {
    console.error("Failed to fetch products array", products);
    return;
  }

  console.log(`Found ${products.length} games.`);
  
  let extraData = {};
  try {
    const raw = await fs.readFile(gameExtraPath, 'utf8');
    extraData = JSON.parse(raw);
  } catch (err) {
    console.log("No game_extra.json found.");
  }

  let pcGames = [];
  let updatedCount = 0;

  for (let i = 0; i < products.length; i++) {
    const game = products[i];
    
    // Check if it's a PC game
    const isPC = game.categories && game.categories.some(c => c.toUpperCase() === 'PC' || c.toUpperCase() === 'STEAM');
    if (!isPC) continue;
    
    pcGames.push(game);
    
    // Skip if already has releaseDate
    if (extraData[game.title] && extraData[game.title].releaseDate) continue;

    console.log(`[${i+1}/${products.length}] Searching Steam for: ${game.title}...`);
    try {
      const searchRes = await fetch(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(game.title)}&l=english&cc=US`);
      const searchData = await searchRes.json();

      if (searchData && searchData.items && searchData.items.length > 0) {
        const appid = searchData.items[0].id;
        const detailRes = await fetch(`https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`);
        const detailData = await detailRes.json();

        if (detailData && detailData[appid] && detailData[appid].success) {
          const releaseDate = detailData[appid].data.release_date?.date;
          if (releaseDate) {
            console.log(`  -> Found release date: ${releaseDate}`);
            if (!extraData[game.title]) extraData[game.title] = {};
            extraData[game.title].releaseDate = releaseDate;
            updatedCount++;
            
            if (updatedCount % 5 === 0) {
              await fs.writeFile(gameExtraPath, JSON.stringify(extraData, null, 2));
            }
          } else {
             console.log(`  -> No release date field in Steam data`);
          }
        }
      } else {
        console.log(`  -> Not found on Steam`);
      }
    } catch (e) {
      console.log(`  -> Error fetching data:`, e.message);
    }
    
    // Sleep to avoid Steam rate limits
    await new Promise(r => setTimeout(r, 2000));
  }
  
  await fs.writeFile(gameExtraPath, JSON.stringify(extraData, null, 2));
  console.log(`Finished updating release dates. Added ${updatedCount} dates.`);
  
  // NOTE: Restarting the node backend via nodemon might happen when we save game_extra.json!
  // Wait a sec for nodemon to finish.
  await new Promise(r => setTimeout(r, 2000));
}

main().catch(console.error);
