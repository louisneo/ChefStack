import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  Platform,
  BackHandler
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useRecipes } from '../context/RecipeContext';
import { Ionicons } from '@expo/vector-icons';
import { searchRecipes } from '../services/aiService';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import Toast from '../components/Toast';

export default function AISearchScreen({ navigation }) {
  const { colors, isDark } = useTheme();
  const { saveRecipe } = useRecipes();
  const { user } = useAuth();
  
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [importing, setImporting] = useState(null);

  const toastRef = React.useRef(null);

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

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchError(null);
    setResults([]);
    setCurrentPage(1);

    try {
      const { recipes, isFood, error } = await searchRecipes(query);
      if (error) {
        setSearchError(error);
      } else if (!isFood) {
        setSearchError("I only find food and drinks! 🍳 Try searching for something like 'Chicken Adobo' or 'Iced Coffee'.");
      } else if (recipes.length === 0) {
        setSearchError("I couldn't find any recipes for that. Try a different food name!");
      } else {
        setResults(recipes);
      }
    } catch (error) {
      console.error('Search Screen Error:', error);
      setSearchError('Something went wrong while talking to the AI. Please try again.');
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
      const { error } = await saveRecipe({
        ...recipe,
        image: null,
        is_favorite: false
      });

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
            <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.borderLight }]}>
              <Ionicons name="sparkles" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Search any food recipe..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                placeholderTextColor={colors.textMuted}
                underlineColorAndroid="transparent"
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={[styles.searchBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={[styles.searchBtnText, { color: colors.surface }]}>Find Recipe</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Results */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {searchError && !loading && (
            <Animated.View entering={FadeIn} style={[styles.errorCard, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]}>
              <Ionicons name="information-circle-outline" size={32} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.text }]}>{searchError}</Text>
            </Animated.View>
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
                  <Text style={[styles.typeText, { color: colors.primary }]}>{recipe.category}</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    marginBottom: 16,
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
  }
});
