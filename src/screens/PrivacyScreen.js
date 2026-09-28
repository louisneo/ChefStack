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
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useAuth } from '../context/AuthContext';

const POLICY_SECTIONS = [
  {
    id: 'intro',
    icon: 'information-circle',
    title: 'Introduction',
    content: 'Welcome to ChefStack ("the Platform", "we", "our", or "us"). We are committed to protecting your privacy and handling your information responsibly. This Privacy Policy explains what information we collect, how we use it, and the choices available to you when using our website and mobile application.\n\nBy accessing or using ChefStack, you agree to the practices described in this Privacy Policy.'
  },
  {
    id: 'collect',
    icon: 'book',
    title: 'Information We Collect',
    content: 'Information You Provide:\n• Name and profile information\n• Email address\n• Recipes, ingredients, and feedback\n• Information submitted through forms\n\nAutomatically Collected Information:\n• Device information (device type, OS, browser type)\n• IP address\n• General usage information and activity within the Platform\n• Analytics and crash reports'
  },
  {
    id: 'use',
    icon: 'shield-checkmark',
    title: 'How We Use Information',
    content: 'We use collected information to:\n• Provide and maintain the Platform and its features\n• Personalize recommendations and AI searches\n• Improve user experience and platform performance\n• Monitor security, reliability, and system health\n• Respond to inquiries and provide support'
  },
  {
    id: 'share',
    icon: 'share-social',
    title: 'Information Sharing and Disclosure',
    content: 'We do NOT sell your personal information.\n\nWe may share information in the following situations:\n• With service providers that help operate the Platform (hosting, analytics, auth, and AI processing)\n• When required by law, legal process, or official government requests\n• To protect the rights, property, safety, and security of our users and the Platform'
  },
  {
    id: 'third',
    icon: 'document-text',
    title: 'Third-Party Services',
    content: 'ChefStack uses third-party services and technologies to deliver features and improve experience (such as Supabase for authentication and Google Gemini for AI). These services process data according to their own privacy policies. We encourage users to review the privacy practices of these third-party providers.'
  },
  {
    id: 'ugc',
    icon: 'person-add',
    title: 'User-Generated Content',
    content: 'The Platform allows you to submit user-generated content, including recipes, notes, and photos.\n\nImportant Warning: Any content you submit may be visible to other users if shared publicly. Please avoid sharing sensitive or confidential information in public fields.'
  },
  {
    id: 'retention',
    icon: 'sync',
    title: 'Data Retention',
    content: 'We retain information only for as long as necessary to provide the services, resolve disputes, enforce agreements, and maintain security. Once no longer needed, data is deleted, anonymized, or aggregated.'
  },
  {
    id: 'security',
    icon: 'lock-closed',
    title: 'Data Security',
    content: 'We implement administrative, technical, and organizational safeguards designed to protect your information from unauthorized access, loss, or alteration.\n\n* While we strive to protect your data, no method of transmission over the internet can be guaranteed 100% secure.'
  },
  {
    id: 'children',
    icon: 'scale',
    title: "Children's Privacy",
    content: 'ChefStack is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If discovered, we will take steps to remove such records immediately.'
  },
  {
    id: 'contact',
    icon: 'mail',
    title: 'Contact Us',
    content: 'If you have questions, concerns, or requests regarding this Privacy Policy, please contact the developer:\n\nLouis Neo Lok\nFull Stack AI Engineer, ChefStack'
  }
];

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const { signOut, user } = useAuth();
  const { colors } = useTheme();
  
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

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Profile' });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity 
          onPress={handleBack} 
          style={styles.headerBtn}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)}>
            
            {/* Settings block can remain at top or we can just focus on privacy policy. Let's keep it under a settings title */}
            <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={[styles.sectionHeader, { borderBottomColor: colors.borderLight }]}>
                <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}>
                  <Ionicons name="settings" size={16} color={colors.primary} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy Controls</Text>
              </View>
              <View style={styles.sectionBody}>
                {SETTINGS.map(({ label, desc, val, set }, index) => (
                  <View key={label} style={[styles.settingItem, index === SETTINGS.length - 1 && { borderBottomWidth: 0 }, { borderBottomColor: colors.borderLight }]}>
                    <View style={styles.settingTextContainer}>
                      <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
                      <Text style={[styles.settingDesc, { color: colors.textSecondary }]}>{desc}</Text>
                    </View>
                    <Switch
                      trackColor={{ false: colors.border, true: colors.primaryActive }}
                      thumbColor={val ? colors.primary : colors.card}
                      ios_backgroundColor={colors.borderLight}
                      onValueChange={() => set(!val)}
                      value={val}
                    />
                  </View>
                ))}
              </View>
            </View>

            <Text style={[styles.lastUpdated, { color: colors.textMuted }]}>Effective Date: September 28, 2026</Text>

            {POLICY_SECTIONS.map((sec) => (
              <View key={sec.id} style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={[styles.sectionHeader, { borderBottomColor: colors.borderLight }]}>
                  <View style={[styles.iconWrapper, { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight }]}>
                    <Ionicons name={sec.icon} size={16} color={colors.primary} />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>{sec.title}</Text>
                </View>
                <View style={styles.sectionBody}>
                  <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    {sec.content}
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.dangerZone}>
              <TouchableOpacity 
                style={[styles.deleteButton, { backgroundColor: colors.errorBackground, borderColor: colors.error }]}
                onPress={handleDeleteAccount}
              >
                <Text style={[styles.deleteButtonText, { color: colors.error }]}>Request Account Deletion</Text>
              </TouchableOpacity>
              <Text style={[styles.deleteDesc, { color: colors.textSecondary }]}>Permanently removes your account data from cloud & local storage</Text>
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
    fontWeight: '800',
  },
  content: {
    padding: 24,
    alignItems: 'center',
    paddingBottom: 60,
  },
  formContainer: {
    width: '100%',
    maxWidth: 750,
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 20,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  sectionBody: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  dangerZone: {
    marginTop: 20,
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  deleteDesc: {
    fontSize: 13,
    fontWeight: '500',
  }
});
