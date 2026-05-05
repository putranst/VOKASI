import { createClient } from '@supabase/supabase-js';

// These environment variables should be set in .env.local
// Get them from: Supabase Dashboard → Settings → API
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase credentials not found. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

// Fallback to placeholder values for build time or if env vars are missing
// The client will not work without valid credentials, but the build will succeed.
let url = supabaseUrl || 'https://placeholder.supabase.co';
let key = supabaseAnonKey || 'placeholder-key';

try {
    new URL(url);
} catch {
    console.warn('Supabase URL is invalid. Falling back to placeholder.');
    url = 'https://placeholder.supabase.co';
    key = 'placeholder-key';
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(url, key);
