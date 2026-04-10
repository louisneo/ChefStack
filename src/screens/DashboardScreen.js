import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
  BackHandler
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

// Components
import Header from '../components/Header';
import RecipeCard from '../components/RecipeCard';
import RecipeDetail from '../components/RecipeDetail';
import DeleteConfirmation from '../components/DeleteConfirmation';
import Toast from '../components/Toast';

// Context
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { useTheme } from '../context/ThemeContext';

export default function DashboardScreen({ navigation, route }) {
  const isFavoritesView = route?.params?.filterFavorites || false;
  const { user } = useAuth();
  const { colors } = useTheme();
  const { 
    recipes, 
    loading, 
    fetchRecipes, 
    openAddRecipe, 
    deleteRecipe, 
    toggleFavorite 
  } = useRecipes();
  
  const [refreshing, setRefreshing] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [sortDropdownVisible, setSortDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [deletingRecipe, setDeletingRecipe] = useState(null);
  
  // Dynamic dimension support for web/desktop responsiveness
  const { width } = useWindowDimensions();
  const numColumns = width >= 1200 ? 4 : width >= 768 ? 3 : 2;

  const toastRef = React.useRef(null);

  // Handle Android Hardware Back Button to return to Home Tab
  useFocusEffect(
    React.useCallback(() => {
      if (!isFavoritesView) return;

      const onBackPress = () => {
        navigation.navigate('Home');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [isFavoritesView, navigation])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRecipes();
    setRefreshing(false);
  };

  // Filter & Sort based on categories and search query
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if (isFavoritesView && !r.is_favorite) return false;
      const matchesCategory = categoryFilter === 'all' || r.category === categoryFilter;
      const matchesSearch = searchQuery === '' || 
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.ingredients && r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [recipes, isFavoritesView, categoryFilter, searchQuery]);
  
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      if (sortBy === 'newest') return (b.created_at || b.id).toString().localeCompare((a.created_at || a.id).toString()) > 0 ? 1 : -1;
      if (sortBy === 'oldest') return (a.created_at || a.id).toString().localeCompare((b.created_at || b.id).toString()) > 0 ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  }, [filteredRecipes, sortBy]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      <View style={styles.webDesktopPadding}>
        <FlatList
          key={`grid-${numColumns}`}
          data={sortedRecipes}
          keyExtractor={item => item.id.toString()}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? styles.row : null}
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
                <Text style={[styles.title, { color: colors.text }]}>
                  {isFavoritesView ? 'My Favorites' : 'Kitchen Stack'}
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {isFavoritesView ? 'Your most loved recipes.' : 'Manage your curated culinary creations.'}
                </Text>
              </View>

              {/* Search Bar */}
              <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search recipes or ingredients..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  underlineColorAndroid="transparent"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Scroller */}
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
                        { backgroundColor: colors.surface, borderColor: colors.borderLight },
                        categoryFilter === cat && { backgroundColor: colors.text, borderColor: colors.text }
                      ]}
                      onPress={() => setCategoryFilter(cat)}
                    >
                      <Text style={[
                        styles.filterText, 
                        { color: colors.textSecondary },
                        categoryFilter === cat && { color: colors.surface }
                      ]}>
                        {cat === 'all' ? 'All Recipes' : cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Sort Dropdown Button */}
              <View style={styles.sortRow}>
                <Ionicons name="filter" size={20} color={colors.textSecondary} />
                <Text style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort By</Text>
                
                <TouchableOpacity 
                  style={[styles.dropdownBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                  onPress={() => setSortDropdownVisible(true)}
                >
                  <Text style={[styles.dropdownBtnText, { color: colors.text }]}>
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
                <View style={[styles.emptyIconBg, { backgroundColor: colors.surface }]}>
                  <Ionicons name="book-outline" size={48} color={colors.border} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Recipes Yet</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Start building your recipe collection!</Text>
                <TouchableOpacity 
                  style={[styles.emptyBtn, { backgroundColor: colors.primary }]} 
                  onPress={() => openAddRecipe()}
                >
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={styles.emptyBtnText}>Add Your First Recipe</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
            )
          }
          renderItem={({ item }) => (
            <RecipeCard
              recipe={item}
              style={numColumns > 1 ? { width: `${100 / numColumns - 2}%`, marginRight: '2%' } : { width: '100%' }}
              onClick={() => setSelectedRecipe(item)}
              onEdit={() => openAddRecipe(item)}
              onDelete={() => setDeletingRecipe(item)}
              onToggleFavorite={() => toggleFavorite(item.id)}
            />
          )}
        />
      </View>

      {/* Modals */}
      <RecipeDetail
        recipe={selectedRecipe}
        visible={!!selectedRecipe}
        onClose={() => setSelectedRecipe(null)}
      />

      <DeleteConfirmation
        recipe={deletingRecipe}
        visible={!!deletingRecipe}
        onClose={() => setDeletingRecipe(null)}
        onConfirm={async () => {
          if (deletingRecipe) {
            const { error } = await deleteRecipe(deletingRecipe.id);
            if (error) {
              toastRef.current?.show('Failed to delete recipe', 'error');
            } else {
              toastRef.current?.show('Recipe deleted successfully', 'success');
            }
            setDeletingRecipe(null);
          }
        }}
      />

      <Toast ref={toastRef} />

      {/* Sort Dropdown Modal */}
      {sortDropdownVisible && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setSortDropdownVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
            {['newest', 'oldest', 'alpha'].map(s => (
              <TouchableOpacity 
                key={s} 
                style={[
                  styles.dropdownItem, 
                  sortBy === s && { backgroundColor: colors.primaryLight }
                ]}
                onPress={() => {
                  setSortBy(s);
                  setSortDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText, 
                  { color: colors.textSecondary },
                  sortBy === s && { color: colors.primary, fontWeight: '600' }
                ]}>
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
  },
  webDesktopPadding: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  titleContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    borderRadius: 15,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  categoryScrollerWrapper: {
    marginBottom: 20,
    marginHorizontal: -20,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 5,
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginRight: 10,
    borderWidth: 1,
  },
  filterPillActive: {
    // Colors handled dynamically
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    // Colors handled dynamically
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 10,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  dropdownBtnText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 8,
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dropdownMenu: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
  },
  dropdownItemActive: {
    // Handled dynamically
  },
  dropdownItemText: {
    fontSize: 16,
  },
  dropdownItemTextActive: {
    // Handled dynamically
  },
});
