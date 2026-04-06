import React, { useState } from 'react';
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
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';

export default function RecipeDetail({ recipe, visible, onClose }) {
  const [imgError, setImgError] = useState(false);
  const navigation = useNavigation();

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
      <Animated.View entering={FadeIn.duration(300)} style={styles.overlay}>
        <Animated.View entering={SlideInDown.duration(400).springify()} style={styles.container}>
          
            <View style={styles.header}>
              <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
                <Ionicons name="arrow-back" size={28} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.titleContainer}>
                <Text style={styles.headerTitle}>Recipe Details</Text>
              </View>
              <View style={{ width: 44 }} /> 
            </View>

          {/* Content Scroll wraps everything below the static header */}
          <ScrollView 
            style={styles.contentScroll} 
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Image */}
            <View style={styles.imageContainer}>
              {imgError || !recipe.image ? (
                <View style={styles.imagePlaceholder}>
                  <Ionicons 
                    name={recipe.type === 'food' ? 'restaurant-outline' : 'cafe-outline'} 
                    size={64} 
                    color={colors.primaryActive} 
                  />
                </View>
              ) : (
                <Image 
                  source={{ uri: recipe.image }} 
                  style={styles.image} 
                  onError={() => setImgError(true)} 
                />
              )}
              
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{recipe.category}</Text>
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleSection}>
              <Text style={styles.title}>{recipe.title}</Text>
            </View>

            {/* Stats Bar */}
            <View style={styles.statsBar}>
              <View style={styles.statBox}>
                <Ionicons name="time-outline" size={24} color={colors.primary} />
                <Text style={styles.statLabel}>TIME</Text>
                <Text style={styles.statValue}>{recipe.time}m</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="list" size={24} color={colors.primary} />
                <Text style={styles.statLabel}>ITEMS</Text>
                <Text style={styles.statValue}>{recipe.ingredients?.length || 0}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statBox}>
                <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                <Text style={styles.statLabel}>TYPE</Text>
                <Text style={[styles.statValue, { textTransform: 'capitalize' }]}>{recipe.type}</Text>
              </View>
            </View>

            {/* Detailed Body Content */}
            <View style={styles.contentBody}>
              {/* Ingredients */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list" size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                </View>
                {recipe.ingredients && recipe.ingredients.map((item, index) => (
                  <View key={index} style={styles.listItem}>
                    <View style={styles.bullet} />
                    <Text style={styles.listText}>{item}</Text>
                  </View>
                ))}
              </View>

              {/* Steps */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                  <Text style={styles.sectionTitle}>Method</Text>
                </View>
                {recipe.steps && recipe.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.listText}>{step}</Text>
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
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  imageContainer: {
    height: 250,
    backgroundColor: colors.borderLight,
    position: 'relative',
  },
  imagePlaceholder: {
    flex: 1,
    backgroundColor: colors.primaryLight,
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
    borderBottomColor: colors.borderLight,
    backgroundColor: colors.surface,
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
  badgeContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  titleSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
  },
  statsBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  statBox: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.borderLight,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  contentScroll: {
    flex: 1,
  },
  contentPad: {
    padding: 16,
    paddingBottom: 32,
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
    color: colors.text,
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
    backgroundColor: colors.primaryActive,
    marginTop: 6,
    marginRight: 12,
  },
  listText: {
    fontSize: 16,
    color: colors.text,
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
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  }
});
