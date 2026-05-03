import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from './types';

const SUPABASE_URL = 'https://ayyymtckmbaemgtkssgd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5eXltdGNrbWJhZW1ndGtzc2dkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2NDk2MDksImV4cCI6MjA5MzIyNTYwOX0.aTIjqNrawCPsiuDv_Ur-G2vUO2XFdsATQ-M_q6tnGBA'; // Ersätt med din nyckel från Supabase dashboard

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
