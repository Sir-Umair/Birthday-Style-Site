# For Baybo — A Personalized Birthday Surprise 🎂💗

A mobile-first, interactive birthday web gift crafted especially for **Baybo**, built with React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide React, Canvas Confetti, an Express backend proxy, and a Google Sheets + Google Apps Script backend.

---

## Project Structure (Frontend & Backend Separated)

```text
Birthday Wishes/
├── frontend/                     # React + Vite Client Application
│   ├── src/                      # App components, styles, and birthday config
│   │   ├── components/           # Greeting, cake, letter, gallery, feedback UI
│   │   ├── config/birthday.ts    # Main personalization configuration
│   │   └── lib/feedback.ts       # Feedback API submission & Apps Script fallback
│   ├── public/                   # Static assets (images, music)
│   ├── .env                      # Frontend environment variables
│   ├── package.json              # Frontend scripts & dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   └── vite.config.ts            # Vite config (with /api proxy to backend)
│
├── backend/                      # Node.js + Express API Server
│   ├── server.ts                 # Express proxy server for Google Apps Script
│   ├── .env                      # Backend environment variables & PORT
│   ├── package.json              # Backend scripts & dependencies
│   └── tsconfig.json             # TypeScript configuration
│
├── google-apps-script/           # Google Apps Script reference backend
│   └── Code.gs                   # Apps Script code deployed to Google Sheets
│
└── package.json                  # Root runner scripts (concurrent dev)
```

---

## 1. Quick Start

### Run Both (Frontend & Backend) Together:
```bash
npm run dev
```
- **Frontend** runs on: `http://localhost:3000`
- **Backend API** runs on: `http://localhost:5000`
- Requests to `/api/feedback` from the frontend are automatically routed through the backend proxy directly into your Google Sheet!

### Or Run Individually:
- **Run Backend only**:
  ```bash
  npm run dev:backend
  ```
- **Run Frontend only**:
  ```bash
  npm run dev:frontend
  ```

---

## 2. Google Sheets + Google Apps Script Setup

Your Google Apps Script Web App URL is configured:
`https://script.google.com/macros/s/AKfycbwA_UIImBh_HSjgBAqoLYjgYW-ttEAT16_6c_x7bqm6D-5RrNw9qyqkR3MWE7FBaPkGcQ/exec`

This is automatically set in:
- `backend/.env` (`FEEDBACK_API_URL`)
- `frontend/.env` & `frontend/.env.local` (`VITE_FEEDBACK_API_URL`, `NEXT_PUBLIC_FEEDBACK_API_URL`)
- `frontend/src/config/birthday.ts` (`feedback.apiUrl`)

Feedback submissions are stored directly in your Google Sheet with columns:
`| Timestamp | Star_Count | Feedback | Made_Me_Smile |`

---

## 3. Personalization Instructions

Open **`frontend/src/config/birthday.ts`** to customize everything in one place:

- **Nickname & Greetings**: `nickname`, `affectionateNickname`, `welcome`, `cake`, `finalSurprise`
- **Personal Letter**: Edit `letter.paragraphs` and `letter.signature`
- **Photos & Captions**:
  1. Put your own images inside `frontend/public/images/` (e.g. `photo-1.jpg`, `photo-2.jpg`, etc.)
  2. Update `memories.photos` in `frontend/src/config/birthday.ts`
- **Compliments & Secret Message**: Edit `funZone.compliments`, `funZone.queenAnswer`, and `funZone.secretMessage`
- **Theme Colors**: Adjust hex values inside `theme` (`canvas`, `blush`, `lavender`, `cream`, `accent`, etc.)
- **Optional Music**:
  1. Place an `.mp3` file at `frontend/public/music/birthday-melody.mp3`
  2. Or set `music.enabled: false` in `frontend/src/config/birthday.ts`

---

## 4. Production Build

To build the frontend for production deployment:
```bash
npm run build
```
The optimized bundle is output to `frontend/dist`.
