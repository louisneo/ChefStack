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

    const startTime = Date.now();

    const initializeAuth = async () => {
      try {
        const getSessionPromise = supabase.auth.getSession().catch(() => null);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve(null), 600));
        
        const [authResponse, cachedOfflineUser] = await Promise.all([
          Promise.race([getSessionPromise, timeoutPromise]),
          AsyncStorage.getItem(OFFLINE_USER_KEY).catch(() => null),
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
        console.log('Auth init offline fallback:', err);
        const cachedOfflineUser = await AsyncStorage.getItem(OFFLINE_USER_KEY).catch(() => null);
        if (mounted && cachedOfflineUser) {
          setUser(JSON.parse(cachedOfflineUser));
        }
      } finally {
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, 1800 - elapsed);
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, remainingDelay);
      }
    };

    initializeAuth();

    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 2000);

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
      console.log('Auth subscription offline notice:', err);
    }

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Network connection failed. Please check internet connection.')), 4000)
      );

      const { data, error } = await Promise.race([signInPromise, timeoutPromise]);
      if (data?.user) {
        await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(data.user)).catch(() => {});
      }
      return { data, error };
    } catch (err) {
      return { data: null, error: { message: 'Unable to connect to online server. Would you like to enter Offline Mode?' } };
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
        setTimeout(() => reject(new Error('Signup request timed out. Please check your connection.')), 5000)
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
    
    // Check if network is offline or unresolvable
    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (isOnline) {
      try {
        const guestPromise = supabase.auth.signInAnonymously();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Offline guest mode')), 1200));
        const res = await Promise.race([guestPromise, timeoutPromise]);
        if (res && !res.error && res.data?.user) {
          await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(res.data.user)).catch(() => {});
          setUser(res.data.user);
          return { data: res.data, error: null };
        }
      } catch (err) {
        console.log('Online guest login unavailable, instantly activating offline guest mode');
      }
    }

    // Offline / Fallback local guest account
    const offlineGuestUser = {
      id: 'guest-offline-mode',
      email: 'guest@chefstack.local',
      is_anonymous: true,
      is_offline_guest: true,
      user_metadata: { full_name: 'Offline Chef' }
    };
    await AsyncStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(offlineGuestUser)).catch(() => {});
    setUser(offlineGuestUser);
    return { data: { user: offlineGuestUser }, error: null };
  };

  const signOut = async () => {
    // 1. Immediately reset user state so UI updates instantly to LoginScreen
    setUser(null);

    // 2. Clear offline user cache
    try {
      await AsyncStorage.removeItem(OFFLINE_USER_KEY);
    } catch (e) {}

    // 3. Purge any stored Supabase session tokens from browser localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const keysToRemove = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('chefstack'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => window.localStorage.removeItem(k));
      } catch (e) {}
    }

    // 4. Non-blocking fire-and-forget remote Supabase logout with 500ms timeout
    try {
      const remoteLogout = supabase.auth.signOut();
      const timeout = new Promise(resolve => setTimeout(resolve, 500));
      await Promise.race([remoteLogout, timeout]);
    } catch (e) {}
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
