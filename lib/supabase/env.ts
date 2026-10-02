// Both values are public by design: the publishable key is safe in the browser. Never put the secret key here.
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const isSupabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
