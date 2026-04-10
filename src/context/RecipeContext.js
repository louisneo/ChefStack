import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const RecipeContext = createContext();

export const RecipeProvider = ({ children }) => {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    if (!user) {
      setRecipes([]);
      return;
    }

    fetchRecipes();

    // Setup Supabase Realtime Subscription!
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
  }, [user]);

  const fetchRecipes = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id);
      
    if (!error && data) {
      setRecipes(data);
    }
    setLoading(false);
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
      // Update
      const optimisticUpdated = { ...editingRecipe, ...recipeData };
      setRecipes(prev => prev.map(r => r.id === optimisticUpdated.id ? optimisticUpdated : r));
      closeAddRecipe();
      
      const { error } = await supabase.from('recipes').update(recipeData).eq('id', optimisticUpdated.id);
      return { error };
    } else {
      // Insert
      const newId = generateUUID(); 
      const optimisticRecipe = { ...recipeData, id: newId, user_id: user.id, is_favorite: false, created_at: new Date().toISOString() };
      setRecipes(prev => [optimisticRecipe, ...prev]);
      closeAddRecipe();
      
      const { error, data: savedData } = await supabase.from('recipes').insert([{ ...recipeData, id: newId, user_id: user.id }]).select();
      if (error) {
        setRecipes(prev => prev.filter(r => r.id !== newId));
      }
      return { error, data: savedData };
    }
  };

  const deleteRecipe = async (id) => {
    const originalRecipes = [...recipes];
    setRecipes(prev => prev.filter(r => r.id !== id));
    
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) {
      setRecipes(originalRecipes);
    }
    return { error };
  };

  const toggleFavorite = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    setRecipes(prev => prev.map(r => r.id === id ? { ...r, is_favorite: !r.is_favorite } : r));
    const { error } = await supabase.from('recipes').update({ is_favorite: !recipe.is_favorite }).eq('id', id);
    return { error };
  };

  return (
    <RecipeContext.Provider value={{ 
      recipes, 
      setRecipes,
      loading, 
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
