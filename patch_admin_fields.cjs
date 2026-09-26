const fs = require('fs');

let content = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');
content = content.replace(
`                    <div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Description / Details</label>
                      <textarea 
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#06141B] border border-[#253745] rounded p-3 text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] min-h-[100px]"
                        placeholder="Game description..."
                      />
                    </div>`,
`                    <div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Description / Details</label>
                      <textarea 
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-[#06141B] border border-[#253745] rounded p-3 text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A] min-h-[100px]"
                        placeholder="Game description..."
                      />
                    </div>
                    <div>
                      <label className="block text-[#9BA8AB] text-xs font-bold mb-2 uppercase">Trailer Video URL</label>
                      <input 
                        type="text" 
                        value={formData.trailerUrl || ''}
                        onChange={e => setFormData({...formData, trailerUrl: e.target.value})}
                        className="w-full bg-[#06141B] border border-[#253745] rounded p-3 text-[#CCD0CF] focus:outline-none focus:border-[#4A5C6A]"
                        placeholder="YouTube URL or MP4 link"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label className="flex items-center gap-2 text-[#CCD0CF] cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={formData.showInHero || false}
                          onChange={e => setFormData({...formData, showInHero: e.target.checked})}
                          className="w-4 h-4 bg-[#06141B] border border-[#253745] rounded"
                        />
                        <span className="text-sm font-bold uppercase tracking-wider">Show in Top Featured Carousel</span>
                      </label>
                      <label className="flex items-center gap-2 text-[#CCD0CF] cursor-pointer">
                        <input 
                          type="checkbox"
                          checked={formData.isFeaturedPromo || false}
                          onChange={e => setFormData({...formData, isFeaturedPromo: e.target.checked})}
                          className="w-4 h-4 bg-[#06141B] border border-[#253745] rounded"
                        />
                        <span className="text-sm font-bold uppercase tracking-wider">Featured Trailer Game</span>
                      </label>
                    </div>`
);

fs.writeFileSync('src/components/AdminDashboard.tsx', content);
