# Connect Trips to Supabase

Trips uses the existing FUSHA Supabase project and its join-request workflow. The shared database contains the validated `trips` and `trip_participants` tables and the `trip_budget_items` table.

1. Open the FUSHA project in the Supabase dashboard and select **Connect**. In `.env.local` beside `package.json`, set `VITE_SUPABASE_URL` to the **Project URL** and `VITE_SUPABASE_PUBLISHABLE_KEY` to the **Publishable key** that starts with `sb_publishable_`. Git ignores `.env.local`. Restart Vite after saving.
2. Run [inspect.sql](./inspect.sql) in the SQL editor to list columns, defaults, constraints, indexes, RLS policies, and function signatures and privileges. It reads PostgreSQL catalog metadata without returning user data or function bodies.
3. If the trip type and public participant count are missing on a target database, review [prepare_existing.sql](./prepare_existing.sql) with the team before applying it. It adds the type field, the approved participant count function, and the policy that uses the trip type to determine whether members can request to join. The shared FUSHA project already has these additions.
4. Test public trip browsing. Then create a trip as an organizer, submit a request from a second account, and approve or reject it from the organizer's account.

## Local test database

Set up Supabase Auth and a `public.profiles` table with a UUID `id` column in a disposable Supabase database. Use two test accounts with profile rows. Run [setup.sql](./setup.sql) in a database without the Trips tables or functions. It creates the tables, policies, and capacity checks used by Trips. Test the base workflow, then run [prepare_existing.sql](./prepare_existing.sql) in the same test database to verify trip types and public counts. The standalone Trips frontend expects an HTTPS Supabase URL and a publishable key.

## Sign-in integration

- The integrated app mounts `Trips` at `/trips/*` with `loginPath="/login"`. Visitors can browse trips. Create, Edit, and Request to join show a sign-in link when needed.
- The sign-in link passes the original route in `state.from`. After password sign-in, the shared form returns the user to the route they opened.
- Trips reuses the Auth client from `src/components/auth/supabaseClient.js` when it is present. The standalone branch uses its own configured Supabase client.

## Data contract

- `trips` stores the start and end times in `starts_at` and `ends_at`, the meeting point in `meeting_point`, and the participant limit in `capacity`. RLS lets the organizer edit and delete their trips. Only the organizer can see drafts. Published trips are publicly readable.
- `trip_participants` stores each join request with a `profile_id` and an initial state of `pending`. The organizer can approve or reject it. The unique constraint on `trip_id` and `profile_id` prevents duplicate requests. PostgreSQL locks the trip row before checking capacity during approval. Approved participants occupy seats. The organizer does not occupy a participant seat.
- The organizer can see the trip roster. Each participant can see their own request. `get_trip_approved_counts` returns counts for visible trips in batches of up to 100 IDs. Review the function together with the trip visibility policy if that policy changes.
- If the count lookup fails, the card shows capacity and the details show **Count unavailable**. A request can be cancelled while it remains pending. An approved participant can leave. If the state changes while the page is open, Trips refreshes it after the attempted action.
- Existing trips stay unclassified until the organizer chooses a type. The available types are `Individual`, `Family`, and `Group`. Only group trips accept new requests when a type is set. Unclassified trips retain the existing join-request workflow.
- The budget calculator runs in the browser. `trip_budget_items` is available for a future persistence feature.
