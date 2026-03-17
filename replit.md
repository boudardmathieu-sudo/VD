# LuminaOS Dashboard

A personal home dashboard built with React + Vite + Express (unified server), featuring a boot screen, login, and a modular widget-based dashboard.

## Architecture

- **Frontend**: React 19 + Vite 6 + Tailwind CSS v4 + TypeScript
- **Backend**: Express served via `tsx server.ts`, which also runs Vite in middleware mode for dev
- **Database**: JSON file (`lumina_db.json`) — stores users and config
- **Entry point**: `server.ts` — starts Express API + Vite middleware on port 5000

## Project Structure

```
├── server.ts           # Express + Vite unified server (port 5000)
├── src/
│   ├── App.tsx         # Root component (BootScreen → Login → Dashboard)
│   ├── main.tsx        # React entry point
│   ├── index.css       # Global styles
│   └── components/
│       ├── BootScreen.tsx
│       ├── LoginScreen.tsx
│       ├── Dashboard.tsx
│       ├── Sidebar.tsx
│       ├── ui/         # Shared UI components (GlassCard, PetalBg)
│       └── widgets/    # Dashboard widgets (Clock, Spotify, Discord, etc.)
├── vite.config.ts      # Vite config (allowedHosts: true for Replit proxy)
├── lumina_db.json      # Auto-created JSON database
└── .env.example        # Environment variable reference
```

## Environment Variables

- `GEMINI_API_KEY` — For Gemini AI features
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — For Spotify widget
- `SPOTIFY_REDIRECT_URI` — Spotify OAuth callback URL
- `VITE_GOOGLE_CLIENT_ID` — For Google Home integration

## Running the App

```bash
npm run dev   # Starts Express + Vite on port 5000
npm run build # Build for production
```

## Default Login

- Username: `Mat`
- Password: `211008`
- Role: `admin`

## Key Features

- Boot screen animation
- Login system with user management
- Dashboard with modular widgets:
  - Clock, Weather, Notes, Todo, Quick Links
  - Spotify player integration
  - Discord bot status
  - Google Smart Home controls
  - ZimaOS system stats proxy
  - Network monitor, News feed
