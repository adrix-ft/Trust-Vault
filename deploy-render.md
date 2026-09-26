# How to Deploy Your Backend to Render.com

Since your Node.js backend handles secure connections to Steam, Twitch, and Supabase, it **must** be deployed on a live server so your frontend can communicate with it from anywhere!

Here is the exact step-by-step guide to deploying your backend for **free** on Render:

## 1. Create a Render Web Service
1. Go to [Render.com](https://render.com) and create a free account (sign up with your GitHub).
2. Click the **"New"** button at the top and select **"Web Service"**.
3. Choose **"Build and deploy from a Git repository"** and click **Next**.
4. Connect your GitHub account and select your `Store-Vault` repository.

## 2. Configure the Deployment Settings
Render needs to know that your backend lives inside the `backend` folder. Fill out the settings exactly like this:

- **Name:** `store-vault-backend` (or whatever you like)
- **Region:** Choose whatever is closest to you.
- **Branch:** `main`
- **Root Directory:** `backend` *(CRITICAL: You must type `backend` here, otherwise it will try to deploy your React app instead!)*
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Instance Type:** Free

## 3. Add Environment Variables
Scroll down and click on **Environment Variables**. You need to copy *every single key* from your local `backend/.env` file into Render. 

Click **"Add Environment Variable"** for each of these:

```text
SUPABASE_URL = https://wgeznqiawvumvimrehmm.supabase.co
SUPABASE_KEY = sb_publishable_gd-R66zJ5I4U8uL_bJvm-Q_ljxoPi4c
SUPABASE_SECRET_KEY = <YOUR_SUPABASE_SECRET_KEY_FROM_DASHBOARD>
SUPABASE_JWKS_URL = https://wgeznqiawvumvimrehmm.supabase.co/auth/v1/.well-known/jwks.json

VITE_PROOF_SUPABASE_URL = https://wgeznqiawvumvimrehmm.supabase.co
VITE_PROOF_SUPABASE_KEY = sb_publishable_gd-R66zJ5I4U8uL_bJvm-Q_ljxoPi4c

TWITCH_SECRET_KEY = <YOUR_TWITCH_SECRET_KEY>
TWITCH_CLIENT_ID = <YOUR_TWITCH_CLIENT_ID>

VITE_ADMIN_USERNAME = admin1
VITE_ADMIN_PASSWORD = secret123
VITE_ADMIN2_USERNAME = aa
VITE_ADMIN2_PASSWORD = 5522
```

## 4. Deploy!
Click **"Create Web Service"** at the very bottom! 

Render will now pull your code and start the server. Wait 2-3 minutes until you see **"Live"** in green text.

## 5. Final Step: Connect your Frontend to the Live Backend
Once your backend is live, Render will give you a live URL at the top left (it will look something like `https://store-vault-backend.onrender.com`).

Copy that URL!

Finally, go to your **frontend** `.env` file (the one in your root folder) and add or update this line so your website talks to your live server instead of localhost:

```text
VITE_API_BASE_URL=https://your-new-render-url.onrender.com
```

That's it! Your entire store backend is now officially on the internet!
