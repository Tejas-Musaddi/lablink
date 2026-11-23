import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project')
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Quick diagnostic ping to test whether Supabase is reachable.
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      ok: false,
      message: 'Supabase credentials are not configured in environment variables (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).',
    };
  }

  try {
    const { error } = await supabase.from('departments').select('id').limit(1);
    if (error) {
      return {
        ok: false,
        message: `Supabase connection error: ${error.message} (Code: ${error.code})`,
      };
    }
    return {
      ok: true,
      message: 'Successfully connected to Supabase PostgreSQL database.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      message: `Failed to reach Supabase: ${msg}`,
    };
  }
}
