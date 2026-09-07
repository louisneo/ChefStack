import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CookiePolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.headerBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Cookie & Storage Policy</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.lastUpdated}>Last Updated: September 7, 2026</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. What are Cookies and Local Storage?</Text>
              <Text style={styles.paragraph}>
                Cookies and Local Storage (AsyncStorage/IndexedDB) are small data text files stored directly on your web browser or device when you use ChefStack. They enable essential functions like keeping you logged in and allowing offline access.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. How We Use Storage</Text>
              
              <View style={styles.storageType}>
                <Text style={styles.subTitle}>• Essential Local Storage (Strictly Necessary)</Text>
                <Text style={styles.paragraph}>
                  Required for user authentication sessions (Supabase tokens), preserving dark/light theme preferences, and caching saved recipes locally so the app works offline.
                </Text>
              </View>

              <View style={styles.storageType}>
                <Text style={styles.subTitle}>• Performance & Service Worker Cache</Text>
                <Text style={styles.paragraph}>
                  Stores application assets (CSS, JS bundles, icons) locally in your browser's Service Worker cache to guarantee instant load times and complete offline PWA availability.
                </Text>
              </View>

              <View style={styles.storageType}>
                <Text style={styles.subTitle}>• Third-Party Tracking & Advertising</Text>
                <Text style={styles.paragraph}>
                  ChefStack does NOT use third-party cross-site advertising cookies or sell user telemetry data to advertising networks.
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Managing Your Storage Preferences</Text>
              <Text style={styles.paragraph}>
                You can manage or delete local storage and cookies at any time through your browser settings or via the Privacy menu in ChefStack. Clearing local storage will log you out and clear offline cached recipes.
              </Text>
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
    maxWidth: 750,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 20,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  storageType: {
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  }
});
