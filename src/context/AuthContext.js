import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Enforce a minimum 2.5 second delay so the splash screen animation is visible
        const [authResponse] = await Promise.all([
          supabase.auth.getSession(),
          new Promise(resolve => setTimeout(resolve, 2500))
        ]);
        
        const { data, error } = authResponse;
        
        if (mounted) {
          if (error) console.error('Supabase getSession error:', error.message);
          setUser(data?.session?.user ?? null);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    // Fallback timer just in case Supabase hangs
    const timer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (mounted) setUser(session?.user ?? null);
      });
      subscription = data?.subscription;
    } catch (err) {
      console.error('Auth subscription error:', err);
    }

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password, fullName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    // Supabase enables "Email Enumeration Protection" by default. 
    // This means it will secretly pretend a signup succeeded even if the email exists!
    // We can detect an existing account if identities is an empty array.
    if (data?.user && data.user.identities && data.user.identities.length === 0) {
      return { error: { message: 'This email is already registered. Please sign in instead.' } };
    }

    return { data, error };
  };

  const signInWithOAuth = async (provider) => {
    try {
      // Use expo deep linking URL for successful return
      const redirectUrl = Linking.createURL('');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        }
      });
      
      if (error) return { error };

      // Open Android/iOS native browser window securely
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        // Parse that hash for the access token Supabase provides!
        const urlParams = new URLSearchParams(res.url.split('#')[1]);
        const access_token = urlParams.get('access_token');
        const refresh_token = urlParams.get('refresh_token');

        if (access_token && refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token,
            refresh_token,
          });
          if (sessionError) return { error: sessionError };
        } else {
          return { error: { message: "Could not retrieve access token from Provider." } };
        }
      } else if (res.type === 'cancel') {
        return { error: { message: "User cancelled the login." } };
      }
      
      return { data: true };
    } catch (e) {
      if (e.message?.includes('provider is not enabled')) {
        return { error: { message: "Google/Facebook login is not enabled in your Supabase Dashboard. Please go to Authentication -> Providers to enable them." } };
      }
      return { error: e };
    }
  };

  const signInWithGoogle = () => signInWithOAuth('google');
  const signInWithFacebook = () => signInWithOAuth('facebook');

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signInWithFacebook, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
