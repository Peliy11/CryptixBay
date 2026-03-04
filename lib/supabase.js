import { createClient } from '@supabase/supabase-js';

const url = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : null;
const anonKey = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : null;

export const isSupabaseConfigured = () => !!(url && anonKey);

export const supabase = isSupabaseConfigured() ? createClient(url, anonKey) : null;
