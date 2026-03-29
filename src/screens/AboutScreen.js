import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AboutScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.appInfoSection}>
          <View style={styles.iconContainer}>
            <FontAwesome5 name="utensils" size={40} color={colors.surface} />
          </View>
          <Text style={styles.appName}>ChefStack</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your personal recipe manager designed to help you organize, create, and share your culinary masterpieces.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Features</Text>
          <View style={styles.featureList}>
            {[
              { title: 'Recipe Management', desc: 'Create, edit, and organize your recipes with ease' },
              { title: 'Smart Categories', desc: 'Organize recipes by type, category, and cooking time' },
              { title: 'Favorites', desc: 'Save your most-loved recipes for quick access' },
              { title: 'Mobile Optimized', desc: 'Beautiful, responsive design perfect for cooking on-the-go' },
            ].map(({ title, desc }, index) => (
              <View key={index} style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={styles.featureIcon} />
                <View style={styles.featureTextContainer}>
                  <Text style={styles.featureTitle}>{title}</Text>
                  <Text style={styles.featureDesc}>{desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          <Text style={styles.creditText}>Developed with ❤️ by the ChefStack Team</Text>
          <Text style={styles.copyrightText}>© 2024 ChefStack. All rights reserved.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)} style={styles.legalSection}>
          {['Terms of Service', 'Privacy Policy', 'Licenses'].map((label, i) => (
            <TouchableOpacity key={i} style={styles.legalItem}>
              <Text style={styles.legalLabel}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
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
    paddingTop: 60,
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
  appInfoSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: colors.borderLight,
    marginBottom: 24,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  appDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  creditText: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  legalSection: {
    gap: 12,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 16,
    padding: 16,
  },
  legalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  }
});
