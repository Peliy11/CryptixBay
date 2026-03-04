# CryptixBay

A darkweb-style demo site with store, DMs, news channel, and themes. Data is stored in the browser (localStorage) only.

## Features

- **Login / Signup** – Username and password saved in localStorage
- **Store** – Post marketplace listings (title, description, price)
- **DMs** – Message other users by username
- **News** – Post and read channel updates
- **Settings** – Switch between **green** and **purple** themes

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
