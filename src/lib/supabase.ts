import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Ne jamais lancer une exception ici : ce module est importé par AuthContext,
  // lui-même chargé par App.tsx pour tout le site. Une erreur non interceptée
  // à ce niveau ferait planter le rendu de toutes les pages, pas seulement /poi.
  console.error(
    'Variables Supabase manquantes : VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Les fonctionnalités liées à /poi (auth, données) ne fonctionneront pas.',
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
);
