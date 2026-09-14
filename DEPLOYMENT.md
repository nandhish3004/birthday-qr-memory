# 🚀 Deployment Guide — Birthday QR Memory System

This guide explains how to deploy the application so that the 8 QR codes work on anyone's mobile phone via public HTTPS.

---

## 🔒 Lifetime Permanence Architecture (Option A: GitHub Pages Resolver)

### Why this lasts "Till Death":
Physical ink on paper cannot be re-written. If you print a direct cloud URL (e.g. `render.com`), and in 10 years that cloud service rebrands, moves, or shuts down, the physical poster would break.
Instead, your physical QR codes point to **GitHub Pages** (`https://nandhish3004.github.io/birthday-qr-memory/m/1` to `8`).
- GitHub Pages is backed by Microsoft/GitHub, 100% free, and never expires.
- When scanned, it instantly forwards the scanner to your active backend (e.g. Render).
- **If your hosting ever changes in 2035**, you only change **one URL** in `docs/config.json` on GitHub. The printed QR codes on the physical poster NEVER need reprinting!

---

## Step 1: Enable GitHub Pages in your Repository
1. Go to your GitHub repository: `https://github.com/nandhish3004/birthday-qr-memory`.
2. Click **Settings** (top tab) > **Pages** (left sidebar).
3. Under **Build and deployment** > **Branch**:
   - Select Branch: `main`
   - Select Folder: `/docs`
   - Click **Save**.
4. In ~60 seconds, your permanent resolver will be live at:
   `https://nandhish3004.github.io/birthday-qr-memory`

---

## Step 2: Deploy Web Service on Render.com (Hosts Your Videos & Audio)
1. In [Render Dashboard](https://dashboard.render.com), click **New +** > **Web Service**.
2. Connect your `birthday-qr-memory` GitHub repository.
3. Settings:
   - **Name**: `birthday-qr-memory-system` (or custom name)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
   - **Environment Variable**: `ADMIN_PIN=shaaaw2026`
4. Click **Create Web Service**. Render gives you a live HTTPS URL (e.g. `https://birthday-qr-memory-system.onrender.com`).

---

## Step 3: Connect GitHub Pages to Render (1-Time Setup)
1. Open your admin dashboard: `https://birthday-qr-memory-system.onrender.com/admin` (or `http://localhost:3000/admin`).
2. Enter your Admin PIN.
3. In the **Target Server Settings** panel, verify your Render URL is saved.
4. Download your Master QR Pack or Print Sheet.
5. You're done! All 8 QR codes are generated once, verified, and locked forever.

---

## Method 2: Instant Public Tunnel via Localtunnel (Zero Deployment)

If you just want to run the server on your laptop and test scanning from your phone immediately:

1. In Terminal 1 (Run the server):
   ```bash
   npm start
   ```

2. In Terminal 2 (Create a public tunnel):
   ```bash
   npx localtunnel --port 3000
   ```
   You will get a public URL like:
   `https://sweet-birthday-memory.loca.lt`

3. In the Admin Dashboard (`http://localhost:3000/admin`), set that URL as the Base URL, regenerate the poster, and test scanning on your phone!

---

## Method 3: Railway.app

1. Install Railway CLI or connect via GitHub at [railway.app](https://railway.app).
2. Create New Project > Deploy from GitHub repo.
3. Add environment variable: `ADMIN_PIN=shaaaw2026`.
4. Railway will automatically build and assign a domain (e.g. `birthday.up.railway.app`).

---

## 🔒 Security Best Practices

- **Admin PIN**: Change `ADMIN_PIN` in `.env` to a private password known only to you.
- **Media Privacy**: Unassigned memories safely display the placeholder *"A little surprise is waiting here 💗"* without exposing any internal state.
- **Upload Validation**: Only allowed media types (MP4, MOV, WebM, MP3, WAV, M4A) are accepted, with a 200MB size limit per file.
