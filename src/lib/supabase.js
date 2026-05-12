import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON } from '../constants/api';

// Singleton — satu instance untuk seluruh aplikasi
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export default supabase;
