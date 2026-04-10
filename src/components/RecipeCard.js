import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function RecipeCard({ recipe, onClick, onEdit, onDelete, onToggleFavorite, style }) {
  const { colors } = useTheme();

  return (
    <Animated.View 
      layout={Layout.springify()} 
      entering={FadeInUp.duration(400)}
      style={[styles.container, style]}
    >
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface }]} 
        activeOpacity={0.9} 
        onPress={onClick}
      >
        {/* Image Area */}
        <View style={[styles.imageContainer, { backgroundColor: colors.borderLight }]}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.image} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons 
                name={recipe.type === 'food' ? 'restaurant-outline' : 'cafe-outline'} 
                size={40} 
                color={colors.primary} 
              />
            </View>
          )}

          {/* Category Badge */}
          <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.surface }]} numberOfLines={1}>{recipe.category}</Text>
          </View>

          {/* Action buttons */}
          <View style={styles.actionsContainer}>
            {onToggleFavorite && (
              <TouchableOpacity 
                style={[
                  styles.actionBtn, 
                  { backgroundColor: colors.surface + 'CC' },
                  recipe.is_favorite && { backgroundColor: colors.primary }
                ]} 
                onPress={onToggleFavorite}
              >
                <Ionicons 
                  name={recipe.is_favorite ? "heart" : "heart-outline"} 
                  size={18} 
                  color={recipe.is_favorite ? colors.surface : colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.surface + 'CC' }]} 
              onPress={onEdit}
            >
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: colors.surface + 'CC' }]} 
              onPress={onDelete}
            >
              <Ionicons name="trash" size={16} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{recipe.title}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{recipe.time}m</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="list" size={14} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>{recipe.ingredients?.length || 0} items</Text>
            </View>
            <Text style={[styles.typeText, { color: colors.primary }]}>{recipe.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    marginBottom: 16,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  imageContainer: {
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  actionsContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    gap: 6,
  },
  actionBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    marginLeft: 'auto',
  }
});
