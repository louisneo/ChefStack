import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Modal,
  Platform,
  BackHandler
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

export default function RecipeDetail({ recipe, visible, onClose }) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);

  const handleBack = () => {
    if (visible && Platform.OS === 'web') {
      window.history.back();
    }
    onClose();
  };

  useEffect(() => {
    if (!visible) return;

    const onBack = () => {
      onClose();
      return true;
    };

    if (Platform.OS === 'web') {
      window.history.pushState({ modal: 'recipe' }, '');
      window.addEventListener('popstate', onBack);
      return () => window.removeEventListener('popstate', onBack);
    } else {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => subscription.remove();
    }
  }, [visible, onClose]);

  if (!recipe) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleBack}>
      <Animated.View entering={FadeIn.duration(300)} style={[styles.overlay, { backgroundColor: colors.background }]}>
        <Animated.View entering={SlideInDown.duration(400).springify()} style={[styles.container, { backgroundColor: colors.background }]}>
          
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Recipe Details</Text>
            </View>
            <View style={{ width: 44 }} /> 
          </View>

          <ScrollView 
            style={styles.contentScroll} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Image */}
            <View style={[styles.imageContainer, { backgroundColor: colors.borderLight }]}>
              {imgError || !recipe.image ? (
                <View style={[styles.imagePlaceholder, { backgroundColor: colors.primary + '15' }]}>
                  <Ionicons 
                    name={recipe.type === 'food' ? 'restaurant-outline' : 'cafe-outline'} 
                    size={64} 
                    color={colors.primary} 
                  />
                </View>
              ) : (
                <Image 
                  source={{ uri: recipe.image }} 
                  style={styles.image} 
                  onError={() => setImgError(true)} 
                />
              )}
              
              <View style={[styles.badgeContainer, { backgroundColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.surface }]}>{recipe.category}</Text>
              </View>
            </View>

            {/* Title */}
            <View style={[styles.titleSection, { borderBottomColor: colors.borderLight }]}>
              <Text style={[styles.title, { color: colors.text }]}>{recipe.title}</Text>
            </View>

            {/* Stats Bar */}
            <View style={[styles.statsBar, { borderBottomColor: colors.borderLight }]}>
              <View style={styles.statBox}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TIME</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{recipe.time}m</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              <View style={styles.statBox}>
                <Ionicons name="list" size={24} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ITEMS</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{recipe.ingredients?.length || 0}</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
              <View style={styles.statBox}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>TYPE</Text>
                <Text style={[styles.statValue, { textTransform: 'capitalize', color: colors.text }]}>{recipe.type}</Text>
              </View>
            </View>

            {/* Detailed Body Content */}
            <View style={styles.contentBody}>
              {/* Ingredients */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
                </View>
                {recipe.ingredients && recipe.ingredients.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Steps */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Method</Text>
                </View>
                {recipe.steps && recipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.stepNumberText, { color: colors.surface }]}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.listText, { color: colors.text }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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
  badgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  titleSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentScroll: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  contentBody: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingRight: 16,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 16,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
  }
});
