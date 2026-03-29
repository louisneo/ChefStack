import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, Layout } from 'react-native-reanimated';

export default function RecipeCard({ recipe, onClick, onEdit, onDelete, onToggleFavorite }) {
  return (
    <Animated.View 
      layout={Layout.springify()} 
      entering={FadeInUp.duration(400)}
      style={styles.container}
    >
      <TouchableOpacity 
        style={styles.card} 
        activeOpacity={0.9} 
        onPress={onClick}
      >
        {/* Image Area */}
        <View style={styles.imageContainer}>
          {recipe.image ? (
            <Image source={{ uri: recipe.image }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons 
                name={recipe.type === 'food' ? 'restaurant-outline' : 'cafe-outline'} 
                size={40} 
                color={colors.primaryActive} 
              />
            </View>
          )}

          {/* Category Badge */}
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText} numberOfLines={1}>{recipe.category}</Text>
          </View>

          {/* Action buttons (favorite, edit, delete from right to left) */}
          <View style={styles.actionsContainer}>
            {onToggleFavorite && (
              <TouchableOpacity 
                style={[styles.actionBtn, recipe.is_favorite && styles.actionBtnActive]} 
                onPress={onToggleFavorite}
              >
                <Ionicons 
                  name={recipe.is_favorite ? "heart" : "heart-outline"} 
                  size={18} 
                  color={recipe.is_favorite ? colors.surface : colors.textSecondary} 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="pencil" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
            
            {/* Delete button looks kinda sketchy here but it works */}
            <TouchableOpacity style={styles.actionBtn} onPress={onDelete}>
              <Ionicons name="trash" size={16} color={colors.error || colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Area below the image */}
        <View style={styles.contentContainer}>
          <Text style={styles.title} numberOfLines={1}>{recipe.title}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={styles.statText}>{recipe.time}m</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="list" size={14} color={colors.primary} />
              <Text style={styles.statText}>{recipe.ingredients?.length || 0} items</Text>
            </View>
            <Text style={styles.typeText}>{recipe.type}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%', // roughly half width for 2-column grid
    marginBottom: 16,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    height: 140,
    backgroundColor: colors.borderLight,
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
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '80%',
  },
  badgeText: {
    color: colors.surface,
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionBtnActive: {
    backgroundColor: colors.primary,
  },
  contentContainer: {
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
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
    color: colors.textSecondary,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    textTransform: 'capitalize',
    marginLeft: 'auto',
  }
});
