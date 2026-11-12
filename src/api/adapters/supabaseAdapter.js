import { createSupabaseAdapter } from '../supabase/createSupabaseAdapter';

export function supabaseConfig() {
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  };
}

export function canUseSupabase() {
  const { url, anonKey } = supabaseConfig();
  return Boolean(url && anonKey);
}

export function createSupabaseDb() {
  const { url, anonKey } = supabaseConfig();
  if (!url || !anonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
  }
  return createSupabaseAdapter({ url, anonKey });
}
