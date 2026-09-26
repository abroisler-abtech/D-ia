import { createClient } from '@supabase/supabase-js';

// Vai buscar as chaves que guardámos nas variáveis de ambiente
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn("Aviso: As credenciais do Supabase não estão configuradas.");
}

// Cria e exporta o cliente para ser usado pela Déia
export const supabase = createClient(supabaseUrl, supabaseKey);
