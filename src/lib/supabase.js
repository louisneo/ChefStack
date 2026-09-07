import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Custom safe fetch to gracefully intercept network & unresolvable DNS failures before browser fetch
const safeFetch = async (input, init) => {
  const urlStr = typeof input === 'string' ? input : input?.url || '';
  
  // If URL is an unresolvable placeholder or dead domain, return immediate offline response without triggering browser DNS error
  if (urlStr.includes('placeholder.supabase.co') || urlStr.includes('gnzzjmxewwtidpnoxspe.supabase.co')) {
    return new Response(
      JSON.stringify({ error: 'Offline mode active', message: 'Supabase offline' }),
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    return await fetch(input, init);
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Network unreachable', message: 'Offline mode active' }),
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // Prevents background token refresh retry loops on dead endpoints
    persistSession: true,
    detectSessionInUrl: false,
    lock: false, // Prevents @supabase/gotrue-js navigator lock acquisition warnings
  },
  global: {
    fetch: safeFetch,
  },
});


