# 🚀 Deployment Guide — Birthday QR Memory System

This guide explains how to deploy the application so that the 8 QR codes work on anyone's mobile phone via public HTTPS.

---

## Method 1: Render.com (Recommended — 100% Free & Fast)

[Render](https://render.com) is free, includes SSL/HTTPS automatically, and supports persistent storage.

### Steps:
1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Birthday QR Memory System"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/birthday-qr-memory.git
   git push -u origin main
   ```

2. **Create a new Web Service**:
   - Log in to [Render Dashboard](https://dashboard.render.com).
   - Click **New +** > **Web Service**.
   - Select your GitHub repository.

3. **Configure the Service**:
   - **Name**: `shaaaw-birthday-memories`
   - **Region**: Closest to you (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **Environment Variables** (Under "Advanced"):
   - `ADMIN_PIN`: `shaaaw2026` (or any PIN you choose)
   - `NODE_ENV`: `production`

5. **Deploy**:
   - Click **Create Web Service**.
   - In 1–2 minutes, Render will provide your public URL:
     `https://shaaaw-birthday-memories.onrender.com`

6. **Generate Your Final Printable Poster**:
   - Open `https://shaaaw-birthday-memories.onrender.com/admin` on your browser.
   - Enter your PIN.
   - In the top banner, set the Base URL to:
     `https://shaaaw-birthday-memories.onrender.com`
   - Click **Update & Regenerate QRs + Poster**.
   - Click **Download Print-Ready Poster**.
   - Done! Print this poster and all 8 QR codes will directly open your live website from any phone!

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
