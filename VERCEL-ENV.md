# Add Supabase env vars on Vercel

So your **live site** uses the same shared data as local.

1. Go to **https://vercel.com** and sign in.
2. Open your **CryptixBay** project (click it).
3. Click **Settings** (top tab).
4. In the left sidebar, click **Environment Variables**.
5. Add two variables:

   **Variable 1**
   - **Key:** `NEXT_PUBLIC_SUPABASE_URL`
   - **Value:** `https://eiinphpzlailyeogxgmq.supabase.co`
   - (Pick all environments: Production, Preview, Development if you want, or just Production.)

   **Variable 2**
   - **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value:** your publishable key (the `sb_publishable_...` one from Supabase API Keys).

6. Click **Save** for each.
7. **Redeploy** so the new vars are used:
   - Go to the **Deployments** tab.
   - Click the **⋯** (three dots) on the latest deployment.
   - Click **Redeploy** → confirm.

After the redeploy finishes, your live CryptixBay site will use Supabase and shared data.
