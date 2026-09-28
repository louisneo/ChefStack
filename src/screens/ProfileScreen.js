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
  Switch,
  Modal
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import PageHeader from '../components/PageHeader';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const navigation = useNavigation();
  
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [location, setLocation] = useState('Naga City, Philippines');
  const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        <PageHeader title="Profile" subtitle="Manage your account" icon="person-outline" onBack={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home')} />

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



            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
              <TouchableOpacity 
                style={[styles.signOutButton, { backgroundColor: colors.error + '15' }]} 
                onPress={() => {
                  if (isGuest) {
                    setShowLogoutModal(true);
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

      {/* Guest Sign Out Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="warning" size={40} color={colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Warning: Guest Account</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              As a guest, your saved recipes and data will be permanently cleared if you sign out.
            </Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary, fontWeight: 'bold' }]}>
              Are you sure you want to proceed?
            </Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.borderLight }]} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.error }]} 
                onPress={() => {
                  setShowLogoutModal(false);
                  signOut();
                }}
              >
                <Text style={[styles.modalBtnText, { color: colors.surface, fontWeight: 'bold' }]}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    paddingBottom: 120,
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(217, 4, 41, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnText: {
    fontSize: 16,
    fontWeight: '600',
  }
});
