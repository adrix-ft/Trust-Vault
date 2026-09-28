-- =========================================================================
-- SUPABASE SECURITY (ROW LEVEL SECURITY) CONFIGURATION
-- Run this in your Supabase SQL Editor to secure your database tables.
--
-- Since your project uses a Node.js Express backend with the 
-- SUPABASE_SECRET_KEY (Service Role Key), the backend will automatically 
-- bypass these restrictions. These policies ensure that no one can connect 
-- directly to your Supabase database using the public anon key.
-- =========================================================================

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS upcoming ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS orderitem ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS rents ENABLE ROW LEVEL SECURITY;

-- (For the Proofs database, run this there)
ALTER TABLE IF EXISTS proofs ENABLE ROW LEVEL SECURITY;

-- 2. Drop any existing public permissive policies to avoid conflicts
-- (Skipped to avoid errors if tables don't exist. You can manually delete any public policies from the Supabase UI if they exist).

-- 3. Create strict policies (Deny all for public anon/authenticated users)
-- By creating NO policies at all, Supabase defaults to DENY ALL. 
-- However, if you ever plan to connect the frontend directly to Supabase 
-- just for READING products (to save backend bandwidth), you can uncomment 
-- the SELECT policies below:

/*
-- UNCOMMENT TO ALLOW DIRECT FRONTEND READING (If using Anon Key in React):
CREATE POLICY "Allow public read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow public read access to upcoming" ON upcoming FOR SELECT USING (true);
CREATE POLICY "Allow public read access to collections" ON collections FOR SELECT USING (true);
CREATE POLICY "Allow public read access to subscriptions" ON subscriptions FOR SELECT USING (true);
*/


-- =========================================================================
-- STORAGE SECURITY (BUCKETS)
-- =========================================================================
-- If your covers and proofs buckets are public, anyone can read the images.
-- But we must ensure only your Backend (Service Role Key) can upload/delete.

-- Ensure the covers bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'covers';
-- Ensure the proofs bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'proofs';

-- (Storage policies for 'covers' and 'proofs' should be managed directly 
-- via the Supabase Dashboard -> Storage -> Policies UI to avoid ownership errors).
