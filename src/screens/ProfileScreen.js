import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView 
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const navigation = useNavigation();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState('Naga City, Philippines');

  const avatarInitial = fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <Text style={styles.nameText}>{fullName || 'Chef'}</Text>
          <Text style={styles.emailText}>{email}</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100).duration(400)} style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Your Name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="your@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              value={location}
              onChangeText={setLocation}
              placeholder="City, Country"
              placeholderTextColor={colors.textMuted}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingText}>Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('Privacy')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingText}>Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('Help')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.settingItem} 
            onPress={() => navigation.navigate('About')}
          >
            <View style={styles.settingLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
              <Text style={styles.settingText}>About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Ionicons name="log-out-outline" size={24} color={colors.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
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
    paddingTop: 60, // approximate safe area
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
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.surface,
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  formSection: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    color: colors.text,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.errorBackground,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.error,
  }
});
