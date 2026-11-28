# FUSHA

FUSHA combines place discovery and reviews, trip planning, outdoor equipment, and a store. The app uses React, React Router v6, Vite, and one Supabase project. The navigation switches between English and Arabic.

## Run the app

1. Use Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env.local`. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the shared FUSHA project.
3. Run `npm run dev` and open the local URL from the terminal.

Run `npm run lint` and `npm run build` before opening a release pull request.

## Shared Supabase project

Confirm that the shared project already contains the FUSHA profiles, places and photos, Trips, Equipment, and Store tables and their access policies. A project administrator should review the schema and apply the missing updates in this order.

1. [Places reviews](supabase/migrations/20261127000100_place_reviews.sql) lets signed-in users manage their own review and shows ratings for published places.
2. [Safe Store checkout](supabase/migrations/20261127000200_safe_store_checkout.sql) checks the confirmed price and stock and protects order retries. This migration and the updated Store frontend belong in the same release.
3. [Used equipment contact](supabase/migrations/20261127090300_equipment_listing_contact.sql) adds a public contact field that listing owners can choose to fill.

The Store and Equipment baseline migrations are intended for environments missing those features. Apply the Store baseline before the safe checkout update. The [Trips setup guide](supabase/trips/README.md) documents its database checks.

Publish verified places and active products in Supabase to populate the public listings. The Store administration page is at `/admin/store` for users with the admin role in their Supabase app metadata.

## Netlify

Use `npm run build` as the build command and `dist` as the publish directory. Set both public Supabase environment variables for Production and Deploy Previews. Start a fresh build after changing the values. The rule in `public/_redirects` serves React routes on direct navigation.

Set the Supabase Auth Site URL to the production site and review the allowed redirects for email confirmation. Verify the public URL, Arabic and English layouts, account access, and data persistence. On a safe test project, also verify that replaying the same checkout returns a single order.
