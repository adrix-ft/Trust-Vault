const fs = require('fs');
let content = fs.readFileSync('backend/server.js', 'utf8');

const helpers = `
// ==================== SETTINGS WRAPPER (SUPABASE) ====================
async function getSetting(key, defaultVal, filePath) {
  try {
    const { data, error } = await supabase.from('store_settings').select('value').eq('id', key).single();
    if (error) throw error;
    if (data) return data.value;
  } catch (err) {
    try {
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch(e) {}
  }
  return defaultVal;
}

async function setSetting(key, val, filePath) {
  try {
    const { error } = await supabase.from('store_settings').upsert({ id: key, value: val });
    if (error) throw error;
  } catch (err) {
    try {
      fs.writeFileSync(filePath, JSON.stringify(val, null, 2), 'utf8');
    } catch(e) {}
  }
}
`;

if (!content.includes('getSetting(')) {
  content = content.replace('// ==================== PRODUCTS ENDPOINTS ====================', helpers + '\n// ==================== PRODUCTS ENDPOINTS ====================');
}

content = content.replace(/app\.get\('\/api\/subscriptions\/order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.get(\'/api/subscriptions/order\', async (req, res) => {\n  res.json(await getSetting(\'subscriptionsOrder\', [], subscriptionsOrderPath));\n});');

content = content.replace(/app\.put\('\/api\/subscriptions\/order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.put(\'/api/subscriptions/order\', async (req, res) => {\n  try { await setSetting(\'subscriptionsOrder\', req.body, subscriptionsOrderPath); res.json({success:true}); } catch(e) { res.status(500).json({error:e.message}); }\n});');

content = content.replace(/app\.get\('\/api\/products\/order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.get(\'/api/products/order\', async (req, res) => {\n  res.json(await getSetting(\'productsOrder\', [], productsOrderPath));\n});');

content = content.replace(/app\.put\('\/api\/products\/order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.put(\'/api/products/order\', async (req, res) => {\n  try { await setSetting(\'productsOrder\', req.body, productsOrderPath); res.json({success:true}); } catch(e) { res.status(500).json({error:e.message}); }\n});');

content = content.replace(/app\.get\('\/api\/products\/hero-order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.get(\'/api/products/hero-order\', async (req, res) => {\n  res.json(await getSetting(\'heroOrder\', [], heroOrderPath));\n});');

content = content.replace(/app\.put\('\/api\/products\/hero-order', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.put(\'/api/products/hero-order\', async (req, res) => {\n  try { await setSetting(\'heroOrder\', req.body, heroOrderPath); res.json({success:true}); } catch(e) { res.status(500).json({error:e.message}); }\n});');

content = content.replace(/const readBundleDiscounts = \(\)[\s\S]*?const writeBundleDiscounts = \(data\)[\s\S]*?\};/, '');

content = content.replace(/app\.get\('\/api\/bundle-discounts', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.get(\'/api/bundle-discounts\', async (req, res) => {\n  const defaultDisc = [{ minGames: 3, discountPercentage: 10 }, { minGames: 5, discountPercentage: 20 }];\n  res.json(await getSetting(\'bundleDiscounts\', defaultDisc, bundleDiscountsPath));\n});');

content = content.replace(/app\.put\('\/api\/bundle-discounts', \(req, res\) => \{[\s\S]*?\}\);/, 
  'app.put(\'/api/bundle-discounts\', async (req, res) => {\n  try { await setSetting(\'bundleDiscounts\', req.body, bundleDiscountsPath); res.json({success:true, data: req.body}); } catch(e) { res.status(500).json({error:e.message}); }\n});');

fs.writeFileSync('backend/server.js', content);
