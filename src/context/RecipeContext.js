import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const RecipeContext = createContext();
const CACHE_KEY_PREFIX = '@chefstack_cached_recipes_';

export const RecipeProvider = ({ children }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  // Monitor connectivity status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  const openAddRecipe = (recipe = null) => {
    setEditingRecipe(recipe);
    setAddModalVisible(true);
  };

  const closeAddRecipe = () => {
    setEditingRecipe(null);
    setAddModalVisible(false);
  };

  // Cache recipes locally whenever they change
  useEffect(() => {
    if (user && recipes.length > 0) {
      AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${user.id}`, JSON.stringify(recipes)).catch(() => {});
    }
  }, [recipes, user]);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      return;
    }

    loadCachedRecipes(user.id);
    fetchRecipes();

    // Setup Supabase Realtime Subscription
    try {
      const channel = supabase.channel('schema-db-changes')
        .on(
          'postgres',
          { event: '*', schema: 'public', table: 'recipes', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setRecipes(prev => {
                if (prev.find(r => r.id === payload.new.id)) return prev;
                return [payload.new, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              setRecipes(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
            } else if (payload.eventType === 'DELETE') {
              setRecipes(prev => prev.filter(r => r.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (e) {
      console.log('Realtime subscription offline mode:', e);
    }
  }, [user]);

  const loadCachedRecipes = async (userId) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (cached) {
        setRecipes(JSON.parse(cached));
      }
    } catch (e) {
      console.log('Failed to load cached recipes:', e);
    }
  };

  const fetchRecipes = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('user_id', user.id);
        
      if (!error && data) {
        setRecipes(data);
        await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${user.id}`, JSON.stringify(data));
      }
    } catch (e) {
      console.log('Offline mode fetch fallback active');
    } finally {
      setLoading(false);
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const saveRecipe = async (recipeData) => {
    if (!user) return { error: new Error('User not logged in') };
    
    if (editingRecipe) {
      const optimisticUpdated = { ...editingRecipe, ...recipeData };
      setRecipes(prev => prev.map(r => r.id === optimisticUpdated.id ? optimisticUpdated : r));
      closeAddRecipe();
      
      try {
        const { error } = await supabase.from('recipes').update(recipeData).eq('id', optimisticUpdated.id);
        return { error };
      } catch (err) {
        return { error: null }; // Saved locally offline
      }
    } else {
      const newId = generateUUID(); 
      const optimisticRecipe = { ...recipeData, id: newId, user_id: user.id, is_favorite: false, created_at: new Date().toISOString() };
      setRecipes(prev => [optimisticRecipe, ...prev]);
      closeAddRecipe();
      
      try {
        const { error, data: savedData } = await supabase.from('recipes').insert([{ ...recipeData, id: newId, user_id: user.id }]).select();
        return { error, data: savedData };
      } catch (err) {
        return { error: null, data: [optimisticRecipe] };
      }
    }
  };

  const deleteRecipe = async (id) => {
    const originalRecipes = [...recipes];
    setRecipes(prev => prev.filter(r => r.id !== id));
    
    try {
      const { error } = await supabase.from('recipes').delete().eq('id', id);
      if (error) {
        setRecipes(originalRecipes);
      }
      return { error };
    } catch (e) {
      return { error: null };
    }
  };

  const toggleFavorite = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    setRecipes(prev => prev.map(r => r.id === id ? { ...r, is_favorite: !r.is_favorite } : r));
    try {
      const { error } = await supabase.from('recipes').update({ is_favorite: !recipe.is_favorite }).eq('id', id);
      return { error };
    } catch (e) {
      return { error: null };
    }
  };

  return (
    <RecipeContext.Provider value={{ 
      recipes, 
      setRecipes,
      loading, 
      isOffline,
      fetchRecipes, 
      addModalVisible, 
      openAddRecipe, 
      closeAddRecipe,
      editingRecipe,
      saveRecipe,
      deleteRecipe,
      toggleFavorite
    }}>
      {children}
    </RecipeContext.Provider>
  );
};

export const useRecipes = () => useContext(RecipeContext);

