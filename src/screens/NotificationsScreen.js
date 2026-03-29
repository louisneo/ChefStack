import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  ScrollView 
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const [pushNotifs, setPushNotifs] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(false);
  const [recipeTips, setRecipeTips] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const SETTINGS = [
    { label: 'Push Notifications', desc: 'Get notified about new recipes and updates', val: pushNotifs, set: setPushNotifs },
    { label: 'Email Notifications', desc: 'Receive email updates about your account', val: emailNotifs, set: setEmailNotifs },
    { label: 'Recipe Tips', desc: 'Daily cooking tips and tricks', val: recipeTips, set: setRecipeTips },
    { label: 'Weekly Digest', desc: 'Weekly summary of popular recipes', val: weeklyDigest, set: setWeeklyDigest },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)}>
          {SETTINGS.map(({ label, desc, val, set }, index) => (
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
              />
            </View>
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
