import { createClient } from '@supabase/supabase-js';

const timesheetSupabaseUrl = import.meta.env.VITE_TIMESHEET_SUPABASE_URL;
const timesheetSupabaseAnonKey = import.meta.env.VITE_TIMESHEET_SUPABASE_ANON_KEY;

if (!timesheetSupabaseUrl || !timesheetSupabaseAnonKey) {
  // Ne jamais lancer une exception ici : ce module est importé par les pages
  // /timesheet. Une erreur non interceptée à ce niveau ferait planter le
  // rendu de toutes les pages, pas seulement /timesheet.
  console.error(
    'Variables Supabase manquantes : VITE_TIMESHEET_SUPABASE_URL / VITE_TIMESHEET_SUPABASE_ANON_KEY. Les fonctionnalités liées à /timesheet (auth, données) ne fonctionneront pas.',
  );
}

export const timesheetSupabase = createClient(
  timesheetSupabaseUrl || 'https://placeholder.supabase.co',
  timesheetSupabaseAnonKey || 'placeholder-anon-key',
);
