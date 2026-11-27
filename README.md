# FUSHA

FUSHA brings trip planning, the equipment guide, and user accounts together in one app. The current release includes trip participation, budgets, packing lists, and used equipment listings.

## Run the app

1. Use Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and add the team's Supabase URL and publishable key.
3. Run `npm run dev` and open the local URL from the terminal.

Use `npm run lint` and `npm run build` to check the app. The shared Supabase project already has the Trips and Equipment tables. The SQL files document setup for separate environments.
