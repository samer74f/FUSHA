# FUSHA

FUSHA brings trip planning, the equipment guide, and user accounts together in one app. The current release includes trip participation, budgets, packing lists, and used equipment listings.

## Run the app

1. Use Node.js 24 and run `npm ci`.
2. Copy `.env.example` to `.env.local` and add the team's Supabase URL and publishable key.
3. Run `npm run dev` and open the local URL from the terminal.

Use `npm run lint` and `npm run build` to check the app.

## Equipment database setup

The shared FUSHA Supabase project already has `equipment`, `packing_templates`, and `packing_items`. The [equipment setup migration](supabase/migrations/20261121172100_equipment.sql) creates and seeds those tables for a new database only.

For the contact-email feature, apply the [additive contact migration](supabase/migrations/20261128190000_equipment_contact_email.sql) to the shared project before deploying the updated equipment UI. On a new database, run it after the setup migration. It adds a nullable column, so existing listings keep working. New listings require an email that the seller chooses to display publicly. Existing listings can add one when edited.
