// Safe Supabase client wrapper with fallback if package is not yet installed in node_modules

export interface MinimalSupabaseUser {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata: {
    full_name?: string;
    [key: string]: unknown;
  };
}

let client: unknown = undefined;

export function getSupabaseClient(): any {
  if (client !== undefined) return client;

  try {
    // Dynamic require so build doesn't fail if @supabase/supabase-js is not yet installed
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@supabase/supabase-js");
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    client = url && anonKey ? createClient(url, anonKey) : null;
  } catch {
    client = null;
  }

  return client;
}
