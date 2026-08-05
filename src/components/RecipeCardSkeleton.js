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

export default function RecipeCardSkeleton({ style }) {
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
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {/* Image Area placeholder */}
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.borderLight }]} />
        
        {/* Content Area placeholder */}
        <View style={styles.contentContainer}>
          {/* Title bar */}
          <View style={[styles.titleBar, { backgroundColor: colors.borderLight }]} />
          
          {/* Stats row */}
          <View style={styles.statsContainer}>
            <View style={[styles.statItem, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.statItem, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.typeItem, { backgroundColor: colors.borderLight }]} />
          </View>
        </View>
      </View>
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
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 4,
  },
  imagePlaceholder: {
    height: 140,
    width: '100%',
  },
  contentContainer: {
    padding: 12,
  },
  titleBar: {
    height: 16,
    borderRadius: 8,
    width: '80%',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statItem: {
    height: 14,
    width: 45,
    borderRadius: 7,
  },
  typeItem: {
    height: 14,
    width: 40,
    borderRadius: 7,
    marginLeft: 'auto',
  }
});
