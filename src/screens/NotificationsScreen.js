import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  ScrollView,
  Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../components/PageHeader';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const { colors, isDark } = useTheme();
  const navigation = useNavigation();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [recipeTips, setRecipeTips] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem('@notif_settings');
        if (saved) {
          const parsed = JSON.parse(saved);
          setPushNotifs(parsed.pushNotifs ?? true);
          setEmailNotifs(parsed.emailNotifs ?? false);
          setRecipeTips(parsed.recipeTips ?? true);
          setWeeklyDigest(parsed.weeklyDigest ?? false);
        }
      } catch (e) {
        console.log('Failed to load settings', e);
      }
    };
    loadSettings();
  }, []);

  const updateSetting = async (key, value, setter) => {
    setter(value);
    try {
      const current = { pushNotifs, emailNotifs, recipeTips, weeklyDigest, [key]: value };
      await AsyncStorage.setItem('@notif_settings', JSON.stringify(current));
    } catch (e) {
      console.log('Failed to save settings', e);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs', { screen: 'Home' });
    }
  };

  const SETTINGS = [
    { label: 'Push Notifications', key: 'pushNotifs', desc: 'Get notified about new recipes and updates', val: pushNotifs, set: setPushNotifs },
    { label: 'Email Notifications', key: 'emailNotifs', desc: 'Receive email updates about your account', val: emailNotifs, set: setEmailNotifs },
    { label: 'Recipe Tips', key: 'recipeTips', desc: 'Daily cooking tips and tricks', val: recipeTips, set: setRecipeTips },
    { label: 'Weekly Digest', key: 'weeklyDigest', desc: 'Weekly summary of popular recipes', val: weeklyDigest, set: setWeeklyDigest },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PageHeader title="Notifications" subtitle="Manage your alerts" icon="notifications-outline" onBack={handleBack} maxWidth={600} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
          <Animated.View entering={FadeInDown.duration(400)}>
            {SETTINGS.map(({ label, key, desc, val, set }, index) => (
              <View key={label} style={styles.settingItem}>
                <View style={styles.settingTextContainer}>
                  <Text style={styles.settingLabel}>{label}</Text>
                  <Text style={styles.settingDesc}>{desc}</Text>
                </View>
                <Switch
                  trackColor={{ false: colors.border, true: colors.primaryActive }}
                  thumbColor={val ? colors.primary : colors.surface}
                  ios_backgroundColor={colors.borderLight}
                  onValueChange={() => updateSetting(key, !val, set)}
                  value={val}
                />
              </View>
            ))}
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
    maxWidth: 600,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  settingTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  settingDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  }
});
