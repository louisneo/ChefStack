import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext(null);
const OFFLINE_USER_KEY = '@chefstack_offline_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const [authResponse, cachedOfflineUser] = await Promise.all([
          supabase.auth.getSession().catch(() => null),
          AsyncStorage.getItem(OFFLINE_USER_KEY).catch(() => null),
          new Promise(resolve => setTimeout(resolve, 2000))
        ]);
        
        if (mounted) {
          if (authResponse?.data?.session?.user) {
            setUser(authResponse.data.session.user);
          } else if (cachedOfflineUser) {
            setUser(JSON.parse(cachedOfflineUser));
          } else {
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        const cachedOfflineUser = await AsyncStorage.getItem(OFFLINE_USER_KEY).catch(() => null);
        if (mounted && cachedOfflineUser) {
          setUser(JSON.parse(cachedOfflineUser));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const timer = setTimeout(() => {
      if (mounted && loading) setLoading(false);
    }, 3000);

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (mounted) {
          if (session?.user) {
            setUser(session.user);
            await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(session.user)).catch(() => {});
          } else {
            const cached = await AsyncStorage.getItem(OFFLINE_USER_KEY).catch(() => null);
            if (cached) {
              const parsed = JSON.parse(cached);
              if (!parsed.is_offline_guest) {
                setUser(null);
                await AsyncStorage.removeItem(OFFLINE_USER_KEY).catch(() => {});
              }
            } else {
              setUser(null);
            }
          }
        }
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (data?.user) {
        await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(data.user)).catch(() => {});
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: { message: 'Network connection failed. Please check internet connection.' } };
    }
  };

  const signUp = async (email, password, fullName) => {
    console.log('AuthProvider: Beginning signUp for', email);
    try {
      const signupPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup request timed out. Please check your connection.')), 10000)
      );

      const { data, error } = await Promise.race([signupPromise, timeoutPromise]);

      if (error) {
        return { data: null, error };
      }

      if (data?.user && data.user.identities && data.user.identities.length === 0) {
        return { error: { message: 'This email is already registered. Please sign in instead.' } };
      }

      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  const signInAsGuest = async () => {
    console.log('AuthProvider: Beginning Guest Sign-in');
    try {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (!error && data?.user) {
        await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(data.user)).catch(() => {});
        return { data, error: null };
      }
    } catch (err) {
      console.log('Online guest login unavailable, switching to offline guest mode');
    }

    // Offline / Fallback local guest account
    const offlineGuestUser = {
      id: 'guest-offline-' + Date.now(),
      email: 'guest@chefstack.local',
      is_anonymous: true,
      is_offline_guest: true,
      user_metadata: { full_name: 'Guest Chef' }
    };
    await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineGuestUser)).catch(() => {});
    setUser(offlineGuestUser);
    return { data: { user: offlineGuestUser }, error: null };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    await AsyncStorage.removeItem(OFFLINE_USER_KEY).catch(() => {});
    setUser(null);
  };

  const resetPassword = async (email) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'chefstack://reset',
      });
      return { data, error };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInAsGuest, signOut, resetPassword }}>
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
