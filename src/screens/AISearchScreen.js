import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  BackHandler,
  Pressable
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useRecipes } from '../context/RecipeContext';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { searchRecipes, saveCustomApiKey, getCustomApiKey, searchLocalRecipes, generateSmartRecipes } from '../services/aiService';
import { Modal } from 'react-native';
import Toast from '../components/Toast';
import AISearchCardSkeleton from '../components/AISearchCardSkeleton';
import SearchInputWithSuggestions from '../components/SearchInputWithSuggestions';
import { standardizeCategory } from '../lib/categories';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

export default function AISearchScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { recipes: storedRecipes, saveRecipe } = useRecipes();
  const { user } = useAuth();
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [isOfflineSearch, setIsOfflineSearch] = useState(false);
  const [needsApiKey, setNeedsApiKey] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [importing, setImporting] = useState(null);

  const toastRef = useRef(null);

  useEffect(() => {
    getCustomApiKey().then(k => {
      if (k) setInputApiKey(k);
    });
  }, []);



  // Handle Android Hardware Back Button to return to Home Tab
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; 
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  const handleSaveKey = async () => {
    await saveCustomApiKey(inputApiKey);
    setShowKeyModal(false);
    toastRef.current?.show('API Key saved! Try searching now.', 'success');
    if (query.trim()) {
      handleSearch(query);
    }
  };

  const handleSearch = async (overrideQuery) => {
    const searchQuery = (typeof overrideQuery === 'string' ? overrideQuery : query).trim();
    if (!searchQuery) return;
    
    setShowSuggestions(false);
    setLoading(true);
    setSearchError(null);
    setIsOfflineSearch(false);
    setNeedsApiKey(false);
    setResults([]);
    setCurrentPage(1);

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    if (!isOnline) {
      const localMatches = searchLocalRecipes(storedRecipes, searchQuery);
      setIsOfflineSearch(true);
      if (localMatches.length > 0) {
        setResults(localMatches);
      } else {
        setSearchError("Offline Mode: No matching recipes found in your saved local index.");
      }
      setLoading(false);
      return;
    }

    try {
      const { recipes, isFood, error, needsApiKey: reqKey, isFallback } = await searchRecipes(searchQuery);
      if (recipes && recipes.length > 0) {
        setResults(recipes);
        setSearchError(null);
        if (isFallback) {
          toastRef.current?.show('Displaying authentic offline AI recipes', 'info');
        }
      } else {
        const localMatches = searchLocalRecipes(storedRecipes, searchQuery);
        if (localMatches.length > 0) {
          setIsOfflineSearch(true);
          setResults(localMatches);
          setSearchError(null);
        } else {
          setSearchError(`No authentic food recipes found for "${searchQuery}". Please try searching for a real dish or ingredient.`);
        }
      }
    } catch (error) {
      console.warn("AISearchScreen handleSearch error:", error);
      const fallbackRecipes = generateSmartRecipes(searchQuery);
      if (fallbackRecipes.length > 0) {
        setResults(fallbackRecipes);
        setSearchError(null);
        toastRef.current?.show('Displaying authentic offline AI recipes', 'info');
      } else {
        setSearchError("Unable to complete AI search. Please try another query.");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleImport = async (recipe, index) => {
    if (!user) {
      Alert.alert('Login required', 'Please sign in to save recipes.');
      return;
    }

    setImporting(index);
    try {
      const stdCat = standardizeCategory(recipe.category, recipe.title);
      const cleanRecipe = {
        title: recipe.title,
        category: stdCat,
        type: stdCat === 'Drinks' ? 'drink' : 'food',
        time: parseInt(recipe.time || 20, 10) || 20,
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || recipe.instructions || [],
        image: null,
        is_favorite: false
      };

      const { error } = await saveRecipe(cleanRecipe);

      if (error) throw error;
      
      toastRef.current?.show(`${recipe.title} imported successfully!`);
      
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1000);
    } catch (error) {
      toastRef.current?.show(error.message, 'error');
    } finally {
      setImporting(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.webWrapper}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>AI Recipe Finder</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Section */}
        <View style={[styles.searchSection, { backgroundColor: colors.surface }]}>
          <View style={styles.searchContainer}>
            <View style={[styles.disclaimerBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={[styles.disclaimerText, { color: colors.textSecondary }]}>
                AI recipes are generated automatically. Always verify raw ingredient freshness, cooking temperatures, and potential allergens.
              </Text>
            </View>

            {/* Live Autocomplete Search Bar */}
            <SearchInputWithSuggestions
              value={query}
              onChangeText={setQuery}
              placeholder="Search food, ingredients (e.g. oat, pasta, adobo)..."
              onSearch={(term) => handleSearch(term)}
              iconName="sparkles"
              iconColor={colors.primary}
              customSuggestions={storedRecipes.map(r => r.title)}
              containerStyle={{ marginBottom: 16 }}
            />

            <TouchableOpacity 
              style={[styles.searchBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={() => handleSearch()}
              disabled={loading}
              accessibilityLabel="Find Recipe button"
              accessibilityRole="button"
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.searchBtnText, { color: colors.surface }]}>Find Recipe</Text>
              )}
            </TouchableOpacity>

            {/* Quick Suggestion Chips */}
            <View style={styles.chipWrapper}>
              <Text style={[styles.chipSectionTitle, { color: colors.textSecondary }]}>Popular Suggestions:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {[
                  { label: '🥣 Oatmeal', term: 'Oatmeal' },
                  { label: '🐟 Kinilaw', term: 'Kinilaw' },
                  { label: '🍲 Sinigang', term: 'Sinigang' },
                  { label: '🍗 Adobo', term: 'Pork Adobo' },
                  { label: '🍳 Sisig', term: 'Pork Sisig' },
                  { label: '🍝 Carbonara', term: 'Carbonara' },
                  { label: '🍵 Matcha', term: 'Matcha Latte' }
                ].map(chip => (
                  <TouchableOpacity
                    key={chip.term}
                    style={[styles.suggestionChip, { backgroundColor: colors.background, borderColor: colors.borderLight }]}
                    onPress={() => {
                      setQuery(chip.term);
                      handleSearch(chip.term);
                    }}
                    accessibilityLabel={`Search for ${chip.term}`}
                    accessibilityRole="button"
                  >
                    <Text style={[styles.chipText, { color: colors.text }]}>{chip.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>

        {/* Results */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isOfflineSearch && results.length > 0 && (
            <Animated.View entering={FadeIn} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: 12, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.borderLight, gap: 10 }}>
              <Ionicons name="wifi-outline" size={20} color={colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textSecondary, flex: 1 }}>
                Offline Mode: Displaying matching recipes from your local index.
              </Text>
            </Animated.View>
          )}

          {searchError && !searchError.includes('GoogleGenerativeAI') && !searchError.includes('429') && !searchError.includes('Quota') && !loading && (
            <Animated.View entering={FadeIn} style={[styles.errorCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
              <Ionicons name="information-circle-outline" size={32} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.text }]}>{searchError}</Text>
            </Animated.View>
          )}

          {loading && (
            <>
              <AISearchCardSkeleton />
              <AISearchCardSkeleton />
              <AISearchCardSkeleton />
            </>
          )}

          {results.length === 0 && !loading && !searchError && (
            <View style={styles.emptyState}>
              <View style={[styles.aiIconWave, { backgroundColor: colors.primary + '15' }]}>
                 <Ionicons name="restaurant-outline" size={48} color={colors.primary} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Ask ChefStack AI</Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Type any food craving like "Filipino Sinigang" or "Chicken Carbonara"
              </Text>
            </View>
          )}

          {paginatedResults.map((recipe, index) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100)} 
              key={index} 
              style={[styles.recipeCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.typeText, { color: colors.primary }]}>{standardizeCategory(recipe.category, recipe.title)}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={[styles.timeText, { color: colors.textSecondary }]}>{recipe.time}m</Text>
                </View>
              </View>

              <Text style={[styles.recipeTitle, { color: colors.text }]}>{recipe.title}</Text>
              
              <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Ingredients Preview:</Text>
              <Text style={[styles.previewText, { color: colors.textSecondary }]} numberOfLines={2}>
                {recipe.ingredients.join(', ')}
              </Text>

              <TouchableOpacity 
                style={[styles.importBtn, { backgroundColor: colors.text }]} 
                onPress={() => handleImport(recipe, index)}
                disabled={importing === index}
              >
                {importing === index ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={20} color={colors.background} />
                    <Text style={[styles.importBtnText, { color: colors.background }]}>Import to Dashboard</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.pageBtn, { backgroundColor: colors.primary }, currentPage === 1 && { backgroundColor: colors.borderLight }]}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? colors.textMuted : colors.surface} />
              </TouchableOpacity>

              <View style={[styles.pageInfo, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Text style={[styles.pageText, { color: colors.text }]}>Page {currentPage} of {totalPages}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.pageBtn, { backgroundColor: colors.primary }, currentPage === totalPages && { backgroundColor: colors.borderLight }]}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? colors.textMuted : colors.surface} />
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

        <Toast ref={toastRef} />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    height: 60,
  },
  headerBtn: {
    padding: 8,
    zIndex: 10,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchSection: {
    padding: 20,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  searchContainer: {
    width: '100%',
    maxWidth: 600,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
    gap: 8,
  },
  disclaimerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  searchBoxWrapper: {
    position: 'relative',
    zIndex: 100,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    elevation: 4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 62,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  searchBtn: {
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  chipWrapper: {
    marginTop: 16,
  },
  chipSectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chipRow: {
    gap: 8,
  },
  suggestionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  aiIconWave: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  recipeCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  previewText: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  importBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '500',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
    gap: 15,
  },
  pageBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pageInfo: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keyModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyModalContent: {
    width: '100%',
    maxWidth: 450,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
  },
  keyModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  keyModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  keyModalDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  keyInput: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  keyModalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  keyBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  keyBtnText: {
    fontSize: 14,
  }
});
