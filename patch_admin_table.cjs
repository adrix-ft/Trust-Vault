const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
`                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Categories</th>
                  <th className="p-4 font-medium text-right">Actions</th>`,
`                  <th className="p-4 font-medium">Title</th>
                  <th className="p-4 font-medium">Price</th>
                  <th className="p-4 font-medium">Categories</th>
                  <th className="p-4 font-medium text-center">Featured (Hero/Promo)</th>
                  <th className="p-4 font-medium text-right">Actions</th>`
);

content = content.replace(
`                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {game.categories?.map(cat => (
                          <span key={cat} className="bg-[#253745] text-[#9BA8AB] text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-right">`,
`                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {game.categories?.map(cat => (
                          <span key={cat} className="bg-[#253745] text-[#9BA8AB] text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-wider whitespace-nowrap">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <label className="flex items-center gap-1 cursor-pointer" title="Show in Top Featured Carousel">
                          <input 
                            type="checkbox" 
                            checked={game.showInHero || false} 
                            onChange={(e) => updateGame(game.title, { ...game, showInHero: e.target.checked })}
                            className="w-3 h-3"
                          />
                          <span className="text-[10px] text-[#9BA8AB] uppercase tracking-wider">Hero</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer" title="Featured Trailer Game">
                          <input 
                            type="checkbox" 
                            checked={game.isFeaturedPromo || false} 
                            onChange={(e) => updateGame(game.title, { ...game, isFeaturedPromo: e.target.checked })}
                            className="w-3 h-3"
                          />
                          <span className="text-[10px] text-[#9BA8AB] uppercase tracking-wider">Promo</span>
                        </label>
                      </div>
                    </td>
                    <td className="p-4 text-right">`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
