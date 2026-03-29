import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon key
const supabaseUrl = 'https://gnzzjmxexewtjdpnoxpe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImduenpqbXhleGV3dGpkcG5veHBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MzI0NjAsImV4cCI6MjA5MDEwODQ2MH0.sD3WEqnGduwcRsE2caZIprDzBdGXeTe-Dy6qP__EPwg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
