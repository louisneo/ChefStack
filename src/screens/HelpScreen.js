import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  LayoutAnimation,
  UIManager,
  Platform
} from 'react-native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../components/PageHeader';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    q: 'How to add a new recipe?',
    a: 'Tap the "+" button on the dashboard or use the "Add Recipe" button in the side menu. Fill in the recipe details including title, type, category, time, ingredients, and steps.'
  },
  {
    q: 'How to organize my recipes?',
    a: 'You can filter recipes by type (Food or Drink) using the filter buttons on the dashboard. You can also sort them by newest, oldest, or alphabetically.'
  },
  {
    q: 'How to manage recipes?',
    a: 'Tap on any recipe to view details. From there, you can edit the recipe information or delete it completely.'
  }
];

export default function HelpScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Help & Support" subtitle="App Version 1.3.0" icon="help-buoy-outline" onBack={handleBack} maxWidth={800} />

      <ScrollView contentContainerStyle={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Frequently Asked Questions</Text>
            <View style={styles.faqList}>
              {FAQS.map((faq, i) => (
                <View key={i} style={styles.faqItemContainer}>
                  <TouchableOpacity 
                    style={styles.faqItem} 
                    onPress={() => toggleFaq(i)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.faqQuestion}>{faq.q}</Text>
                    <Ionicons 
                      name="chevron-down" 
                      size={20} 
                      color={colors.textMuted} 
                      style={{ transform: [{ rotate: openFaq === i ? '180deg' : '0deg' }] }}
                    />
                  </TouchableOpacity>
                  {openFaq === i && (
                    <View style={styles.faqAnswerContainer}>
                      <Text style={styles.faqAnswer}>{faq.a}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Video Tutorials</Text>
            <View style={styles.videoList}>
              {['Getting Started', 'Managing Recipes'].map((title, index) => (
                <TouchableOpacity key={index} style={styles.videoItem}>
                  <View style={styles.videoItemLeft}>
                    <Ionicons name="play-circle" size={24} color={colors.primary} />
                    <Text style={styles.videoTitle}>{title}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </View>
      </ScrollView>
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
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  content: {
    padding: 24,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 800,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  faqList: {
    gap: 12,
  },
  faqItemContainer: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    marginRight: 16,
  },
  faqAnswerContainer: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: colors.background,
  },
  faqAnswer: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  videoList: {
    gap: 12,
  },
  videoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  videoItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  }
});
