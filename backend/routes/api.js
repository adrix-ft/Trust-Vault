import express from 'express';
import { supabase } from '../config/supabase.js';
import fs from 'fs';

const router = express.Router();

// 1. Fetch all products
router.get('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*');

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Server error fetching products" });
  }
});

// 2. TEMPORARY SEED ROUTE: Uploads catalog.json to Supabase
router.post('/seed', async (req, res) => {
  try {
    const rawData = fs.readFileSync('catalog.json', 'utf8');
    const games = JSON.parse(rawData);

    const { data, error } = await supabase
      .from('products')
      .insert(games);

    if (error) {
      console.error("Upload Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Successfully uploaded all games to Supabase!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error during seeding" });
  }
});

// 3. Add a new product (Admin) - ensures coverImage is explicitly saved
router.post('/products', async (req, res) => {
  try {
    const newGame = req.body;
    const { data, error } = await supabase
      .from('products')
      .insert([newGame])
      .select();

    if (error) {
      console.error("Supabase Add Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error adding product" });
  }
});

// 4. Update an existing product by title (Admin)
router.put('/products/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const updatedGame = req.body;

    const { data, error } = await supabase
      .from('products')
      .update(updatedGame)
      .eq('title', title)
      .select();

    if (error) {
      console.error("Supabase Update Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json(data[0]);
  } catch (err) {
    res.status(500).json({ error: "Server error updating product" });
  }
});

// 5. Delete a product by title (Admin)
router.delete('/products/:title', async (req, res) => {
  try {
    const { title } = req.params;

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('title', title);

    if (error) {
      console.error("Supabase Delete Error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error deleting product" });
  }
});

// 6. Handle local file uploads to Supabase Storage Bucket
router.post('/upload', async (req, res) => {
  try {
    const { title, base64Image } = req.body;
    
    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const matches = base64Image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ error: 'Invalid base64 image string' });
    }

    const fileExt = matches[1].split('+')[0];
    const buffer = Buffer.from(matches[2], 'base64');
    const safeTitle = (title || 'untitled').toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fileName = `${safeTitle}-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('game-covers')
      .upload(fileName, buffer, {
        contentType: `image/${fileExt}`,
        upsert: true
      });

    if (error) {
      console.error('Supabase storage error:', error);
      throw error;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('game-covers')
      .getPublicUrl(fileName);

    res.json({ url: publicUrl });
  } catch (err) {
    console.error('Upload failed:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;