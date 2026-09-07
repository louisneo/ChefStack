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

export default function TermsScreen() {
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
          <Text style={styles.headerTitle}>Terms of Service</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.lastUpdated}>Last Updated: September 7, 2026</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Agreement to Terms</Text>
              <Text style={styles.paragraph}>
                By accessing or using ChefStack ("the Application"), you agree to be bound by these Terms of Service. If you do not agree to all terms, do not use the Application.
              </Text>
            </View>

            <View style={[styles.section, styles.warningBox]}>
              <Text style={styles.warningTitle}>2. AI Recipe & Health Disclaimer (IMPORTANT)</Text>
              <Text style={styles.paragraph}>
                ChefStack features AI-assisted recipe search and generation powered by automated machine learning models. You acknowledge and agree that:
              </Text>
              <Text style={styles.bulletPoint}>• AI-generated recipes, ingredient amounts, and instructions are for informational purposes only.</Text>
              <Text style={styles.bulletPoint}>• You are solely responsible for inspecting ingredients, verifying proper internal cooking temperatures, maintaining food safety/hygiene, and confirming allergen safety before food preparation or consumption.</Text>
              <Text style={styles.bulletPoint}>• ChefStack does NOT provide certified medical, dietary, or nutritional advice. Always consult a healthcare professional for dietary or medical needs.</Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Account Responsibilities</Text>
              <Text style={styles.paragraph}>
                You are responsible for safeguarding your login credentials and for all activities that occur under your account. You agree not to upload harmful, offensive, or illegal content.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>4. Disclaimer of Warranties & Limitation of Liability</Text>
              <Text style={styles.paragraph}>
                The Application is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, express or implied. To the maximum extent permitted by applicable law, ChefStack and its developers disclaim all liability for any direct, indirect, incidental, or consequential damages arising from your use of the Application.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Offline & Local Storage</Text>
              <Text style={styles.paragraph}>
                ChefStack uses client-side offline caching to enable offline functionality. While we strive to preserve local data, ChefStack is not liable for data loss caused by local cache clearing, device resets, or browser state deletion.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>6. Governing Law</Text>
              <Text style={styles.paragraph}>
                These Terms shall be governed by and construed in accordance with applicable statutory laws, including consumer protection and digital service guidelines.
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
  warningBox: {
    borderColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D97706',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 4,
  }
});
