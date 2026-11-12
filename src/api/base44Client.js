import { canUseSupabase, createSupabaseDb } from './adapters/supabaseAdapter';
import { createLocalDb } from './local/createLocalDb';

function createDb() {
  const requested = import.meta.env.VITE_DATA_ADAPTER || 'local';
  if (requested === 'supabase') {
    if (!canUseSupabase()) {
      console.info('[Habalyze] VITE_DATA_ADAPTER=supabase sin URL o clave anónima. Se usa el adaptador local.');
      return createLocalDb();
    }
    return createSupabaseDb();
  }
  return createLocalDb();
}

export const db = createDb();
export const base44 = db;
export default db;

if (typeof globalThis !== 'undefined') {
  globalThis.__B44_DB__ = db;
}
