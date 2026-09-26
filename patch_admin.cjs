const fs = require('fs');
let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

content = content.replace(
`                    <div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {['Store', 'Top Sellers', 'Popular games', 'Upcoming', 'Collections', 'PC', 'PS5'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className={\`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase border transition-colors \${
                              formData.categories?.includes(cat) 
                                ? 'bg-[#4A5C6A] border-[#4A5C6A] text-white shadow-md' 
                                : 'bg-[#06141B] border-[#253745] text-[#9BA8AB] hover:border-[#4A5C6A]'
                            }\`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>`,
`                    <div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Platforms</label>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {['PC', 'PS5'].map(plat => (
                          <button
                            key={plat}
                            type="button"
                            onClick={() => handleCategoryToggle(plat)}
                            className={\`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase border transition-colors \${
                              formData.categories?.includes(plat) 
                                ? 'bg-[#CCD0CF] border-[#CCD0CF] text-[#06141B] shadow-[0_0_10px_rgba(204,208,207,0.3)]' 
                                : 'bg-[#06141B] border-[#253745] text-[#9BA8AB] hover:border-[#4A5C6A]'
                            }\`}
                          >
                            {plat}
                          </button>
                        ))}
                      </div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {['Store', 'Top Sellers', 'Popular games', 'Upcoming', 'Collections'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleCategoryToggle(cat)}
                            className={\`px-3 py-1.5 rounded text-xs font-bold tracking-wider uppercase border transition-colors \${
                              formData.categories?.includes(cat) 
                                ? 'bg-[#4A5C6A] border-[#4A5C6A] text-white shadow-md' 
                                : 'bg-[#06141B] border-[#253745] text-[#9BA8AB] hover:border-[#4A5C6A]'
                            }\`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>`
);
fs.writeFileSync('src/components/AdminDashboard.tsx', content);
