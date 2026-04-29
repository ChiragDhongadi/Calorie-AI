import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rmbyddamnwoobmutwtql.supabase.co';
const supabaseAnonKey = 'sb_publishable_Y3Pf_PzMnLLD1NPqJqHUfA_yahKManX';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
