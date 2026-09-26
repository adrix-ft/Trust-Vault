# Project Setup Guide: Supabase & Backend Configuration

This guide explains step-by-step how to set up your backend and databases from scratch to make your Store Vault project fully functional.

---

## 1. Environment Variables (`.env`)

You need two `.env` files. One in your root folder (for the React Frontend) and one in your `backend` folder (for the Node.js Server).

**Root `.env` (`/d:/Downloads/Project Files/Store Vault/.env`):**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=admin123
```

**Backend `.env` (`/d:/Downloads/Project Files/Store Vault/backend/.env`):**
```env
PORT=5000
SUPABASE_URL=your_primary_supabase_project_url
SUPABASE_SECRET_KEY=your_primary_supabase_service_role_key

VITE_PROOF_SUPABASE_URL=your_secondary_supabase_project_url
VITE_PROOF_SUPABASE_KEY=your_secondary_supabase_anon_key
```
*(Note: You can use the same Supabase project for both if you prefer, just paste the same URL/Keys in both sections).*

---

## 2. Supabase Primary Database Setup

Go to your Supabase project dashboard, open the **SQL Editor**, and run the following commands to create the exact tables your backend expects:

### Table 1: `products` (Your Game Catalog)
```sql
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT UNIQUE NOT NULL,
  price TEXT,
  "originalPrice" TEXT,
  "onSale" BOOLEAN DEFAULT false,
  categories TEXT[],
  description TEXT,
  "customCoverUrl" TEXT,
  "showInHero" BOOLEAN DEFAULT false,
  "isFeaturedPromo" BOOLEAN DEFAULT false,
  "isPlayerReview" BOOLEAN DEFAULT false,
  trailer TEXT,
  "isRentable" BOOLEAN DEFAULT false,
  "rentPrice" TEXT,
  variants JSONB,
  screenshots TEXT[],
  "sysReqMinimum" TEXT,
  "sysReqRecommended" TEXT
);
```


### Table 2: `orders` (Customer Orders)
```sql
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  order_id TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending'
);
```

### Table 3: `orderitem` (Items within an Order)
```sql
CREATE TABLE orderitem (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  price NUMERIC NOT NULL
);
```

---

## 3. Supabase Primary Storage Setup (Images)

1. Go to **Storage** in your Supabase dashboard.
2. Create a new bucket named exactly: `covers`
3. Make sure to set the bucket to **Public**.

---

## 4. Supabase Secondary Database (For Payment Proofs)

If you are using a separate Supabase project for proofs (as configured in your server.js), run this in its SQL Editor. (If you are using the same project, just run it alongside the tables above).

### Table: `proofs`
```sql
CREATE TABLE proofs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  image_url TEXT NOT NULL
);
```

### Secondary Storage Bucket:
1. Go to **Storage**.
2. Create a new bucket named exactly: `proof`
3. Make sure to set the bucket to **Public**.

---

## 5. Running the Application

Once your databases are set up and your `.env` files are populated:

1. **Start the Backend Server:**
   Open a terminal, navigate to the backend folder, and start the server:
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   *You should see "Server running on port 5000".*

2. **Start the Frontend Application:**
   Open a second terminal in your root folder:
   ```bash
   npm install
   npm run dev
   ```
   *This starts Vite on port 3000.*

You are now fully set up! Your Admin Dashboard will successfully save products to Supabase, upload images to your storage buckets, and process real orders.
