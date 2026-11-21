import { createClient } from "@supabase/supabase-js";

// The team app uses one Supabase session. The Trips-only branch can still run on its own.
const teamClients = import.meta.glob("../components/auth/supabaseClient.js", {
  eager: true,
  import: "supabase",
});
const teamSupabase = teamClients["../components/auth/supabaseClient.js"];
const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

function createTripClient() {
  if (!projectUrl || !publishableKey?.startsWith("sb_publishable_")) return null;

  try {
    const url = new URL(projectUrl);
    if (url.protocol !== "https:") return null;

    return createClient(url.origin, publishableKey);
  } catch {
    return null;
  }
}

export const tripSupabase = teamSupabase ?? createTripClient();
