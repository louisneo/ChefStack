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
import { Ionicons } from '@expo/vector-icons';
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
  const navigation = useNavigation();
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
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

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Video Tutorials</Text>
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
    paddingTop: Platform.OS === 'web' ? 20 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  content: {
    padding: 24,
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
