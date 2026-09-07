import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  const SETTINGS = [
    { label: 'Profile Visibility', desc: 'Allow other registered users to view your public profile', val: profileVisible, set: setProfileVisible },
    { label: 'Activity Status', desc: "Show when you are active on ChefStack", val: activityStatus, set: setActivityStatus },
    { label: 'Anonymous Usage Analytics', desc: 'Allow local diagnostic logging to optimize performance', val: dataCollection, set: setDataCollection },
  ];

  const handleDeleteAccount = () => {
    Alert.alert(
      "Confirm Account Deletion",
      "Are you sure you want to request account deletion? All stored recipes and preferences will be removed in accordance with data protection regulations.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete Data & Logout", style: "destructive", onPress: () => signOut() }
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Privacy Policy & Settings</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)}>
            <Text style={styles.lastUpdated}>Last Updated: September 7, 2026</Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Privacy Controls</Text>
              {SETTINGS.map(({ label, desc, val, set }) => (
                <View key={label} style={styles.settingItem}>
                  <View style={styles.settingTextContainer}>
                    <Text style={styles.settingLabel}>{label}</Text>
                    <Text style={styles.settingDesc}>{desc}</Text>
                  </View>
                  <Switch
                    trackColor={{ false: colors.border, true: colors.primaryActive }}
                    thumbColor={val ? colors.primary : colors.surface}
                    ios_backgroundColor={colors.borderLight}
                    onValueChange={() => set(!val)}
                    value={val}
                    accessibilityLabel={label}
                  />
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>1. Personal Data Collection</Text>
              <Text style={styles.paragraph}>
                ChefStack collects your email address and account credentials strictly for user authentication via Supabase. We do not sell your personal information to third parties.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. AI Processing & Gemini API</Text>
              <Text style={styles.paragraph}>
                Recipe generation inputs are processed securely by Google Gemini API endpoints. Prompts sent to the AI model do not include personal account identifiers.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. User Rights & Data Erasure</Text>
              <Text style={styles.paragraph}>
                Under GDPR, CCPA, and applicable data protection regulations (including PH RA 10173), you have the right to inspect, export, or request immediate deletion of all personal data held by ChefStack.
              </Text>
            </View>

            <View style={styles.dangerZone}>
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={handleDeleteAccount}
                accessibilityLabel="Delete Account and Data"
                accessibilityRole="button"
              >
                <Text style={styles.deleteButtonText}>Request Account Deletion</Text>
              </TouchableOpacity>
              <Text style={styles.deleteDesc}>Permanently removes your account data from cloud & local storage</Text>
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
    justify.content: 'center',
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
    marginBottom: 14,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  settingDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  paragraph: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  dangerZone: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    backgroundColor: colors.errorBackground,
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 8,
  },
  deleteButtonText: {
    color: colors.error || '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteDesc: {
    color: colors.textSecondary,
    fontSize: 13,
  }
});
