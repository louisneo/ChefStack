import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence 
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';

export default function AISearchCardSkeleton({ style }) {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle, style]}>
      <View style={[styles.recipeCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        {/* Card Header placeholder */}
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: colors.borderLight }]} />
          <View style={[styles.timeBadge, { backgroundColor: colors.borderLight }]} />
        </View>

        {/* Title placeholder */}
        <View style={[styles.recipeTitle, { backgroundColor: colors.borderLight }]} />

        {/* Section Label placeholder */}
        <View style={[styles.sectionLabel, { backgroundColor: colors.borderLight }]} />

        {/* Preview text placeholder */}
        <View style={[styles.previewLine, { backgroundColor: colors.borderLight }]} />
        <View style={[styles.previewLine, { backgroundColor: colors.borderLight, width: '60%' }]} />

        {/* Button placeholder */}
        <View style={[styles.importBtn, { backgroundColor: colors.borderLight }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  recipeCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  typeBadge: {
    height: 22,
    width: 70,
    borderRadius: 11,
  },
  timeBadge: {
    height: 18,
    width: 50,
    borderRadius: 9,
  },
  recipeTitle: {
    height: 24,
    borderRadius: 12,
    width: '70%',
    marginBottom: 16,
  },
  sectionLabel: {
    height: 12,
    borderRadius: 6,
    width: '35%',
    marginBottom: 8,
  },
  previewLine: {
    height: 14,
    borderRadius: 7,
    width: '95%',
    marginBottom: 8,
  },
  importBtn: {
    height: 48,
    borderRadius: 12,
    width: '100%',
    marginTop: 12,
  },
});
