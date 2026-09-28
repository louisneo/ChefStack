import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
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
import RecipeCardSkeleton from '../components/RecipeCardSkeleton';
import RecipeDetail from '../components/RecipeDetail';
import DeleteConfirmation from '../components/DeleteConfirmation';
import Toast from '../components/Toast';
import SearchInputWithSuggestions from '../components/SearchInputWithSuggestions';
import { standardizeCategory, STANDARD_CATEGORIES } from '../lib/categories';

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
    isOffline,
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
  const [maxCookingTime, setMaxCookingTime] = useState(0); // 0 means 'All'
  const [favoritesOnly, setFavoritesOnly] = useState(isFavoritesView);
  const [showFiltersPanel, setShowFiltersPanel] = useState(true);
  
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

  // Recipe title and ingredient suggestions for search bar autocomplete
  const recipeSuggestions = useMemo(() => {
    const suggestions = [];
    recipes.forEach(r => {
      if (r.title) suggestions.push(r.title);
      if (Array.isArray(r.ingredients)) {
        r.ingredients.forEach(i => {
          if (typeof i === 'string' && i.length > 2) suggestions.push(i);
        });
      }
    });
    return suggestions;
  }, [recipes]);

  // Filter & Sort based on categories, search query, max cooking time, and favorites
  const filteredRecipes = useMemo(() => {
    return recipes.filter(r => {
      if ((isFavoritesView || favoritesOnly) && !r.is_favorite) return false;

      const stdCat = standardizeCategory(r.category, r.title);
      const matchesCategory = categoryFilter === 'all' || stdCat.toLowerCase() === categoryFilter.toLowerCase();

      const matchesSearch = searchQuery === '' || 
        (r.title && r.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.ingredients && r.ingredients.some(i => i.toLowerCase().includes(searchQuery.toLowerCase())));

      const rTime = parseInt(r.time || 0, 10);
      const matchesTime = maxCookingTime === 0 || (rTime > 0 && rTime <= maxCookingTime);

      return matchesCategory && matchesSearch && matchesTime;
    });
  }, [recipes, isFavoritesView, favoritesOnly, categoryFilter, searchQuery, maxCookingTime]);
  
  const sortedRecipes = useMemo(() => {
    return [...filteredRecipes].sort((a, b) => {
      if (sortBy === 'newest') return (b.created_at || b.id).toString().localeCompare((a.created_at || a.id).toString()) > 0 ? 1 : -1;
      if (sortBy === 'oldest') return (a.created_at || a.id).toString().localeCompare((b.created_at || b.id).toString()) > 0 ? 1 : -1;
      return a.title.localeCompare(b.title);
    });
  }, [filteredRecipes, sortBy]);

  const showSkeletons = loading && !refreshing;
  const dataToRender = showSkeletons 
    ? Array.from({ length: 6 }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true })) 
    : sortedRecipes;

  const categoryIcons = {
    'all': 'sparkles',
    'Ulam': 'restaurant-outline',
    'Meryenda': 'cafe-outline',
    'Drinks': 'beer-outline',
    'Dessert': 'ice-cream-outline',
    'Appetizer': 'fast-food-outline',
    'Soup': 'nutrition-outline',
    'Breakfast': 'sunny-outline',
    'Pasta & Noodles': 'pizza-outline',
    'Seafood': 'fish-outline',
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      
      <View style={styles.webDesktopPadding}>
        <FlatList
          key={`grid-${numColumns}`}
          data={dataToRender}
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
              {isOffline && (
                <View style={styles.offlineBanner}>
                  <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.offlineBannerText}>Offline Mode - Serving cached recipes</Text>
                </View>
              )}

              <View style={styles.headerTitleRow}>
                <View style={styles.titleContainer}>
                  <Text style={[styles.title, { color: colors.text }]}>
                    {isFavoritesView ? 'My Favorites' : 'Kitchen Stack'}
                  </Text>
                  <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {filteredRecipes.length} {filteredRecipes.length === 1 ? 'recipe' : 'recipes'} found in your stack
                  </Text>
                </View>

                {/* Filters Toggle Button (Matches screenshot design) */}
                <TouchableOpacity 
                  style={[styles.filtersToggleBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
                  onPress={() => setShowFiltersPanel(!showFiltersPanel)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="options-outline" size={18} color={colors.text} />
                  <Text style={[styles.filtersToggleText, { color: colors.text }]}>Filters</Text>
                </TouchableOpacity>
              </View>

              {/* Search Bar with Instant Autocomplete Suggestions */}
              <SearchInputWithSuggestions
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search recipes or ingredients..."
                customSuggestions={recipeSuggestions}
                containerStyle={{ marginBottom: 16 }}
              />

              {/* Comprehensive Filter Panel (Matches screenshot 3 & 4) */}
              {showFiltersPanel && (
                <View style={[styles.filterPanelCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                  <Text style={[styles.filterPanelTag, { color: colors.textSecondary }]}>AMENITIES & FILTERS</Text>

                  {/* Row 1: Category Pills with Icons */}
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterPillsRow}
                  >
                    {['all', ...STANDARD_CATEGORIES].map(cat => {
                      const isActive = categoryFilter === cat;
                      const icon = categoryIcons[cat] || 'restaurant-outline';
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.categoryFilterPill,
                            { backgroundColor: colors.background, borderColor: colors.borderLight },
                            isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                          ]}
                          onPress={() => setCategoryFilter(cat)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name={icon} size={15} color={isActive ? '#FFFFFF' : colors.textSecondary} style={{ marginRight: 6 }} />
                          <Text style={[
                            styles.categoryFilterText,
                            { color: colors.textSecondary },
                            isActive && { color: '#FFFFFF', fontWeight: '700' }
                          ]}>
                            {cat === 'all' ? 'All Recipes' : cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>

                  {/* Row 2: Controls (Favorites Toggle & Sort Dropdown) */}
                  <View style={styles.controlsRow}>
                    <TouchableOpacity
                      style={[
                        styles.quickTogglePill,
                        { backgroundColor: colors.background, borderColor: colors.borderLight },
                        favoritesOnly && { backgroundColor: colors.primary + '20', borderColor: colors.primary }
                      ]}
                      onPress={() => setFavoritesOnly(!favoritesOnly)}
                    >
                      <Ionicons name={favoritesOnly ? "heart" : "heart-outline"} size={16} color={favoritesOnly ? colors.primary : colors.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[
                        styles.quickToggleText,
                        { color: colors.textSecondary },
                        favoritesOnly && { color: colors.primary, fontWeight: '700' }
                      ]}>
                        Favorites Only
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.sortDropdownBtn, { backgroundColor: colors.background, borderColor: colors.borderLight }]} 
                      onPress={() => setSortDropdownVisible(true)}
                    >
                      <Ionicons name="filter-outline" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={[styles.sortDropdownText, { color: colors.text }]}>
                        {sortBy === 'alpha' ? 'A-Z' : sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
                      </Text>
                      <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                  </View>

                  {/* Row 3: Cooking Time Limit Slider & Preset Pills (Matches screenshot 4) */}
                  <View style={styles.cookingTimeSection}>
                    <View style={styles.cookingTimeHeaderRow}>
                      <Text style={[styles.cookingTimeLabel, { color: colors.textSecondary }]}>Max Cooking Time</Text>
                      <Text style={[styles.cookingTimeValue, { color: colors.primary }]}>
                        {maxCookingTime === 0 ? 'All Times' : `${maxCookingTime} mins`}
                      </Text>
                    </View>

                    {/* Interactive Cooking Time Slider Track */}
                    <View style={[styles.sliderTrackContainer, { marginHorizontal: 9 }]}>
                      <View style={[styles.sliderTrackBg, { backgroundColor: colors.borderLight }]} />
                      <View style={[
                        styles.sliderTrackFill, 
                        { 
                          backgroundColor: colors.primary,
                          width: maxCookingTime === 0 ? '100%' : `${Math.min(100, (maxCookingTime / 60) * 100)}%` 
                        }
                      ]} />
                      <View style={[
                        styles.sliderThumbDot, 
                        { 
                          backgroundColor: colors.primary,
                          left: maxCookingTime === 0 ? '100%' : `${Math.max(0, Math.min(100, (maxCookingTime / 60) * 100))}%`,
                          marginLeft: -9,
                        }
                      ]} />
                    </View>

                    {/* Cooking Time Preset Pills */}
                    <View style={styles.timePresetsRow}>
                      {[
                        { label: '15m', val: 15 },
                        { label: '30m', val: 30 },
                        { label: '45m', val: 45 },
                        { label: '60m', val: 60 },
                        { label: 'All', val: 0 }
                      ].map(t => (
                        <TouchableOpacity
                          key={t.label}
                          style={[
                            styles.timePresetPill,
                            { backgroundColor: colors.background, borderColor: colors.borderLight },
                            maxCookingTime === t.val && { backgroundColor: colors.primary, borderColor: colors.primary }
                          ]}
                          onPress={() => setMaxCookingTime(t.val)}
                        >
                          <Text style={[
                            styles.timePresetText,
                            { color: colors.textSecondary },
                            maxCookingTime === t.val && { color: '#FFFFFF', fontWeight: '700' }
                          ]}>
                            {t.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              )}
            </>
          }
          ListEmptyComponent={
            <Animated.View entering={FadeInUp.duration(600)} style={styles.emptyContainer}>
              <View style={[styles.emptyIconBg, { backgroundColor: colors.surface }]}>
                <Ionicons name="book-outline" size={48} color={colors.border} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No Recipes Yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>Start building your recipe collection!</Text>
            </Animated.View>
          }
          renderItem={({ item }) => {
            if (item.isSkeleton) {
              return (
                <RecipeCardSkeleton
                  style={numColumns > 1 ? { width: `${100 / numColumns - 2}%`, marginRight: '2%' } : { width: '100%' }}
                />
              );
            }
            return (
              <RecipeCard
                recipe={item}
                style={numColumns > 1 ? { width: `${100 / numColumns - 2}%`, marginRight: '2%' } : { width: '100%' }}
                onClick={() => setSelectedRecipe(item)}
                onEdit={() => openAddRecipe(item)}
                onDelete={() => setDeletingRecipe(item)}
                onToggleFavorite={() => toggleFavorite(item.id)}
              />
            );
          }}
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  webDesktopPadding: {
    flex: 1,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 120,
  },
  row: {
    justifyContent: 'flex-start',
    marginBottom: 15,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  filtersToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  filtersToggleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterPanelCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 20,
  },
  filterPanelTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  filterPillsRow: {
    paddingBottom: 10,
    gap: 8,
  },
  categoryFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryFilterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
    gap: 10,
  },
  quickTogglePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  quickToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sortDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  sortDropdownText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cookingTimeSection: {
    marginTop: 4,
  },
  cookingTimeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cookingTimeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  cookingTimeValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  sliderTrackContainer: {
    height: 24,
    justifyContent: 'center',
    marginBottom: 10,
    position: 'relative',
  },
  sliderTrackBg: {
    height: 6,
    borderRadius: 3,
    width: '100%',
    position: 'absolute',
  },
  sliderTrackFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
  },
  sliderThumbDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    position: 'absolute',
    top: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  timePresetsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  timePresetPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  timePresetText: {
    fontSize: 12,
    fontWeight: '600',
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
  dropdownItemText: {
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
});
