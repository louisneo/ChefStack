import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Switch,
  ScrollView,
  Platform
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const [profileVisible, setProfileVisible] = useState(true);
  const [activityStatus, setActivityStatus] = useState(true);
  const [dataCollection, setDataCollection] = useState(false);

  const SETTINGS = [
    { label: 'Profile Visibility', desc: 'Allow other users to view your profile', val: profileVisible, set: setProfileVisible },
    { label: 'Activity Status', desc: "Show when you're active on ChefStack", val: activityStatus, set: setActivityStatus },
    { label: 'Data Collection', desc: 'Allow collection of usage data to improve the app', val: dataCollection, set: setDataCollection },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle}>Privacy</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.formContainer}>
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

            <View style={styles.dangerZone}>
              <TouchableOpacity style={styles.deleteButton}>
                <Text style={styles.deleteButtonText}>Delete Account</Text>
              </TouchableOpacity>
              <Text style={styles.deleteDesc}>This action cannot be undone</Text>
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
  },
  dangerZone: {
    marginTop: 32,
    alignItems: 'center',
  },
  deleteButton: {
    width: '100%',
    backgroundColor: colors.errorBackground,
    borderWidth: 2,
    borderColor: colors.errorActive || '#FEE2E2',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteDesc: {
    color: colors.textSecondary,
    fontSize: 14,
  }
});
