import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Supabase Connection Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ==================== PRODUCTS ENDPOINTS ====================

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { data, error } = await supabase.from('products').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new product
app.post('/api/products', async (req, res) => {
  try {
    const game = req.body;
    const { data, error } = await supabase.from('products').insert([game]).select();
    if (error) throw error;
    res.json(data[0]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update a product by title
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a product by title
app.delete('/api/products/:title', async (req, res) => {
  try {
    const title = decodeURIComponent(req.params.title);
    const { error } = await supabase.from('products').delete().eq('title', title);
    if (error) throw error;
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== IMAGE UPLOAD ENDPOINT ====================
app.post('/api/upload', async (req, res) => {
  try {
    const { title, base64Image } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    const base64Data = Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const fileExtension = base64Image.substring(base64Image.indexOf('/') + 1, base64Image.indexOf(';')) || 'png';
    const fileName = `${Date.now()}-${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${fileExtension}`;

    const { data, error } = await supabase.storage
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});