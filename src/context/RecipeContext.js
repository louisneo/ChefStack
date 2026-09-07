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

  const DEFAULT_STARTER_RECIPES = [
    {
      id: 'demo-1',
      title: 'Classic Pork Adobo',
      category: 'Ulam',
      type: 'food',
      time: 45,
      ingredients: ['1kg Pork Belly', '1/2 cup Soy Sauce', '1/2 cup Vinegar', 'Garlic', 'Bay Leaves', 'Peppercorn'],
      steps: ['Marinate pork in soy sauce and garlic.', 'Brown pork in a pot.', 'Simmer with bay leaves and vinegar until tender.'],
      is_favorite: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'demo-2',
      title: 'Creamy Carbonara',
      category: 'Meryenda',
      type: 'food',
      time: 25,
      ingredients: ['400g Spaghetti', '200g Bacon', '3 Egg Yolks', 'Parmesan Cheese', 'Heavy Cream'],
      steps: ['Boil pasta until al dente.', 'Fry bacon until crisp.', 'Toss pasta with bacon, eggs, and cheese.'],
      is_favorite: false,
      created_at: new Date().toISOString()
    }
  ];

  const loadCachedRecipes = async (userId) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_KEY_PREFIX}${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.length > 0) {
          setRecipes(parsed);
          return true;
        }
      }
    } catch (e) {
      console.log('Failed to load cached recipes:', e);
    }
    return false;
  };

  const fetchRecipes = async () => {
    if (!user) return;
    setLoading(true);

    // Offline guest user bypasses Supabase network calls
    if (user.is_offline_guest) {
      const hasCached = await loadCachedRecipes(user.id);
      if (!hasCached && recipes.length === 0) {
        setRecipes(DEFAULT_STARTER_RECIPES);
      }
      setLoading(false);
      return;
    }

    try {
      // Race Supabase fetch against a 3.5s timeout
      const fetchPromise = supabase.from('recipes').select('*').eq('user_id', user.id);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 3500));

      const res = await Promise.race([fetchPromise, timeoutPromise]);

      if (res && !res.timeout && !res.error && res.data) {
        setRecipes(res.data);
        await AsyncStorage.setItem(`${CACHE_KEY_PREFIX}${user.id}`, JSON.stringify(res.data)).catch(() => {});
      } else {
        const hasCached = await loadCachedRecipes(user.id);
        if (!hasCached && recipes.length === 0) {
          setRecipes(DEFAULT_STARTER_RECIPES);
        }
      }
    } catch (e) {
      console.log('Offline mode fetch fallback active:', e);
      const hasCached = await loadCachedRecipes(user.id);
      if (!hasCached && recipes.length === 0) {
        setRecipes(DEFAULT_STARTER_RECIPES);
      }
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

