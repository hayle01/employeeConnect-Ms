import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !anon) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY");
}

export const supabase = createClient<Database>(url ?? "", anon ?? "");
