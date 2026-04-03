import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

function isPlaceholderSupabaseKey(key: string) {
  const k = (key || '').trim();
  if (!k) return true;
  if (k.includes('seu-valor')) return true;
  if (k.startsWith('sb_')) return true;
  if (k === 'YOUR_SUPABASE_ANON_KEY') return true;
  return false;
}

export function getSupabaseConfigError(): string | null {
  if (!supabaseUrl) return 'Supabase: NEXT_PUBLIC_SUPABASE_URL não configurado.';
  if (!supabaseAnonKey) return 'Supabase: NEXT_PUBLIC_SUPABASE_ANON_KEY não configurado.';
  if (isPlaceholderSupabaseKey(supabaseAnonKey)) return 'Supabase: NEXT_PUBLIC_SUPABASE_ANON_KEY parece inválida.';
  return null;
}

const configError = getSupabaseConfigError();
if (configError) {
  console.warn(configError);
}

export const supabase: SupabaseClient | null = configError ? null : createClient(supabaseUrl, supabaseAnonKey);
