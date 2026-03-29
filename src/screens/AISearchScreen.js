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
  Platform
} from 'react-native';
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
  const [importing, setImporting] = useState(null);
  const { user } = useAuth();
  
  const toastRef = React.useRef(null);

  const handleSearch = async () => {
    console.log('Find Recipe button clicked! Query:', query);
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const recipes = await searchRecipes(query);
      if (recipes.length === 0) {
        Alert.alert('No results', 'Try another search term! I only find food recipes.');
      }
      setResults(recipes);
    } catch (error) {
      console.error('Search Screen Error:', error);
      Alert.alert('AI Search Failed', error.message || 'Something went wrong while talking to the AI.');
    } finally {
      setLoading(false);
    }
  };

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
        navigation.navigate('Dashboard', { refresh: true });
      }, 1000);
    } catch (error) {
      toastRef.current?.show(error.message, 'error');
    } finally {
      setImporting(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Recipe Finder</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <Ionicons name="sparkles" size={20} color={colors.primary} style={styles.searchIcon} />
          <TextInput
            style={styles.input}
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

      {/* Results */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {results.length === 0 && !loading && (
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

        {results.map((recipe, index) => (
          <Animated.View 
            entering={FadeInUp.delay(index * 100)} 
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
      </ScrollView>

      <Toast ref={toastRef} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'web' ? 5 : 60,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
  }
});
