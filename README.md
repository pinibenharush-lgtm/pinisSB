# Crete Trip App 🇬🇷

A small shared web app for Pini, Sean & Ori's trip to Crete:

- **Balance** — log shared expenses (split 2-way between Pini and Sean+Ori, or 3-way evenly), see who owes who.
- **Places** — add places you want to visit, rate them, comment, search them on a free map, and check the straight-line distance between any two.
- **Checklist** — a shared to-do list (passports, etc.) you can all tick off.
- **Game** — a daily logic puzzle (like LinkedIn's "Tango"), the same one for
  all three of you each day, with shared results and streaks.

No accounts or passwords: you just pick your name once on your phone and the
app remembers you. All three of you see the same live data.

It's built with [Next.js](https://nextjs.org) and [Supabase](https://supabase.com)
(a free hosted database). You don't need to know how to code to set it up —
just follow the two sections below once.

## 1. Create the free database (Supabase)

1. Go to [supabase.com](https://supabase.com) and sign up for a free account.
2. Click **New project**. Pick any name (e.g. "crete-trip") and a database
   password (save it somewhere, you likely won't need it again), and a region
   close to you. Wait ~1 minute for it to finish setting up.
3. In the left sidebar, open the **SQL Editor**, click **New query**, then
   open the file [`supabase/schema.sql`](./supabase/schema.sql) from this
   repo, copy its entire contents, paste it into the editor, and click **Run**.
   This creates the tables for expenses, places, and the checklist, and adds
   the three of you (Pini, Sean, Ori) as people.
4. In the left sidebar, go to **Project Settings → API**. You'll need two
   values from this page in the next section:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (a long string under "Project API keys")

If you already set up Supabase before and this app has been updated since,
check the [`supabase/migrations`](./supabase/migrations) folder — run any
new `.sql` files there (same SQL Editor → New query → paste → Run) to bring
your existing database up to date without losing any data.

## 2. Deploy the app (Vercel)

1. Go to [vercel.com](https://vercel.com) and sign up (you can sign up with
   your GitHub account).
2. Click **Add New → Project**, then import this GitHub repository
   (`pinissb`).
3. Before clicking Deploy, open **Environment Variables** and add:
   - `NEXT_PUBLIC_SUPABASE_URL` = the Project URL from step 1.4
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = the anon public key from step 1.4
4. Click **Deploy**. After a minute you'll get a live link (e.g.
   `crete-trip.vercel.app`) — share that link with Sean and Ori. Add it to
   your phone's home screen for an app-like experience (in Safari/Chrome:
   Share → "Add to Home Screen").

Any time you push new changes to this repo, Vercel automatically redeploys
the site.

## Local development (for future changes)

```bash
npm install
cp .env.local.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the data model works

- **Balance**: every expense has an amount, who paid, and a split ("3 ways"
  evenly between all of you, or "2 ways" between Pini's pocket and Sean+Ori's
  shared pocket). The app works out each side's net balance and the fewest
  payments needed to settle up.
- **Places**: each place can be rated 1–5 stars by each person (averaged),
  has its own comment thread, and can optionally be placed on a free
  [OpenStreetMap](https://www.openstreetmap.org)-based map (search for it by
  name when adding it). The Map view shows pins for everywhere you've added
  and lets you check the straight-line distance between any two places.
- **Checklist**: a flat shared list — anyone can add, check off, or delete
  items; it shows who added or checked each one.
- **Game**: a fresh 6x6 sun/moon logic puzzle every day, generated from
  the date itself (no external puzzle source, so it never runs out and
  needs no admin work). Everyone gets the exact same puzzle; results
  (solve time) and streaks are shared.

There's no login system — identity is just "which name did you tap" stored
on your own device, and the database is open to anyone with the app's link.
That's intentional for a 3-person trip app, but don't post the live link
publicly.
