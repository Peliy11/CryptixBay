# Supabase setup — step by step

Follow these steps so CryptixBay can use **shared data** (you and your friends see the same users, listings, DMs, and news).

---

## Step 1: Create a Supabase project

1. Go to **https://supabase.com** and sign in (or create a free account).
2. Click **“New project”**.
3. Pick an **organization** (or create one).
4. Choose a **name** (e.g. `cryptixbay`) and a **database password** (save it somewhere).
5. Choose a **region** close to you.
6. Click **“Create new project”** and wait until it’s ready (1–2 minutes).

---

## Step 2: Run the SQL script (create tables)

1. In the left sidebar, click **“SQL Editor”**.
2. Click **“New query”** (or the + button).
3. Open the file **`supabase-schema.sql`** from this repo in a text editor.
4. **Copy everything** in that file (all the SQL).
5. **Paste** it into the Supabase SQL Editor.
6. Click **“Run”** (or press Ctrl+Enter).
7. You should see a success message and no errors. That creates the tables and permissions.

---

## Step 3: Get your URL and anon key

1. In the left sidebar, click **“Project Settings”** (gear icon at the bottom).
2. Click **“API”** in the left menu.
3. You’ll see:
   - **Project URL** — something like `https://abcdefgh.supabase.co`
   - **Project API keys** — under “anon” / “public” you’ll see a long key (starts with `eyJ...`)
4. **Copy** the **Project URL** and the **anon public** key. You’ll use them in the next steps.

---

## Step 4: Add env vars on your computer (for local dev)

1. In your project folder, find the file **`.env.local.example`**.
2. **Copy** it and rename the copy to **`.env.local`** (same folder as `package.json`).
3. Open **`.env.local`** and set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-long-anon-key...
```

Replace with your real **Project URL** and **anon key** from Step 3.

4. Save the file.  
   When you run `npm run dev`, the app will use this Supabase project (shared data).

---

## Step 5: Add the same env vars on Vercel (for your live site)

1. Go to **https://vercel.com** and open your **CryptixBay** project.
2. Click **“Settings”**.
3. Click **“Environment Variables”** in the left menu.
4. Add two variables:

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Project URL (e.g. `https://xxxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key (the long `eyJ...` string) |

5. Save. Then go to **“Deployments”**, open the **⋯** on the latest deployment, and click **“Redeploy”** so the new env vars are used.

---

## Done

- **Locally:** Run `npm run dev` — the app will use Supabase (shared data).
- **Live (Vercel):** After redeploy, your live site also uses the same Supabase project.

Everyone who uses your **same Vercel URL** (or the same local URL when testing) will see the same users, listings, DMs, and news. The **first person to sign up** is admin; they can make others admin in **Config** or **Admin**.

---

## If you don’t set this up

If you **don’t** create a Supabase project or add the env vars, the app still works: it uses **localStorage only** (solo mode, no sharing between devices or friends).
