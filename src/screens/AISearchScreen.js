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
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { searchRecipes } from '../services/aiService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import Toast from '../components/Toast';

export default function AISearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searchError, setSearchError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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
  const [importing, setImporting] = useState(null);
  const { user } = useAuth();
  
  const toastRef = React.useRef(null);

  const handleSearch = async () => {
    console.log('Find Recipe button clicked! Query:', query);
    if (!query.trim()) return;
    
    setLoading(true);
    setSearchError(null);
    setResults([]);
    setCurrentPage(1);

    try {
      const { recipes, isFood } = await searchRecipes(query);
      if (!isFood) {
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
      const { error } = await supabase.from('recipes').insert([
        {
          ...recipe,
          user_id: user.id,
          image: null, // As requested, no image on import
          is_favorite: false
        }
      ]);

      if (error) throw error;
      
      toastRef.current?.show(`${recipe.title} imported successfully!`);
      
      // Navigate back after a short delay so they see the success
      setTimeout(() => {
        navigation.navigate('Home', { refresh: true });
      }, 1000);
    } catch (error) {
      toastRef.current?.show(error.message, 'error');
    } finally {
      setImporting(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.webWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerTitle}>AI Recipe Finder</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* Search Section */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="sparkles" size={20} color={colors.primary} style={styles.searchIcon} />
              <TextInput
                style={[styles.input, { outlineStyle: 'none' }]}
                placeholder="Search any food recipe..."
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={handleSearch}
                placeholderTextColor={colors.textMuted}
              />
              {query.length > 0 && (
                <TouchableOpacity onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity 
              style={styles.searchBtn} 
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.surface} />
              ) : (
                <Text style={styles.searchBtnText}>Find Recipe</Text>
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
            <Animated.View entering={FadeIn} style={styles.errorCard}>
              <Ionicons name="information-circle-outline" size={32} color={colors.primary} />
              <Text style={styles.errorText}>{searchError}</Text>
            </Animated.View>
          )}

          {results.length === 0 && !loading && !searchError && (
            <View style={styles.emptyState}>
              <View style={styles.aiIconWave}>
                 <Ionicons name="restaurant-outline" size={48} color={colors.primaryLight} />
              </View>
              <Text style={styles.emptyTitle}>Ask ChefStack AI</Text>
              <Text style={styles.emptySubtitle}>
                Type any food craving like "Filipino Sinigang" or "Chicken Carbonara"
              </Text>
            </View>
          )}

          {paginatedResults.map((recipe, index) => (
            <Animated.View 
              entering={FadeInDown.delay(index * 100)} 
              key={index} 
              style={styles.recipeCard}
            >
              <View style={styles.cardHeader}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{recipe.category}</Text>
                </View>
                <View style={styles.timeBadge}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.timeText}>{recipe.time}m</Text>
                </View>
              </View>

              <Text style={styles.recipeTitle}>{recipe.title}</Text>
              
              <Text style={styles.sectionLabel}>Ingredients Preview:</Text>
              <Text style={styles.previewText} numberOfLines={2}>
                {recipe.ingredients.join(', ')}
              </Text>

              <TouchableOpacity 
                style={styles.importBtn} 
                onPress={() => handleImport(recipe, index)}
                disabled={importing === index}
              >
                {importing === index ? (
                  <ActivityIndicator color={colors.surface} size="small" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={20} color={colors.surface} />
                    <Text style={styles.importBtnText}>Import to Dashboard</Text>
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <View style={styles.paginationContainer}>
              <TouchableOpacity 
                style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <Ionicons name="chevron-back" size={24} color={currentPage === 1 ? colors.textLight : colors.surface} />
              </TouchableOpacity>

              <View style={styles.pageInfo}>
                <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
              </View>

              <TouchableOpacity 
                style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                onPress={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <Ionicons name="chevron-forward" size={24} color={currentPage === totalPages ? colors.textLight : colors.surface} />
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
    backgroundColor: colors.background,
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
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
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
    color: colors.text,
  },
  searchSection: {
    padding: 20,
    backgroundColor: colors.surface,
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
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  searchBtn: {
    backgroundColor: colors.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  searchBtnText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  aiIconWave: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 50,
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
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 24,
  },
  recipeCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.borderLight,
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
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.primary,
    textTransform: 'uppercase',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  previewText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
    lineHeight: 20,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.text,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  importBtnText: {
    color: colors.surface,
    fontSize: 15,
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginTop: 20,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  pageBtnDisabled: {
    backgroundColor: colors.border,
    elevation: 0,
  },
  pageInfo: {
    backgroundColor: colors.surfaceVariant,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  }
});
