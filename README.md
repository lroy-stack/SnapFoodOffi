# SnapFoodOffi — Viennese food discovery app

A prototype from May 2025, generated with Bolt (`.bolt/` folder; package name `foodsnap-vienna`). A mobile-first community app to discover Viennese dishes and restaurants, share photos and reviews, and earn badges.

## What it does

- Discover page with a dish list, search and filters, plus dish detail pages.
- Restaurant map with markers and popups (MapLibre via `react-map-gl`).
- Upload page: pick a dish and restaurant, rate, comment and add a photo.
- Accounts with email and password, social login options and magic links through Supabase Auth; profile editor and stats.
- Gamification: levels, badges and achievement notifications, with fallback services for when the network fails.
- German and English translations. About 20 Supabase SQL migrations in `supabase/migrations/`.

## Built with

Vite, React 18, TypeScript, Tailwind CSS, Framer Motion, i18next, MapLibre GL, Supabase, Netlify config.

## Run it locally

```bash
git clone https://github.com/lroy-stack/SnapFoodOffi.git
cd SnapFoodOffi
npm install
npm run dev
```

You need your own Supabase project with the migrations applied.

Status: archived prototype, not maintained.

---

Prototipo de mayo 2025 hecho con Bolt: app para descubrir platos y restaurantes de Viena, con mapa, reseñas con foto, insignias y niveles, sobre Supabase.
