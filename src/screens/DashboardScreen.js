import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';

// Components
import Header from '../components/Header';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import AddRecipeModal from '../components/AddRecipeModal';
import DeleteConfirmation from '../components/DeleteConfirmation';

export default function DashboardScreen({ navigation, route }) {
  const isFavoritesView = route?.params?.filterFavorites || false;
  const { user } = useAuth();
  
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [categoryFilter, setCategoryFilter] = useState('all'); // categories or all
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alpha
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  
  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);

  useEffect(() => {
    if (!user) return;
    
    // Initial fetch
    fetchRecipes();

    // Setup Supabase Realtime Subscription!
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres',
        { event: '*', schema: 'public', table: 'recipes', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setRecipes(prev => {
              // Prevent duplicates if our local optimistic update already added it
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
    setLoading(true);
    // Grab all recipes for this user 
    const { data: myData, error: myError } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id);
      
    if (!myError && myData) {
      setRecipes(myData);
    } else if (myError) {
      console.error("error fetching stuff:", myError);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  // Filter & Sort based on new full-category filter
  const filteredRecipes = recipes.filter(r => {
    if (isFavoritesView && !r.is_favorite) return false;
    return categoryFilter === 'all' || r.category === categoryFilter;
  });
  
  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === 'newest') return (b.created_at || b.id) > (a.created_at || a.id) ? 1 : -1;
    if (sortBy === 'oldest') return (a.created_at || a.id) > (b.created_at || b.id) ? 1 : -1;
    return a.title.localeCompare(b.title);
  });

  const handleSaveRecipe = async (recipeData) => {
    setAddModalVisible(false);
    
    if (editingRecipe) {
      // 1. Optimistic Update (Instant UI)
      const optimisticUpdated = { ...editingRecipe, ...recipeData };
      setRecipes(prev => prev.map(r => r.id === optimisticUpdated.id ? optimisticUpdated : r));
      setEditingRecipe(null);
      
      // 2. Background Sync
      const { error } = await supabase.from('recipes').update(recipeData).eq('id', optimisticUpdated.id);
      if (error) Alert.alert('Error', error.message);
    } else {
      // 1. Optimistic Insert (Instant Sync)
      const tempId = Date.now(); 
      const optimisticRecipe = { ...recipeData, id: tempId, user_id: user.id, is_favorite: false, created_at: new Date().toISOString() };
      setRecipes(prev => [optimisticRecipe, ...prev]);
      
      // 2. Background Sync
      const { error } = await supabase.from('recipes').insert([{ ...recipeData, user_id: user.id }]);
      if (error) Alert.alert('Error', error.message);
    }
  };

  const handleDeleteRecipe = async (id) => {
    // 1. Optimistic Delete (Instant UI)
    setRecipes(prev => prev.filter(r => r.id !== id));
    setDeletingRecipe(null);

    // 2. Background Sync
    const { error } = await supabase.from('recipes').delete().eq('id', id);
    if (error) Alert.alert('Error', error.message);
  };

  const handleToggleFavorite = async (id) => {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;

    // 1. Optimistic Toggle (Instant UI)
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, is_favorite: !r.is_favorite } : r));

    // 2. Background Sync
    await supabase.from('recipes').update({ is_favorite: !recipe.is_favorite }).eq('id', id);
  };

  return (
    <View style={styles.container}>
      <Header 
        onMenuClick={() => navigation.openDrawer()} 
        onAddClick={() => { setEditingRecipe(null); setAddModalVisible(true); }}
      />
      
      <FlatList
        data={sortedRecipes}
        keyExtractor={item => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[colors.primary]} 
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>{isFavoritesView ? 'My Favorites' : 'Kitchen Stack'}</Text>
              <Text style={styles.subtitle}>
                {isFavoritesView ? 'Your most loved recipes.' : 'Manage your curated culinary creations.'}
              </Text>
            </View>

            {/* Food Panda Style Category Scroller */}
            <View style={styles.categoryScrollerWrapper}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {['all', 'Ulam', 'Meryenda', 'Drinks', 'Dessert', 'Appetizer', 'Soup', 'Breakfast'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterPill, 
                      categoryFilter === cat && styles.filterPillActive
                    ]}
                    onPress={() => setCategoryFilter(cat)}
                  >
                    <Text style={[styles.filterText, categoryFilter === cat && styles.filterTextActive]}>
                      {cat === 'all' ? 'All Recipes' : cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Sort Dropdown Button */}
            <View style={styles.sortRow}>
              <Ionicons name="filter" size={20} color={colors.textSecondary} />
              <Text style={styles.sortLabel}>Sort By</Text>
              
              <TouchableOpacity 
                style={styles.dropdownBtn} 
                onPress={() => setSortDropdownVisible(true)}
              >
                <Text style={styles.dropdownBtnText}>
                  {sortBy === 'alpha' ? 'A-Z' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.text} />
              </TouchableOpacity>
            </View>
          </>
        }
        ListEmptyComponent={
          !loading ? (
            <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
              <View style={styles.emptyIconBg}>
                <Ionicons name="book-outline" size={48} color={colors.border} />
              </View>
              <Text style={styles.emptyTitle}>No Recipes Yet</Text>
              {/* Need to encourage users to add stuff here haha */}
              <Text style={styles.emptySubtitle}>Start building your recipe collection!</Text>
              <TouchableOpacity 
                style={styles.emptyBtn} 
                onPress={() => { setEditingRecipe(null); setAddModalVisible(true); }}
              >
                <Ionicons name="add" size={20} color={colors.surface} />
                <Text style={styles.emptyBtnText}>Add Your First Recipe</Text>
              </TouchableOpacity>
            </Animated.View>
          ) : (
            // Just a basic spinner while supabase thinks
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
          )
        }
        renderItem={({ item, index }) => (
          <RecipeCard
            recipe={item}
            onClick={() => setSelectedRecipe(item)}
            onEdit={() => { setEditingRecipe(item); setAddModalVisible(true); }}
            onDelete={() => setDeletingRecipe(item)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
          />
        )}
      />

      {/* Modals */}
      <RecipeDetail
        recipe={selectedRecipe}
        visible={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      <AddRecipeModal
        visible={addModalVisible}
        onClose={() => { setAddModalVisible(false); setEditingRecipe(null); }}
        onSave={handleSaveRecipe}
        editingRecipe={editingRecipe}
      />

      <DeleteConfirmation
        recipe={deletingRecipe}
        visible={!!deletingRecipe}
        onClose={() => setDeletingRecipe(null)}
        onConfirm={handleDeleteRecipe}
      />

      {/* Sort Dropdown Modal */}
      {sortDropdownVisible && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setSortDropdownVisible(false)}
        >
          <View style={styles.dropdownMenu}>
            {['newest', 'oldest', 'alpha'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[styles.dropdownItem, sortBy === s && styles.dropdownItemActive]}
                onPress={() => {
                  setSortBy(s);
                  setSortDropdownVisible(false);
                }}
              >
                <Text style={[styles.dropdownItemText, sortBy === s && styles.dropdownItemTextActive]}>
                  {s === 'alpha' ? 'A-Z' : s.charAt(0).toUpperCase() + s.slice(1)}
                </Text>
                {sortBy === s && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
  },
  titleContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  categoryScrollerWrapper: {
    marginHorizontal: -20, // Negative margin allows ScrollView to stretch to screen edges but contain initial padding
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 20, // Add padding inside ScrollView so it aligns with content
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterPillActive: {
    backgroundColor: colors.text,
    borderColor: colors.text,
  },
  filterText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTextActive: {
    color: colors.surface,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 4,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: 8,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: 200,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dropdownItemActive: {
    backgroundColor: colors.primaryLight,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIconBg: {
    width: 96,
    height: 96,
    backgroundColor: colors.borderLight,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    gap: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  }
});
