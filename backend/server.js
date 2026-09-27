import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// SECURED: Supabase Connection Configuration (Primary Catalog & Orders)
// Using SUPABASE_SECRET_KEY so the backend has full access
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// SECURED: Supabase Connection Configuration (Secondary Proofs Database)
const PROOF_SUPABASE_URL = process.env.VITE_PROOF_SUPABASE_URL;
// Use Secret Key to bypass RLS for admin uploads
const PROOF_SUPABASE_KEY = process.env.PROOF_SUPABASE_SECRET_KEY || process.env.SUPABASE_SECRET_KEY || process.env.VITE_PROOF_SUPABASE_KEY;
const proofSupabase = createClient(PROOF_SUPABASE_URL, PROOF_SUPABASE_KEY);

// RATE LIMITER: Protect orders endpoint from bot spam and carding attacks
const orderLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 3, // Limit each IP to 3 order requests per minute
  message: { error: "Too many orders created from this IP, please try again after a minute." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== PRODUCTS ENDPOINTS ====================

// ==================== SUBSCRIPTIONS ENDPOINTS ====================

app.get('/api/subscriptions', async (req, res) => {
  try {
    const { data, error } = await supabase.from('subscriptions').select('*').order('id', { ascending: true });
    if (error) throw error;
    
    const formattedData = data.map(sub => ({
      id: sub.id.toString(),
      name: sub.name,
      logoUrl: sub.logo_url,
      bannerUrl: sub.banner_url,
      themeColor: sub.theme_color,
      badge: sub.badge,
      description: sub.description,
      pricing: sub.pricing ? JSON.parse(sub.pricing) : [],
      details: sub.details ? JSON.parse(sub.details) : []
    }));
    
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  try {
    const sub = req.body;
    const dbSub = {
      name: sub.name,
      logo_url: sub.logoUrl,
      banner_url: sub.bannerUrl,
      theme_color: sub.themeColor,
      badge: sub.badge,
      description: sub.description,
      pricing: JSON.stringify(sub.pricing),
      details: JSON.stringify(sub.details)
    };
    const { data, error } = await supabase.from('subscriptions').insert([dbSub]).select();
    if (error) throw error;
    
    const inserted = data[0];
    res.json({
      id: inserted.id.toString(),
      name: inserted.name,
      logoUrl: inserted.logo_url,
      bannerUrl: inserted.banner_url,
      themeColor: inserted.theme_color,
      badge: inserted.badge,
      description: inserted.description,
      pricing: JSON.parse(inserted.pricing),
      details: JSON.parse(inserted.details)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/subscriptions/:id', async (req, res) => {
  try {
    const sub = req.body;
    const dbSub = {
      name: sub.name,
      logo_url: sub.logoUrl,
      banner_url: sub.bannerUrl,
      theme_color: sub.themeColor,
      badge: sub.badge,
      description: sub.description,
      pricing: JSON.stringify(sub.pricing),
      details: JSON.stringify(sub.details)
    };
    const { data, error } = await supabase.from('subscriptions').update(dbSub).eq('id', req.params.id).select();
    if (error) throw error;
    
    const updated = data[0];
    res.json({
      id: updated.id.toString(),
      name: updated.name,
      logoUrl: updated.logo_url,
      bannerUrl: updated.banner_url,
      themeColor: updated.theme_color,
      badge: updated.badge,
      description: updated.description,
      pricing: JSON.parse(updated.pricing),
      details: JSON.parse(updated.details)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subscriptions/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('subscriptions').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const game = req.body;
    const { data, error } = await supabase.from('products').insert([game]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const updatedGame = req.body;
    const { data, error } = await supabase
      .from('products')
      .update(updatedGame)
      .eq('title', title)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/products/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const { error } = await supabase.from('products').delete().eq('title', title);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== UPCOMING GAMES ENDPOINTS ====================

app.get('/api/upcoming', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('upcoming')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/upcoming', async (req, res) => {
  try {
    const { title, price, release_date, customCoverUrl, description } = req.body;
    const finalPrice = price || 'TBA';

    const { data, error } = await supabase
      .from('upcoming')
      .insert([{ 
        title, 
        price: finalPrice, 
        release_date, 
        customCoverUrl,
        description 
      }])
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/upcoming/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, release_date, customCoverUrl, description } = req.body;
    const finalPrice = price || 'TBA';
    
    const { data, error } = await supabase
      .from('upcoming')
      .update({ 
        title, 
        price: finalPrice, 
        release_date, 
        customCoverUrl,
        description 
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/upcoming/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('upcoming')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== IMAGE UPLOAD ENDPOINT (PRIMARY) ====================
app.post('/api/upload', async (req, res) => {
  try {
    const { title, base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const fileExtension = base64Image.substring(base64Image.indexOf('/') + 1, base64Image.indexOf(';')) || 'png';
    const fileName = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

    const { error } = await supabase.storage
      .from('covers')
      .upload(fileName, base64Data, {
        contentType: `image/${fileExtension}`,
        upsert: true
      });

    if (error) throw error;

    const { data: publicURLData } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName);

    res.json({ url: publicURLData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PROOF SCREENSHOT UPLOAD ENDPOINT (SECONDARY DB) ====================
app.post('/api/upload-proof', async (req, res) => {
  try {
    const { base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const fileExtension = base64Image.substring(base64Image.indexOf('/') + 1, base64Image.indexOf(';')) || 'png';
    const fileName = `proof-${Date.now()}.${fileExtension}`;

    const { error: uploadError } = await proofSupabase.storage
      .from('proofs')
      .upload(fileName, base64Data, {
        contentType: `image/${fileExtension}`,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: publicURLData } = proofSupabase.storage
      .from('proofs')
      .getPublicUrl(fileName);

    const { error: dbError } = await proofSupabase
      .from('proofs')
      .insert([{ image_url: publicURLData.publicUrl, created_at: new Date() }]);

    if (dbError) {
      console.warn('Proof storage uploaded, but database record insertion failed:', dbError.message);
    }

    res.json({ success: true, url: publicURLData.publicUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GET PROOFS ENDPOINT ====================
app.get('/api/proofs', async (req, res) => {
  try {
    const { data, error } = await proofSupabase.storage.from('proofs').list('', {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) throw error;
    if (!data) return res.json([]);

    const proofsWithUrls = data
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => {
        const { data: publicUrlData } = proofSupabase.storage
          .from('proofs')
          .getPublicUrl(file.name);
        return publicUrlData.publicUrl;
      });

    res.json(proofsWithUrls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DELETE PROOF ENDPOINT ====================
app.delete('/api/proofs', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });
    
    const fileName = url.split('/').pop();
    
    const { error: storageError } = await proofSupabase.storage
      .from('proofs')
      .remove([fileName]);
      
    if (storageError) throw storageError;

    // Optional: Try deleting from DB as well if it exists
    await proofSupabase.from('proofs').delete().eq('image_url', url);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== COLLECTIONS ENDPOINTS ====================

app.get('/api/collections', async (req, res) => {
  try {
    const { data, error } = await supabase.from('collections').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/collections', async (req, res) => {
  try {
    const { id, title, description, banner, customBannerUrl, keywords } = req.body;
    const { data, error } = await supabase.from('collections').insert([{
      id, 
      title, 
      description, 
      banner, 
      custom_banner_url: customBannerUrl, 
      keywords
    }]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, banner, customBannerUrl, keywords } = req.body;
    const { data, error } = await supabase.from('collections').update({
      title, 
      description, 
      banner, 
      custom_banner_url: customBannerUrl, 
      keywords
    }).eq('id', id).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/collections/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ORDERS ENDPOINT (SECURED & RATE LIMITED) ====================

app.post('/api/orders', orderLimiter, async (req, res) => {
  try {
    const { customerName, mobileNumber, totalAmount, items } = req.body;

    // Input Validation to reject bot spam (e.g. repetitive "candy" names or empty fields)
    if (
      !customerName || 
      customerName.toLowerCase().includes('candy') || 
      customerName.trim().length < 2 ||
      customerName.length > 50
    ) {
      return res.status(400).json({ error: "Invalid customer name or spam pattern detected." });
    }

    const uniqueOrderId = `ORD-${Date.now()}`;

    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([
        { 
          order_id: uniqueOrderId,
          customer_name: customerName, 
          customer_phone: mobileNumber, 
          total_amount: totalAmount,
          status: 'pending'
        }
      ])
      .select();

    if (orderError) throw orderError;
    const createdOrder = orderData[0];

    if (items && items.length > 0) {
      const orderItemsRows = items.map(item => {
        const cleanPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 0;
        return {
          id: crypto.randomUUID(),
          order_id: createdOrder.id,
          product_name: item.title,
          quantity: 1,
          price: cleanPrice
        };
      });

      const { error: itemsError } = await supabase
        .from('orderitem')
        .insert(orderItemsRows);

      if (itemsError) throw itemsError;
    }

    res.json({ success: true, orderId: uniqueOrderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== RENT TRACKING ENDPOINTS (SUPABASE) ====================

app.get('/api/rents', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('rents')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Map snake_case from DB to camelCase for Frontend
    const formattedData = data.map(rent => ({
      id: rent.id,
      customerName: rent.customer_name,
      mobileNumber: rent.mobile_number,
      totalAmount: rent.total_amount,
      items: typeof rent.items === 'string' ? JSON.parse(rent.items) : rent.items,
      status: rent.status,
      created_at: rent.created_at
    }));

    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/rents', async (req, res) => {
  try {
    const { customerName, mobileNumber, totalAmount, items } = req.body;
    
    const dbRent = {
      customer_name: customerName,
      mobile_number: mobileNumber,
      total_amount: totalAmount,
      items: items // Supabase handles JSONB arrays directly
    };

    const { data, error } = await supabase.from('rents').insert([dbRent]).select();
    
    if (error) throw error;

    const inserted = data[0];
    res.json({ 
      success: true, 
      data: {
        id: inserted.id,
        customerName: inserted.customer_name,
        mobileNumber: inserted.mobile_number,
        totalAmount: inserted.total_amount,
        items: inserted.items,
        status: inserted.status,
        created_at: inserted.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/rents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, customerName, mobileNumber, totalAmount, items } = req.body;
    
    // Build update object based on what's provided
    const updateData = {};
    if (status !== undefined) updateData.status = status;
    if (customerName !== undefined) updateData.customer_name = customerName;
    if (mobileNumber !== undefined) updateData.mobile_number = mobileNumber;
    if (totalAmount !== undefined) updateData.total_amount = totalAmount;
    if (items !== undefined) updateData.items = items;

    const { data, error } = await supabase.from('rents').update(updateData).eq('id', id).select();
    
    if (error) throw error;
    if (!data || data.length === 0) return res.status(404).json({ error: 'Rent not found' });

    const updated = data[0];
    res.json({ 
      success: true, 
      data: {
        id: updated.id,
        customerName: updated.customer_name,
        mobileNumber: updated.mobile_number,
        totalAmount: updated.total_amount,
        items: updated.items,
        status: updated.status,
        created_at: updated.created_at
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/rents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('rents').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== BUNDLE DISCOUNTS ENDPOINTS (LOCAL JSON) ====================
const bundleDiscountsPath = path.join(process.cwd(), 'bundleDiscounts.json');

const readBundleDiscounts = () => {
  if (!fs.existsSync(bundleDiscountsPath)) {
    const defaultDiscounts = [
      { minGames: 3, discountPercentage: 10 },
      { minGames: 5, discountPercentage: 20 }
    ];
    fs.writeFileSync(bundleDiscountsPath, JSON.stringify(defaultDiscounts));
  }
  const data = fs.readFileSync(bundleDiscountsPath);
  return JSON.parse(data);
};

const writeBundleDiscounts = (data) => {
  fs.writeFileSync(bundleDiscountsPath, JSON.stringify(data, null, 2));
};

app.get('/api/bundle-discounts', (req, res) => {
  try {
    const discounts = readBundleDiscounts();
    res.json(discounts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bundle-discounts', (req, res) => {
  try {
    const newDiscounts = req.body;
    writeBundleDiscounts(newDiscounts);
    res.json({ success: true, data: newDiscounts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== STEAM API INTEGRATION (PROXY) ====================

// GET /api/games/search?q=Elden+Ring
app.get("/api/games/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`
    );
    const data = await response.json();

    if (data && data.items) {
      const games = data.items.map(item => ({
        steam_app_id: item.id,
        title: item.name,
        cover_image_url: item.tiny_image,
        header_image_url: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`,
        library_image_url: `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${item.id}/library_600x900_2x.jpg`,
      }));
      return res.json({ games });
    }

    res.json({ games: [] });
  } catch (error) {
    console.error("Error searching games:", error);
    res.status(500).json({ error: "Failed to search games" });
  }
});

// GET /api/games/details/:appid
app.get("/api/games/details/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`,
      {
        headers: {
          // Bypass Steam's age gate for M-rated games like God of War
          Cookie: "birthtime=283993201; lastagecheckage=1-January-1979; mature_content=1"
        }
      }
    );
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('Steam did not return JSON:', text.substring(0, 100));
    }
    
    // Steam sometimes redirects appids (e.g. 1020790 -> 2674900)
    // Always use the first key returned by Steam instead of trusting the requested appid
    const returnedAppId = data ? Object.keys(data)[0] : null;
    
    if (data && returnedAppId && data[returnedAppId].success) {
      return res.json(data[returnedAppId].data);
    } else {
      console.log('Steam failed:', data ? (returnedAppId ? 'success is false' : 'appid missing') : 'no data');
    }
    
    res.status(404).json({ error: "Game details not found" });
  } catch (error) {
    console.error("Error fetching game details:", error);
    res.status(500).json({ error: "Failed to fetch game details" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});