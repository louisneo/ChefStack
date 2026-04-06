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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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
