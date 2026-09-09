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
  BackHandler,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { standardizeCategory } from '../lib/categories';

export default function RecipeDetail({ recipe, visible, onClose }) {
  const { colors } = useTheme();
  const [imgError, setImgError] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subModalVisible, setSubModalVisible] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [targetIngredient, setTargetIngredient] = useState('');
  const [substitutes, setSubstitutes] = useState([]);
  const [isSubOffline, setIsSubOffline] = useState(false);

  const handleBack = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    if (visible && Platform.OS === 'web') {
      window.history.back();
    }
    onClose();
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  useEffect(() => {
    if (!visible) return;

    const onBack = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
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

  const toggleSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const stepsText = recipe.steps ? recipe.steps.map((s, i) => `Step ${i + 1}: ${s}`).join('. ') : '';
        const textToSpeak = `${recipe.title}. Instructions: ${stepsText}`;
        
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.rate = 0.95;
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
      }
    }
  };

  const handleFindSubstitute = async (ingredient) => {
    setTargetIngredient(ingredient);
    setSubModalVisible(true);
    setSubLoading(true);
    setSubstitutes([]);

    const res = await findSubstitutes(ingredient);
    setSubstitutes(res.substitutes || []);
    setIsSubOffline(res.isOffline);
    setSubLoading(false);
  };

  if (!recipe) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleBack}>
      <Animated.View entering={FadeIn.duration(300)} style={[styles.overlay, { backgroundColor: colors.background }]}>
        <Animated.View entering={SlideInDown.duration(400).springify()} style={[styles.container, { backgroundColor: colors.background }]}>

          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={handleBack} style={styles.headerBtn}>
              <Ionicons name="arrow-back" size={28} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Recipe Details</Text>
            </View>

            {/* Offline-capable Speech Synthesis Audio Producer */}
            <TouchableOpacity 
              onPress={toggleSpeech} 
              style={[styles.audioBtn, { backgroundColor: isSpeaking ? colors.primary : colors.borderLight }]}
              accessibilityLabel="Audio Cooking Producer"
            >
              <Ionicons name={isSpeaking ? "volume-high" : "volume-medium-outline"} size={22} color={isSpeaking ? colors.surface : colors.text} />
            </TouchableOpacity>
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
                <Text style={[styles.badgeText, { color: colors.surface }]}>{standardizeCategory(recipe.category, recipe.title)}</Text>
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
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginLeft: 'auto' }}>Tap item for substitute</Text>
                </View>
                {recipe.ingredients && recipe.ingredients.map((item, index) => (
                  <TouchableOpacity 
                    key={index} 
                    style={[styles.listItem, { backgroundColor: colors.surface, padding: 12, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.borderLight }]}
                    onPress={() => handleFindSubstitute(item)}
                  >
                    <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                    <Text style={[styles.listText, { color: colors.text }]}>{item}</Text>
                    <Ionicons name="sparkles-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Steps */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Ionicons name="list-outline" size={20} color={colors.primary} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>Method</Text>
                  {isSpeaking && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 'auto', gap: 4 }}>
                      <Ionicons name="volume-high" size={16} color={colors.primary} />
                      <Text style={{ fontSize: 12, color: colors.primary, fontWeight: 'bold' }}>Reading Aloud...</Text>
                    </View>
                  )}
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

          {/* Ingredient Substitute Modal */}
          <Modal visible={subModalVisible} transparent animationType="fade">
            <View style={styles.subOverlay}>
              <View style={[styles.subCard, { backgroundColor: colors.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                  <Ionicons name="sparkles" size={24} color={colors.primary} />
                  <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, flex: 1 }}>Substitutes for "{targetIngredient}"</Text>
                  <TouchableOpacity onPress={() => setSubModalVisible(false)}>
                    <Ionicons name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                {isSubOffline && (
                  <View style={{ backgroundColor: colors.borderLight, padding: 8, borderRadius: 8, marginBottom: 12 }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary, fontWeight: '600' }}>⚡ Offline Mode: Using local static substitution index</Text>
                  </View>
                )}

                {subLoading ? (
                  <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
                ) : (
                  <View>
                    {substitutes.map((sub, i) => (
                      <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
                        <Ionicons name="checkmark-circle-outline" size={18} color={colors.primary} />
                        <Text style={{ fontSize: 15, color: colors.text, flex: 1, lineHeight: 22 }}>{sub}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <TouchableOpacity 
                  style={{ backgroundColor: colors.primary, paddingVertical: 12, borderRadius: 12, marginTop: 16, alignItems: 'center' }}
                  onPress={() => setSubModalVisible(false)}
                >
                  <Text style={{ color: colors.surface, fontWeight: 'bold' }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
  audioBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
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
    alignItems: 'center',
    paddingRight: 16,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  },
  subOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  subCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 24,
  }
});

