# Obsidian Forge

Deployable React + Vite ecommerce storefront with:

- Supabase auth, profiles, orders, and reviews
- Product catalog, product detail, cart, checkout, dashboard, billing, settings, and tracking
- Safe fallback behavior when Supabase environment variables are missing

## Local setup

1. Copy `.env.local.example` to `.env.local`
2. Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY` for the server-side website chatbot
3. Run the SQL in `supabase_setup.sql`

## Run locally

If your project path does not contain special characters:

```bash
npm install
npm run dev
npm run build
```

If you are running from a Windows folder path that contains `&`, use:

```bash
node ./node_modules/vite/bin/vite.js build
```

or

```bash
npm run build:direct
```

## Deploy

- Framework preset: `Vite`
- Build command: `node ./node_modules/vite/bin/vite.js build`
- Output directory: `dist`

`vercel.json` already includes an SPA rewrite for client-side routes.

## Chatbot setup

- The Gemini chatbot now runs through the server-side route `/api/chatbot`.
- Store the Gemini secret as `GEMINI_API_KEY`, not `VITE_GEMINI_API_KEY`.
- On Vercel, add `GEMINI_API_KEY` in Project Settings -> Environment Variables.
- For local server-side testing, use `vercel dev` so the API route runs alongside the app.
