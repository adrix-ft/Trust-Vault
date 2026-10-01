<div align="center">
  <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80" alt="Trust Vault Banner" width="100%" style="border-radius: 12px; margin-bottom: 20px;">
  
  <br />
  <h1 align="center">🎮 Trust Vault</h1>
  <p align="center">
    <strong>A Premium Next-Gen Game Store Platform & Admin Dashboard</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E" alt="Supabase" />
  </p>
</div>

<hr />

## ✨ About The Project

**Trust Vault** is a high-performance, full-stack digital game store designed with a sleek, cinematic dark-mode UI. It features a fully integrated **Admin Control Panel** that fetches real-time game data (descriptions, screenshots, requirements) directly from the **Steam API**, saving it to a Supabase PostgreSQL database. 

It provides an end-to-end purchasing and renting experience with an incredibly smooth, animated user interface built using **Framer Motion** and **Tailwind CSS**.

---

## 🚀 Key Features

<table>
  <tr>
    <td width="50%">
      <h3>🕹️ Dynamic Storefront</h3>
      <ul>
        <li>Cinematic Hero Carousel with auto-adapting horizontal Steam banners.</li>
        <li>Smooth filtering by PC, PlayStation, Xbox, and Nintendo.</li>
        <li>Beautiful vertical game capsule cards with hover animations.</li>
        <li>Custom Game Details page with Lightbox image galleries.</li>
      </ul>
    </td>
    <td width="50%">
      <h3>⚙️ Admin Dashboard</h3>
      <ul>
        <li>Live Steam API Search — Type a game, and it instantly fetches the official cover, gallery, and description.</li>
        <li>Full CRUD capabilities to add, edit, or remove games & bundles.</li>
        <li>Real-time inventory sync to the Supabase Database.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🛒 Shopping Experience</h3>
      <ul>
        <li>Slide-out animated Cart system.</li>
        <li>Direct integration with WhatsApp & Telegram for secure delivery.</li>
        <li>Options to <b>Buy</b> or <b>Rent</b> accounts (1, 3, or 6 months).</li>
      </ul>
    </td>
    <td width="50%">
      <h3>⚡ Tech & Performance</h3>
      <ul>
        <li>Bypasses Steam data-center rate-limiting using dynamic proxy fallbacks.</li>
        <li>Supabase Storage integration for uploading custom game covers and delivery proofs.</li>
        <li>Fully responsive mobile-first design.</li>
      </ul>
    </td>
  </tr>
</table>

---

## 🛠️ Installation & Setup

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/adrix-ft/Trust-Vault.git
cd Trust-Vault

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Environment Variables
You will need to set up a `.env` file in the root directory for your Supabase and backend URLs.
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:5000
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=password123
```

### 3. Run Locally

Run the frontend (Vite):
```bash
npm run dev
```

Run the backend (Express):
```bash
cd backend
npm run dev
```

Your app will be available at `http://localhost:5173`.

---

<div align="center">
  <p><i>Crafted for gamers, built with passion.</i></p>
  <p>&copy; Trust Vault Team</p>
</div>
