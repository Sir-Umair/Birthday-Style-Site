# For Baybo — A Personalized Birthday Surprise 🎂💗

A mobile-first, interactive birthday web gift crafted especially for **Baybo**, built with React, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide React, Canvas Confetti, and a Google Sheets + Google Apps Script backend.

---

## 1. Personalization Instructions (No Component Edits Needed)

Open **`src/config/birthday.ts`** to customize everything in one place:

- **Nickname & Greetings**: `nickname`, `affectionateNickname`, `welcome`, `cake`, `finalSurprise`
- **Personal Letter**: Edit `letter.paragraphs` and `letter.signature`
- **Photos & Captions**:
  1. Put your own images inside `public/images/` (for example `public/images/photo-1.jpg` ... `photo-6.jpg`)
  2. Update `memories.photos` in `src/config/birthday.ts` with `/images/photo-1.jpg`, alt text, captions, and labels
- **Compliments & Secret Message**: Edit `funZone.compliments`, `funZone.queenAnswer`, and `funZone.secretMessage`
- **Theme Colors**: Adjust hex values inside `theme` (`canvas`, `blush`, `lavender`, `cream`, `accent`, etc.)
- **Optional Music**:
  1. Place an `.mp3` file at `public/music/birthday-melody.mp3` (never autoplays)
  2. Or set `music.enabled: false` in `src/config/birthday.ts`. Even without an MP3 file, the Play button gently plays a built-in music-box chime fallback.

---

## 2. Google Sheets + Google Apps Script Integration

Feedback from Screen 7 is stored **only in your Google Sheet** with columns:

`| Timestamp | Star_Count | Feedback | Made_Me_Smile |`

### Step-by-Step Setup

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet (e.g., `Baybo Birthday Feedback`).
   - Rename the first tab to `Feedback` (optional — `Code.gs` auto-creates/initializes headers on first submission).
2. **Open Extensions → Apps Script**:
   - In your Google Sheet menu bar, click **Extensions** → **Apps Script**.
3. **Add Backend Code**:
   - Delete any starter code in `Code.gs` and paste the complete contents of **`google-apps-script/Code.gs`** from this repo.
   - Save the project (`Ctrl + S` / `Cmd + S`).
4. **Deploy as Web App**:
   - Click **Deploy** → **New deployment**.
   - Click the gear icon next to *Select type* and choose **Web app**.
5. **Configure Access**:
   - **Description**: `Baybo Birthday Feedback API`
   - **Execute as**: `Me`
   - **Who has access**: `Anyone`
   - Click **Deploy** and complete the Google authorization prompt (if shown an unverified app warning for your personal script, click *Advanced* → *Go to project*).
6. **Copy Deployment URL**:
   - Copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`).
7. **Add to Environment Configuration**:
   - Create a `.env.local` file (or `.env`) in the project root:
     ```env
     NEXT_PUBLIC_FEEDBACK_API_URL="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
     ```
   - Restart the dev server if it is already running.

> **Security Note**: Never commit your `.env` or Google credentials. `Code.gs` validates ratings (`1–5`), rejects empty/oversized messages, sanitizes spreadsheet formulas, uses `LockService` for safe concurrent appends, and uses `CacheService` to prevent accidental duplicate submissions and burst abuse without storing any personal metadata.

---

## 3. Local Setup

```bash
npm install
cp .env.example .env.local
# Add your Apps Script Web App URL to NEXT_PUBLIC_FEEDBACK_API_URL in .env.local
npm run dev
```

Open `http://localhost:3000`.

To verify types and production build locally:

```bash
npm run lint
npm run build
```

---

## 4. GitHub Push Instructions

```bash
git init
git add .
git commit -m "Build Baybo's personalized birthday surprise"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/baybo-birthday-surprise.git
git push -u origin main
```

*(Make sure `.env.local` is ignored by `.gitignore` and never pushed.)*

---

## 5. Vercel Deployment Instructions

1. Go to [Vercel](https://vercel.com) and click **Add New… → Project**.
2. Import your `baybo-birthday-surprise` GitHub repository.
3. Framework preset will be detected as **Vite** (`Build Command: npm run build`, `Output Directory: dist`).
4. Under **Environment Variables**, add:
   - Name: `NEXT_PUBLIC_FEEDBACK_API_URL`
   - Value: your Google Apps Script Web App URL (`https://script.google.com/macros/s/.../exec`)
5. Click **Deploy**.
6. Once deployed, test the live Feedback form on your phone and confirm a new row appears in your Google Sheet!

---

## 6. Mobile & Desktop Testing Checklist

- **Mobile Viewports**: Verify layout, zero horizontal scroll, and >= 44px tap targets at:
  - `375px` (iPhone SE / Mini)
  - `390px` (iPhone 14 / 15)
  - `414px` (iPhone Plus / XR)
  - `430px` (iPhone Pro Max)
- **Tablet & Desktop**: Verify balanced multi-column Memories grid & Fun Zone at `768px`, `1024px`, and `1440px`.
- **Interactive Flow**:
  - [ ] Screen 1: Floating ambient particles animate smoothly; `"Open Your Surprise ✨"` advances cleanly.
  - [ ] Screen 2: All 5 candles extinguish on tap; confetti fires and greeting unlocks only after all 5 are blown out; `"Relight candles"` resets cleanly.
  - [ ] Screen 3: Closed envelope opens on tap; letter types smoothly; `"Read full letter"` finishes typing immediately.
  - [ ] Screen 4: Mobile carousel swipes cleanly with prev/next + dots; tapping any photo opens lightbox with prev/next/close (`Escape` key works on desktop).
  - [ ] Screen 5: `"Who's the birthday queen today?"` reveals `"Obviously Baybooo!"`; `"Tap for a little compliment"` never repeats the same quote back-to-back; `"One more surprise?"` reveals secret note.
  - [ ] Screen 6: Grand confetti fires; `"Celebrate again"` replays confetti; `"Leave Me Your Feedback 💌"` opens Screen 7.
  - [ ] Screen 7: Empty feedback or missing star rating shows validation; submission disables button during network call; success screen renders **only** after confirmed `{ ok: true }` response from Apps Script; duplicate submission is blocked; failed requests allow retrying without clearing typed text.
  - [ ] Audio: Music never autoplays; Play/Pause button works smoothly with or without an `.mp3` file.
  - [ ] Accessibility: Reduced-motion preference disables decorative motion and typing delay cleanly.
