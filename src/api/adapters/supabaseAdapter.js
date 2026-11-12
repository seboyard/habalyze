import { db } from '@/api/base44Client';
/**
 * Adaptador futuro para Supabase.
 *
 * No crea un proyecto ni abre conexión. Si `VITE_DATA_ADAPTER=supabase`
 * y faltan las variables, el cliente vuelve al adaptador local y lo deja
 * escrito en consola.
 *
 * Contrato que debería implementar, el mismo que usa la UI (`db.*`):
 * - auth.me / isAuthenticated / updateMe / logout / redirectToLogin
 * - entities.<Nombre>.filter(query, sort, limit)
 * - entities.<Nombre>.list(sort, limit)
 * - entities.<Nombre>.create / update / delete
 * - functions.invoke(name, payload) -> { data }
 * - integrations.Core.InvokeLLM / UploadFile / SendEmail
 * - agents.listConversations / createConversation / addMessage / subscribeToConversation
 *
 * Tablas sugeridas (una por entidad de `base44/entities`, más `profiles`
 * para el usuario). La sesión de Supabase Auth sustituye a `db.auth`.
 * Las funciones de `base44/functions` que hablan con PayPal, Telegram o
 * correo siguen siendo trabajo de servidor: Edge Functions, no el cliente.
 */
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

export function createSupabaseAdapter() {
  throw new Error(
    'El adaptador Supabase está solo esbozado. Rellena VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY y sustituye createSupabaseAdapter por un cliente real. Mientras tanto Habalyze usa el adaptador local.',
  );
}
