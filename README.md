# CryptixBay

A darkweb-style demo site with store, DMs, news channel, and themes. Works **solo** (localStorage) or **with friends** (shared data via Supabase).

## Features

- **Login / Signup** – Username and password (localStorage or shared DB)
- **Store** – Post marketplace listings with thumbnails, categories, detail modal; admins can delete
- **DMs** – Message other users (shared when using Supabase)
- **News** – Post and read channel updates
- **Config** (admins only) – Set which users are admins
- **Admin** – Give crypto, delete listings, ban users, set admins
- **Settings** – Green and purple themes

## Shared data (you + friends)

To share data so you and friends see the same users, listings, DMs, and news, use Supabase.

**→ See [SUPABASE-SETUP.md](SUPABASE-SETUP.md) for a full step-by-step guide.**

Short version: create a project at [Supabase](https://supabase.com), run `supabase-schema.sql` in the SQL Editor, then set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (and in Vercel’s Environment Variables), and redeploy.

Without those env vars, the app uses **localStorage only** (solo, no sharing).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy on Vercel

1. Push this repo to GitHub.
2. In [Vercel](https://vercel.com), import the project and deploy (Next.js is auto-detected).
3. Optional: add `public/cb_logo.png` for a custom logo; the app uses `public/cb_logo.svg` by default.

## Logo

The app uses `public/cb_logo.svg`. To use a PNG instead, add `public/cb_logo.png` and update the `Image` `src` in `app/login/page.js`, `app/signup/page.js`, and `app/dashboard/layout.js` from `/cb_logo.svg` to `/cb_logo.png`.
