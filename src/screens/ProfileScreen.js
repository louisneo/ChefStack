import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  BackHandler,
  Alert,
  Switch
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState('Naga City, Philippines');

  const isGuest = user?.is_anonymous;
  const avatarInitial = isGuest ? 'G' : (fullName?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || 'U');

  // Handle Android Hardware Back Button to return to Home Tab
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('Home');
        return true; 
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.webWrapper}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
            <Ionicons name="arrow-back" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formContainer}>
            <Animated.View entering={FadeInDown.duration(400)} style={styles.avatarSection}>
              <View style={[styles.avatar, { backgroundColor: isGuest ? colors.textSecondary : colors.primary }]}>
                <Text style={styles.avatarText}>
                  {isGuest ? <Ionicons name="person-outline" size={40} color={colors.surface} /> : avatarInitial}
                </Text>
              </View>
              <Text style={[styles.nameText, { color: colors.text }]}>
                {isGuest ? 'Guest Chef' : (fullName || 'Chef')}
              </Text>
              {isGuest ? (
                <View style={[styles.guestBadge, { backgroundColor: colors.borderLight }]}>
                  <Text style={[styles.guestBadgeText, { color: colors.textSecondary }]}>Guest Mode</Text>
                </View>
              ) : (
                <Text style={[styles.emailText, { color: colors.textSecondary }]}>{email}</Text>
              )}
            </Animated.View>

            {isGuest && (
              <Animated.View entering={FadeInDown.delay(150).duration(400)} style={[styles.upgradeCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <View style={styles.upgradeTextContainer}>
                  <Text style={[styles.upgradeTitle, { color: colors.text }]}>Enjoying ChefStack?</Text>
                  <Text style={[styles.upgradeSubtitle, { color: colors.textSecondary }]}>Create a permanent account to sync your recipes across devices.</Text>
                </View>
              </Animated.View>
            )}

            <Animated.View entering={FadeInDown.delay(100).duration(400)} style={[styles.formSection, isGuest && { opacity: 0.6 }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }]}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Your Name"
                  placeholderTextColor={colors.textMuted}
                  editable={!isGuest}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }]}
                  value={isGuest ? 'guest@chefstack.app' : email}
                  onChangeText={setEmail}
                  placeholder="your@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={colors.textMuted}
                  editable={!isGuest}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Location</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }]}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="City, Country"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.settingsSection}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
              
              <View style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                <View style={styles.settingLeft}>
                  <Ionicons name={isDark ? "moon" : "sunny-outline"} size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Dark Mode</Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: '#767577', true: colors.primary }}
                  thumbColor={Platform.OS === 'ios' ? '#fff' : isDark ? colors.surface : '#f4f3f4'}
                />
              </View>

              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                onPress={() => navigation.navigate('Notifications')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="notifications-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Notifications</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                onPress={() => navigation.navigate('Privacy')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="shield-checkmark-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>Privacy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.settingItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                onPress={() => navigation.navigate('About')}
              >
                <View style={styles.settingLeft}>
                  <Ionicons name="information-circle-outline" size={24} color={colors.textSecondary} />
                  <Text style={[styles.settingText, { color: colors.text }]}>About</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <TouchableOpacity 
                style={[styles.signOutButton, { backgroundColor: colors.error + '15' }]} 
                onPress={() => {
                  if (isGuest) {
                    Alert.alert(
                      'Warning: Guest Account',
                      'As a guest, your saved recipes and data will be permanently cleared if you sign out. \n\nAre you sure?',
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                          text: 'Sign Out Anyway', 
                          style: 'destructive', 
                          onPress: async () => {
                            try {
                              await signOut();
                            } catch (e) {
                              console.error('Logout failed:', e);
                              Alert.alert('Error', 'Failed to sign out. Please try again.');
                            }
                          } 
                        }
                      ]
                    );
                  } else {
                    signOut();
                  }
                }}
              >
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
                <Text style={[styles.signOutText, { color: colors.error }]}>Sign Out</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 1200,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
  },
  content: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 600,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  nameText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
  },
  guestBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  guestBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  upgradeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  upgradeTextContainer: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeSubtitle: {
    fontSize: 14,
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
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
  },
  settingsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
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
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  signOutText: {
    fontSize: 18,
    fontWeight: 'bold',
  }
});
