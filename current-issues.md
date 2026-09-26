# Store Vault - Current Issues & Workarounds

## 1. The Steam API Rate Limiting Issue (The "404 Error")

**The Problem:**
When you deploy the backend to a cloud service like Render (or if you were to deploy it to Vercel, AWS, etc.), the Admin Panel fails to fetch game descriptions and screenshots from Steam, resulting in a `404` error in the browser console.

**Why it happens:**
1. Steam fiercely protects its database from bots and scrapers.
2. Steam automatically detects when requests are coming from a Data Center IP address (like the ones used by Render and Vercel) instead of a regular home Wi-Fi network.
3. Because thousands of other apps share the same Render IP address, Steam sees too many requests and enforces a strict "Rate Limit" (usually a maximum of 200 requests per 5 minutes per IP).
4. Steam blocks the request entirely, causing your Render backend to return a `404 Not Found` error.
5. Even if we pass age-gate bypass cookies (which we added for M-Rated games like God of War and Spider-Man), Steam's firewall will still block the IP address itself.
6. Public, free proxy services (like `corsproxy.io` or `allorigins`) face the exact same restrictions and are also blocked by Steam.

**Why switching to Vercel won't help:**
Vercel is just another massive cloud data center (powered by AWS). Steam blocks Vercel's IP addresses exactly the same way it blocks Render's.

## 2. The Solution: The Local-Host Workaround

Because we are building this on a completely free tech stack, we cannot purchase a paid Rotating Proxy service (which would disguise the Render server as a home computer).

Instead, the best workflow is to use your **local computer** to add games to the database. 

**Why this works:**
Your home internet connection has a "Residential IP Address". Steam trusts Residential IPs completely and will not block your requests.

**The Workflow:**
1. Leave your live Vercel website and live Render backend running 24/7. They will serve the games to your customers perfectly because they are just reading from your Supabase database.
2. When you want to **add a new game** to your store, open your command terminal on your computer.
3. Run `npm run dev` to start your local frontend and backend.
4. Go to `http://localhost:5173/admin` in your browser.
5. Search for the Steam game and add it. Because the request originates from your local PC, Steam will instantly allow it and pull the full description, requirements, and screenshots.
6. Click Save. The game is instantly saved to your live Supabase database.
7. Your live Vercel website will immediately update to show the new game!

## 3. Harmless Console Warnings

**The Problem:**
You may see red errors in your browser console like:
- `Failed to load resource: the server responded with a status of 404 () /assets/images/spider.jpg`
- `store-vault-backend.onrender.com/api/upcoming:1 Failed to load resource: the server responded with a status of 500 ()`

**Why it happens:**
- The image `404` errors happen if you manually type a fake image name into the Cover URL box while testing. The browser looks for a file that doesn't exist and complains. This breaks nothing.
- The `upcoming` `500` error happens because we deleted the "Upcoming Games" table from your Supabase database to keep it clean. The Admin Panel asks for the upcoming games, the backend fails to find the table, and returns a 500. We have successfully programmed the Admin Panel to silently ignore this error, but the browser natively logs all 500 errors to the console anyway. You can safely ignore this.
