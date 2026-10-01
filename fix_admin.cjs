const fs = require('fs');

let c = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

// Remove state declaration
c = c.replace(/const \[activeFormTab, setActiveFormTab\] = useState.*?;/g, '');

// Remove tabs UI
const tabsUI = `<div className="flex border-b border-[#253745] mb-2 overflow-x-auto no-scrollbar">
                      {['basic', 'media', 'pricing', 'tags'].map(tab => (
                        <button
                          key={tab}
                          type="button"
                          onClick={() => setActiveFormTab(tab as any)}
                          className={\`px-3 py-2 text-xs font-bold uppercase transition-colors border-b-2 whitespace-nowrap \${activeFormTab === tab ? 'text-white border-cyan-500' : 'text-[#4A5C6A] border-transparent hover:text-[#9BA8AB]'}\`}
                        >
                          {tab === 'basic' ? 'Basic Info' : tab === 'media' ? 'Media' : tab === 'pricing' ? 'Pricing & Rent' : 'Tags & Variants'}
                        </button>
                      ))}
                    </div>`;
c = c.replace(tabsUI, '');

// The blocks start with `{activeFormTab === 'xyz' && (` and end with `)}`
// Since `)}` is at a specific indentation level, we can use exact string replacements

c = c.replace("{activeFormTab === 'basic' && (", "");
c = c.replace("{activeFormTab === 'media' && (", "");
c = c.replace("{activeFormTab === 'pricing' && (", "");
c = c.replace("{activeFormTab === 'tags' && (", "");

// There are 4 `)}` that we need to remove. They follow the `</div>` of each section.
// Let's replace the first 4 occurrences of `                  )}` or just use line numbers.
// A safe way: `c = c.replace(/\n\s*\)\}\n/g, '\n');` will just remove `)}` when they are on their own line.
c = c.replace(/\n\s*\)\}\n/g, '\n');

fs.writeFileSync('src/components/AdminDashboard.tsx', c);
console.log("Replaced successfully");
