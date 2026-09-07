import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

// Custom safe fetch to gracefully intercept network & DNS failure (net::ERR_NAME_NOT_RESOLVED)
const safeFetch = async (input, init) => {
  try {
    return await fetch(input, init);
  } catch (err) {
    console.log('Supabase endpoint unreachable. Returning offline fallback response.');
    return new Response(
      JSON.stringify({ error: 'Network unreachable', message: 'Offline mode active' }),
      { status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' } }
    );
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false, // Prevents infinite background token refresh retry loops on dead DNS endpoints
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    fetch: safeFetch,
  },
});

