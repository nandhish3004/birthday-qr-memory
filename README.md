# 🎂 Birthday QR-Code Memory System

A complete, production-ready interactive birthday memory gift system built for **Shaaaw**, inspired by the attached scrapbook collage poster.

---

## ✨ Features & Capabilities

1. **8 Unique & Genuinely Scannable QR Codes**:
   - Each QR code encodes a permanent, clean URL:
     - `/memory/1`
     - `/memory/2`
     - `/memory/3`
     - `/memory/4`
     - `/memory/5`
     - `/memory/6`
     - `/memory/7`
     - `/memory/8`
   - High-contrast, Error Correction Level `H` (30% redundancy), with built-in quiet zone margins for instant phone camera detection.

2. **Public Mobile-Friendly Memory Webpages**:
   - Scrapbook aesthetic matching the poster: soft pastel pinks, polaroid borders, floating silver stars, and celebratory confetti.
   - **Video Memory**: Responsive HTML5 video player with rounded corners and seamless playback.
   - **Audio Memory**: Vinyl record player with spinning disc animation, sound wave visualizer, and Spotify-style quote card: *"I belong with you, you belong with me, you're my sweetheart"*.
   - **Waiting / Placeholder State**: Interactive gift box that bounces and dispenses floating hearts with the message:
     > *"A little surprise is waiting here 💗"*

3. **Secure Admin Dashboard (`/admin`)**:
   - Protected by a security PIN (Default: `shaaaw2026`, configurable in `.env`).
   - Manage all 8 QR memories independently:
     - **Upload / Replace Media**: Drag-and-drop or select any Video (`.mp4`, `.mov`, `.webm`) or Audio (`.mp3`, `.wav`, `.m4a`).
     - **Dynamic Replacement**: Replace media at any time without changing the QR code or URL!
     - **Personalized Notes & Titles**: Write custom heartfelt birthday messages displayed beneath each memory.
     - **Live Mobile Preview**: Simulated phone preview to test how the memory looks before anyone scans it.
     - **Delete Media**: Revert back to the *"A little surprise is waiting here 💗"* placeholder.
     - **Download Individual QRs**: Instant high-resolution PNG for each memory.

4. **Scrapbook Poster Integration**:
   - The 8 QR codes are naturally positioned onto the scrapbook collage in empty spots (near postcard stamps, beside the "13" balloon, under "HAPPY Bday" cutouts, next to the Spotify quote card, and beside the electric guitar) without covering faces!
   - 1-Click **"Download Print-Ready Poster"** creates a high-res composite image ready for printing.
   - 1-Click **"Download All 8 QRs (ZIP)"** bundles all QR assets.

---

## 🚀 Quick Start (Running Locally)

### 1. Install Dependencies
Open your terminal in this directory (`birthday-qr-memory-system`):
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Open in Browser
- **Showcase & Interactive Poster**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin](http://localhost:3000/admin) (PIN: `shaaaw2026`)
- **Memory Pages**:
  - Memory #1: [http://localhost:3000/memory/1](http://localhost:3000/memory/1)
  - Memory #2: [http://localhost:3000/memory/2](http://localhost:3000/memory/2)
  - ...
  - Memory #8: [http://localhost:3000/memory/8](http://localhost:3000/memory/8)

---

## 🌐 Setting Up for Real Phone Scanning (Deployment)

Because printed QR codes cannot open `localhost` from another person's phone, you should set your public domain before printing:

### Option A: Instant Free Public Tunnel (Fastest for testing)
You can test scanning from your real iPhone / Android in 30 seconds using **ngrok** or **localtunnel**:
```bash
# In a second terminal window:
npx localtunnel --port 3000
```
Copy the HTTPS URL generated (e.g. `https://curly-cats-sing.loca.lt`).

### Option B: Free Cloud Hosting (Recommended for final gift)
Deploy free to **Render.com**, **Railway.app**, or **Fly.io**:
1. Push this folder to a GitHub repository.
2. In [Render.com](https://render.com), click **New +** > **Web Service**.
3. Connect your repository.
4. Set:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variable: `ADMIN_PIN=your_custom_pin`
5. Render will give you a free HTTPS URL (e.g. `https://shaaaw-memories.onrender.com`).

### 🔄 Regenerate QRs with 1 Click
Once you have your public URL:
1. Go to the Admin Dashboard (`/admin`).
2. In the top banner, paste your public URL into the **"Current Public Base URL"** field.
3. Click **"Update & Regenerate QRs + Poster"**.
4. Click **"Download Print-Ready Poster"** — your poster now contains genuinely scannable QR codes pointing to your live cloud website!

---

## 📁 Project Structure

```
birthday-qr-memory-system/
├── src/
│   ├── server.js              # Express REST API, auth & static routes
│   ├── db.js                  # Persistent SQLite/JSON database for 8 memories
│   ├── storage.js             # Media upload handling & type detector
│   ├── qr-generator.js        # High-res QR code engine (Error correction Level H)
│   └── poster-composer.js     # Image compositor placing QRs onto scrapbook collage
├── public/
│   ├── index.html             # Interactive showcase & live poster preview
│   ├── memory.html            # Public mobile memory template (/memory/:id)
│   ├── admin.html             # Secure admin dashboard (/admin)
│   ├── css/
│   │   ├── global.css         # Typography, floating hearts, CSS tokens
│   │   ├── memory.css         # Mobile scrapbook pink aesthetic & media players
│   │   ├── admin.css          # Sleek glassmorphism admin dashboard
│   │   └── index.css          # Showcase page styles
│   ├── js/
│   │   ├── memory.js          # Player engine (video/audio/placeholder + confetti)
│   │   ├── admin.js           # Media uploader, live mobile preview, PIN auth
│   │   ├── poster-canvas.js   # 4K browser-based canvas poster exporter
│   │   └── index.js           # Interactive QR pins on poster showcase
│   └── assets/
│       ├── original-poster.jpg# Original scrapbook birthday poster
│       └── qr/                # Individual QR code PNGs (1.png to 8.png)
├── data/
│   └── memories.json          # Pre-seeded database storing memory metadata
├── uploads/                   # Uploaded video and audio files
├── scripts/
│   ├── setup.js               # Initialization & poster copy script
│   ├── generate-qrs.js        # Standalone QR generator CLI
│   └── verify.js              # Automated test & verification script
├── .env.example               # Environment variables template
├── .env                       # Active environment configuration
└── package.json               # Node.js project manifest
```

---

## 🖼️ 10-Frame Poster Studio (`/poster-v4.html`)

Fill the 10 photo panels in the birthday collage with your own pictures, then print.

- **Add a photo** — tap a frame, use the quick-fill tile, or drag a file straight onto a frame
- **Reposition** — drag a frame to nudge it; arrow keys fine-tune (shift = bigger steps)
- **Edit text** — click the name strip or the cream message card
- **QR codes** — 8 memory links, tucked into the margins; toggle them on or off
- **Export** — *Save PNG* renders 2025×3600 px (~300 DPI at 9×10.9in); *Print / PDF* for the sharpest output
- Everything auto-saves in your browser, so a refresh won't lose your work

### Why the frames line up exactly

Frame positions aren't eyeballed — they're **measured from the artwork**:

```bash
npm run poster:calibrate   # find the 10 panels, dump exact geometry
npm run poster:preview     # composite test photos, prove zero spill
npm run poster:check       # verify the page + smoke-test it
```

`calibrate` fits an exact oriented bounding box (convex hull + rotating calipers)
to each panel, so tilted frames are measured as tilted rather than approximated
as axis-aligned. Each frame is then grown 0.25% beyond its panel — shrinking them
leaves a black ring of exposed panel around every photo.

`poster:check` proves two things: that the geometry embedded in the page still
matches the calibration, and that compositing through it leaves **zero** leftover
panel pixels for both landscape and portrait uploads.

> Swapping the artwork? Drop your image at `public/assets/poster-v4/template.jpg`,
> re-run `npm run poster:calibrate`, and paste the printed positions block into
> `FRAME_GEOMETRY` in `public/poster-v4.html`. If your design has a different
> number of panels, adjust the frame loop as well.

---

## 🖨️ Printing & Poster Tips

- The poster should be printed at standard photo poster sizes (e.g. 12x18 inches, A3, or 8x12 inches).
- Maintain 300 DPI for ultra-crisp QR code edges.
- Because we use **Error Correction Level H (30%)** with generous quiet-zone borders, the QR codes can be scanned effortlessly even under dim party lighting or angled perspectives.
