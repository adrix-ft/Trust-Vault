# How Our Website Gets Game Information (And How You Can Do It Too)

This guide provides an end-to-end technical breakdown of how our platform retrieves, processes, and displays game information, followed by a complete blueprint showing how any other website or developer can implement the same capabilities.

---

## Table of Contents
1. [Architecture Overview: How Our Website Does It](#1-architecture-overview-how-our-website-does-it)
2. [Our Exact Implementation Walkthrough](#2-our-exact-implementation-walkthrough)
   - [A. The Backend Proxy Layer](#a-the-backend-proxy-layer)
   - [B. Steam Store Search Integration](#b-steam-store-search-integration)
   - [C. High-Resolution Game Details & CDN Images](#c-high-resolution-game-details--cdn-images)
   - [D. Global Master Catalog Caching (Deduplication)](#d-global-master-catalog-caching-deduplication)
3. [How Other Websites Can Fetch Game Information](#3-how-other-websites-can-fetch-game-information)
   - [Approach 1: Steam Store & Web APIs (Zero-Key Method)](#approach-1-steam-store--web-apis-zero-key-method)
   - [Approach 2: RAWG Video Games Database (Best for Multi-Platform)](#approach-2-rawg-video-games-database-best-for-multi-platform)
   - [Approach 3: IGDB - Internet Game Database (Industry Standard by Twitch)](#approach-3-igdb---internet-game-database-industry-standard-by-twitch)
   - [Approach 4: CheapShark API (Best for Price Comparison & Deals)](#approach-4-cheapshark-api-best-for-price-comparison--deals)
   - [Approach 5: IsThereAnyDeal (ITAD) API](#approach-5-isthereanydeal-itad-api)
4. [Production Best Practices for Developers](#4-production-best-practices-for-developers)
   - [Why You Must Always Use a Backend Proxy (CORS & Security)](#why-you-must-always-use-a-backend-proxy-cors--security)
   - [Database Caching & Schema Design](#database-caching--schema-design)
   - [Handling Rate Limits and Failures](#handling-rate-limits-and-failures)
5. [Summary Comparison Matrix](#5-summary-comparison-matrix)

---

## 1. Architecture Overview: How Our Website Does It

Our platform uses a **hybrid real-time search + centralized catalog cache** architecture. 

```
                                      +------------------------------------+
                                      |            Valve / Steam           |
                                      |          Public Store APIs         |
                                      +------------------------------------+
                                               ^                  |
                    1. Forward Search / Fetch  |                  | 2. JSON Data
                                               |                  v
+----------------+      HTTP GET        +------------------------------------+
|  Buyer/Seller  | -------------------> |    Our Express Node.js Server      |
| Browser (SPA)  | <------------------- |          (/api/index.ts)           |
+----------------+      Sanitized       +------------------------------------+
       |                JSON Results                       |
       |                                                   | 3. Cache / Upsert
       v                                                   v
+----------------------------------------------------------------------------+
|                       Supabase / PostgreSQL Database                       |
|                                                                            |
|  [master_games]  <----+ 1:N  +----------------+  N:1  +-----------------+  |
|  - steam_app_id       +----- |    listings    | <---- | seller_profiles |  |
|  - title                     |  - price_inr   |       |  - store_slug   |  |
|  - header_image_url          |  - stock_count |       |  - upi_id       |  |
|  - cover_image_url           +----------------+       +-----------------+  |
+----------------------------------------------------------------------------+
```

### Key Highlights of Our Flow:
1. **Client Search**: When a seller enters a game title (e.g., `"Cyberpunk 2077"`) in the dashboard or imports a Steam App ID, the frontend queries our local backend endpoint `/api/games/search?q=...` or `/api/games/details/:appid`.
2. **Server-Side API Proxy**: Our server makes an upstream call to Valve's official Steam Store API. This completely bypasses browser **CORS restrictions** and standardizes the response.
3. **Steam Akamai CDN Parsing**: We dynamically map and retrieve high-resolution cover graphics and headers directly from Valve’s globally distributed CDN (`cdn.akamai.steamstatic.com`).
4. **Master Catalog Deduplication (`master_games`)**: When a seller creates a listing, we check if the game already exists in `master_games` by `steam_app_id`. If it does, we reuse the existing metadata. If not, we insert it once into `master_games`. Every seller listing simply points to that master record, drastically reducing database bloat and eliminating redundant external API calls.

---

## 2. Our Exact Implementation Walkthrough

### A. The Backend Proxy Layer
In `server.ts` and `api/index.ts`, we host an Express server that acts as a proxy:

```typescript
// api/index.ts
import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

export default app;
```

### B. Steam Store Search Integration
When users search by game name, we call Steam's `storesearch` endpoint:

```typescript
// GET /api/games/search?q=Elden+Ring
app.get("/api/games/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    // Official Steam Store Search endpoint
    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(q)}&l=english&cc=US`
    );
    const data = await response.json();

    if (data && data.items) {
      const games = data.items.map((item: any) => ({
        steam_app_id: item.id,
        title: item.name,
        cover_image_url: item.tiny_image,
        header_image_url: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`,
      }));
      return res.json({ games });
    }

    res.json({ games: [] });
  } catch (error) {
    console.error("Error searching games:", error);
    res.status(500).json({ error: "Failed to search games" });
  }
});
```

### C. High-Resolution Game Details & CDN Images
For bulk imports or deep detail fetching (by App ID), we query Steam's `appdetails` endpoint:

```typescript
// GET /api/games/details/:appid
app.get("/api/games/details/:appid", async (req, res) => {
  try {
    const { appid } = req.params;
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english`
    );
    const data = await response.json();
    
    if (data && data[appid] && data[appid].success) {
      return res.json(data[appid].data);
    }
    
    res.status(404).json({ error: "Game details not found" });
  } catch (error) {
    console.error("Error fetching game details:", error);
    res.status(500).json({ error: "Failed to fetch game details" });
  }
});
```

#### Steam CDN Asset URL Formats
Steam hosts images on Akamai CDN using predictable patterns based on `appid`:
* **Header Banner (460x215)**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/header.jpg`
* **Capsule Main (616x353)**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/capsule_616x353.jpg`
* **Library Hero Banner**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_hero.jpg`
* **Vertical Library Cover (600x900)**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/library_600x900_2x.jpg`
* **Logo PNG**: `https://cdn.akamai.steamstatic.com/steam/apps/{appid}/logo.png`

### D. Global Master Catalog Caching (Deduplication)
When any seller adds a game, our frontend executes this deduplication logic:

```typescript
// 1. Check if game already exists in master catalog
const { data: existingGame } = await supabase
  .from('master_games')
  .select('id')
  .eq('steam_app_id', selectedGame.steam_app_id)
  .maybeSingle();

let gameId = existingGame?.id;

// 2. If not found, insert once into the master games table
if (!gameId) {
  const { data: newGame } = await supabase
    .from('master_games')
    .insert([{
      steam_app_id: selectedGame.steam_app_id,
      title: selectedGame.title,
      cover_image_url: selectedGame.cover_image_url,
      header_image_url: selectedGame.header_image_url,
    }])
    .select('id')
    .single();

  gameId = newGame.id;
}

// 3. Link the seller's store listing to the master game
await supabase.from('listings').insert([{
  seller_id: profile.id,
  game_id: gameId,
  price_inr: price,
  stock_count: 1,
}]);
```

---

## 3. How Other Websites Can Fetch Game Information

Depending on your website's goals (PC-only, multi-platform, price comparison, or reviews), here are the top 5 proven methods used across the gaming industry:

---

### Approach 1: Steam Store & Web APIs (Zero-Key Method)
**Best For**: PC game storefronts, digital game sellers, Steam inventory tools.

Valve provides public APIs that do not require any API key for basic game searching and metadata.

#### Key Endpoints:
1. **Store Search (Autocomplete / Search)**:
   ```
   GET https://store.steampowered.com/api/storesearch/?term={search_term}&l=english&cc=US
   ```
   * Returns: Game IDs (`id`), titles (`name`), small thumbnails (`tiny_image`), and current store prices.
2. **Game Details (Full metadata, system specs, genres, publishers)**:
   ```
   GET https://store.steampowered.com/api/appdetails?appids={appid}&cc=US&l=english
   ```
   * Returns: Full description, screenshots, trailers (`movies`), PC system requirements, release date, and tags.
3. **Full Steam App List (All ~100k+ Steam apps)**:
   ```
   GET https://api.steampowered.com/ISteamApps/GetAppList/v2/
   ```
   * Returns a complete JSON list of every `appid` and `name` on Steam (ideal for pre-indexing or creating full-text search databases like MeiliSearch/Elasticsearch).

#### Pros:
- Free, no registration or API key required.
- Fast, backed by Akamai's worldwide CDN.
- Official data straight from Valve.

#### Caveats:
- Valve will rate-limit aggressive IPs (~200 requests / 5 minutes).
- Browser CORS is blocked; **must** be called from a backend server.

---

### Approach 2: RAWG Video Games Database (Best for Multi-Platform)
**Website**: [rawg.io/apidocs](https://rawg.io/apidocs)  
**Best For**: General gaming portals, multi-platform stores (PC, PlayStation 5, Xbox Series X, Nintendo Switch, iOS, Android).

RAWG is the largest open video game database with over 500,000 games and 50 platforms.

#### How to use RAWG:
1. Sign up for a free account at [rawg.io](https://rawg.io) to obtain an API key.
2. Search for games:
   ```
   GET https://api.rawg.io/api/games?key={YOUR_API_KEY}&search=God of War&page_size=10
   ```
3. Fetch detailed game info:
   ```
   GET https://api.rawg.io/api/games/{game_id_or_slug}?key={YOUR_API_KEY}
   ```

#### Sample Response Data from RAWG:
```json
{
  "id": 58134,
  "slug": "god-of-war-2",
  "name": "God of War",
  "released": "2018-04-20",
  "background_image": "https://media.rawg.io/media/games/4be/4be6a6ad0364751a96229c56bf69be59.jpg",
  "metacritic": 94,
  "platforms": [
    { "platform": { "name": "PlayStation 4" } },
    { "platform": { "name": "PC" } }
  ],
  "genres": [
    { "name": "Action" },
    { "name": "Adventure" }
  ]
}
```

#### Pros:
- Covers console games (PSN, Xbox, Nintendo) alongside PC.
- Includes Metacritic scores, ESRB/PEGI ratings, tags, and community ratings.
- Free tier allows 20,000 requests per month.

---

### Approach 3: IGDB - Internet Game Database (Industry Standard by Twitch)
**Website**: [api-docs.igdb.com](https://api-docs.igdb.com)  
**Best For**: Commercial platforms, Twitch streamers, comprehensive wiki/catalog sites.

IGDB is maintained by Twitch/Amazon and is the database that powers Twitch game categories, Discord rich presence, and Discord bots.

#### How to use IGDB:
1. Register an application in the [Twitch Developer Console](https://dev.twitch.tv/console).
2. Generate an OAuth Bearer token:
   ```bash
   curl -X POST "https://id.twitch.tv/oauth2/token?client_id={CLIENT_ID}&client_secret={CLIENT_SECRET}&grant_type=client_credentials"
   ```
3. Query IGDB using their specialized `Apicalypse` query syntax:
   ```bash
   curl -X POST "https://api.igdb.com/v4/games" \
     -H "Client-ID: {YOUR_CLIENT_ID}" \
     -H "Authorization: Bearer {YOUR_ACCESS_TOKEN}" \
     -d 'fields name, summary, cover.url, first_release_date, platforms.name; search "Witcher 3"; limit 5;'
   ```

#### Pros:
- Extremely detailed relationships (DLCs, franchises, developers, engines, release dates by territory).
- Generous free quota (4 requests/second, completely free with Twitch developer credentials).
- High-res cover art and screenshots.

---

### Approach 4: CheapShark API (Best for Price Comparison & Deals)
**Website**: [cheapshark.com/api](https://apidocs.cheapshark.com/)  
**Best For**: Key resellers, discount trackers, price comparison tools.

CheapShark tracks live prices across major digital stores including Steam, GreenManGaming, Fanatical, GOG, Epic Games Store, and Humble Store.

#### How to use CheapShark (100% Free, No Key Required):
1. **Search for a game across all stores**:
   ```
   GET https://www.cheapshark.com/api/1.0/games?title=batman&limit=10
   ```
2. **Find the best live deals**:
   ```
   GET https://www.cheapshark.com/api/1.0/deals?storeID=1&upperPrice=15
   ```
3. **Check historical low and store links**:
   ```
   GET https://www.cheapshark.com/api/1.0/games?id={gameID}
   ```

#### Sample Response:
```json
[
  {
    "gameID": "612",
    "steamAppID": "35140",
    "cheapest": "4.99",
    "cheapestDealID": "0d20d828...",
    "external": "Batman: Arkham Asylum GOTY",
    "thumb": "https://images.greenmangaming.com/..."
  }
]
```

---

### Approach 5: IsThereAnyDeal (ITAD) API
**Website**: [isthereanydeal.com](https://isthereanydeal.com/)  
**Best For**: Advanced deal hunters, multi-currency price monitoring, and historical price graphs.

Provides detailed price histories, voucher codes, and regional price adjustments (INR, USD, EUR, etc.) across 30+ authorized digital storefronts.

---

## 4. Production Best Practices for Developers

If you are building your own gaming website, implement the following four architecture best practices:

### Why You Must Always Use a Backend Proxy (CORS & Security)
Never make raw requests to Steam, IGDB, or RAWG directly from client-side React, Vue, or frontend JavaScript:
1. **CORS Errors**: Most gaming APIs (including `store.steampowered.com`) do not return `Access-Control-Allow-Origin: *`. Web browsers will immediately block the request.
2. **Secret Protection**: Services like IGDB and RAWG require private API secrets. Exposing these in frontend code allows anyone to steal your quota.
3. **Response Sanitization**: Steam's `appdetails` returns large objects (often 100KB+ per game). A backend proxy strips out unnecessary payloads, returning only `title`, `cover`, and `price` to keep client bundles fast.

### Database Caching & Schema Design
Always cache external game details in your database to avoid hitting rate limits. Here is the recommended PostgreSQL / Supabase schema:

```sql
-- 1. Master games catalog (Single source of truth)
CREATE TABLE master_games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    steam_app_id INTEGER UNIQUE,
    rawg_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    cover_image_url TEXT NOT NULL,
    header_image_url TEXT,
    short_description TEXT,
    genres TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant autocomplete queries
CREATE INDEX idx_master_games_title ON master_games USING gin(to_tsvector('english', title));
CREATE INDEX idx_master_games_steam_id ON master_games(steam_app_id);

-- 2. Seller / Product Listings table referencing the master catalog
CREATE TABLE store_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID REFERENCES master_games(id) ON DELETE CASCADE,
    price_inr NUMERIC(10, 2) NOT NULL,
    stock_count INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(seller_id, game_id)
);
```

### Handling Rate Limits and Failures
1. **In-Memory Cache (LRU or Redis)**: Cache popular search queries (e.g., `"gta"`, `"fifa"`, `"cod"`) in memory for 1 hour so repeat searches do not touch upstream APIs.
2. **Exponential Backoff**: If Steam or RAWG responds with `429 Too Many Requests`, pause calls with exponential delays (1s, 2s, 4s).
3. **Image Fallbacks**: If a game's banner fails to load, fall back to a styled placeholder or the generic `header.jpg` formula.

---

## 5. Summary Comparison Matrix

| Provider | Best Use Case | API Key Required? | Platforms Covered | Rate Limits | Price |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Steam Store API** *(Used here)* | PC games, instant setup, official Steam catalog | **No** (Public) | PC (Steam) | ~200 req / 5 min | Free |
| **RAWG.io** | Multi-platform console & PC, release dates | Yes (Free signup) | PC, PS5, Xbox, Switch, iOS | 20,000 req / month | Free tier + Paid |
| **IGDB (Twitch)** | Enterprise-grade database, rich media, streaming | Yes (Twitch Developer) | All Platforms | 4 req / second | Free (w/ Twitch account) |
| **CheapShark** | Price comparison, historical low prices, digital deals | **No** | PC Stores (Steam, Epic, GOG) | Generous / Fair Use | Free |
| **IsThereAnyDeal** | Advanced price history, vouchers, regional pricing | Yes | PC Digital Stores | Variable | Free |

---

## Quick-Start Boilerplate (Node.js & Express)

To replicate our exact game lookup service in under 2 minutes:

```bash
npm install express cors dotenv
```

```javascript
// server.js
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());

// Search games
app.get('/api/games/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter 'q'" });

  try {
    const steamRes = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`
    );
    const data = await steamRes.json();
    
    const results = (data.items || []).map(item => ({
      appId: item.id,
      title: item.name,
      thumbnail: item.tiny_image,
      header: `https://cdn.akamai.steamstatic.com/steam/apps/${item.id}/header.jpg`
    }));

    res.json({ games: results });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch from Steam API" });
  }
});

app.listen(3001, () => console.log('Game API running on port 3001'));
```
