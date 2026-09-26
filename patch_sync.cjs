const fs = require('fs');

let content = fs.readFileSync('src/context/StoreContext.tsx', 'utf8');
content = content.replace(
`      // 1. Audit and add missing games from MASTER_CATALOG
      for (const masterGame of MASTER_CATALOG) {
        if (!updatedCatalog.some(g => g.title === masterGame.title)) {
          updatedCatalog.push(masterGame);
          changed = true;
        }
      }`,
`      // 1. Audit and add missing games from MASTER_CATALOG, and update categories if they differ
      for (const masterGame of MASTER_CATALOG) {
        const existingIdx = updatedCatalog.findIndex(g => g.title === masterGame.title);
        if (existingIdx === -1) {
          updatedCatalog.push(masterGame);
          changed = true;
        } else {
          const existing = updatedCatalog[existingIdx];
          // Force sync categories for master games to ensure updates to games.ts reflect
          if (JSON.stringify(existing.categories) !== JSON.stringify(masterGame.categories)) {
             updatedCatalog[existingIdx] = { ...existing, categories: masterGame.categories };
             changed = true;
          }
        }
      }`
);

fs.writeFileSync('src/context/StoreContext.tsx', content);
