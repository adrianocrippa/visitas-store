// src/supabase.js//
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Se já existir window.__supabase, reutiliza; senão cria e guarda
const supabase =
  window.__supabase ||
  createClient(SUPABASE_URL, SUPABASE_KEY);

if (!window.__supabase) {
  window.__supabase = supabase;
}

export { supabase };
