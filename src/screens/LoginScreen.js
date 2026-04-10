import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const { signIn, signInAsGuest, resetPassword } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  const handleGuestLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const { error } = await signInAsGuest();
    setIsLoading(false);
    if (error) {
      if (error.message?.includes('Anonymous sign-ins are disabled') || error.message?.includes('not enabled')) {
        setErrorMsg('Guest Mode is disabled in your Supabase Dashboard.');
      } else {
        setErrorMsg(error.message);
      }
    }
  };

  const handleLogin = async () => {
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message?.includes('Too Many Requests') || error.status === 429) {
          setErrorMsg('Server is currently busy. Please wait a few minutes.');
        } else if (error.message?.includes('Invalid login credentials')) {
          setErrorMsg('The email you entered is not registered, or the password is incorrect. Please try again.');
        } else {
          setErrorMsg(error.message);
        }
      }
    } finally {
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleResetPassword = async () => {
    setResetErrorMsg('');
    setResetSuccessMsg('');
    if (!resetEmail) {
      setResetErrorMsg('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail.trim())) {
      setResetErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    const { error } = await resetPassword(resetEmail.trim());
    setIsLoading(false);

    if (error) {
      if (error.message?.includes('Too Many Requests') || error.status === 429) {
        setResetErrorMsg('Too many requests. Please wait a few minutes.');
      } else {
        setResetErrorMsg(error.message);
      }
    } else {
      setResetSuccessMsg('Recovery link sent! Check your inbox.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Image source={require('../../assets/chefstack_logo.png')} style={{ width: 120, height: 120 }} />
          <Text style={[styles.title, { color: colors.text }]}>ChefStack</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Your Personal Recipe Manager</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Email Address</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text, outlineStyle: 'none' }]}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text, outlineStyle: 'none' }]}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
            <TouchableOpacity onPress={() => setShowResetModal(true)} style={{ alignSelf: 'flex-end', marginTop: 8 }}>
              <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '600' }}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          {errorMsg ? (
            <Animated.View entering={FadeInDown} style={{ backgroundColor: colors.error + '20', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error + '40' }}>
              <Text style={{ color: colors.error, fontSize: 14, textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: colors.primary }]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.loginButtonText, { color: colors.surface }]}>Sign In</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>
              Don't have an account? <Text style={[styles.linkTextBold, { color: colors.primary }]}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>

      {/* Password Reset Modal */}
      <Modal visible={showResetModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.duration(300)} style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="key-outline" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.modalMessage, { color: colors.textSecondary }]}>
              Enter your email address to receive a password reset link.
            </Text>
            
            <TextInput
              style={[styles.input, { width: '100%', marginBottom: 16, backgroundColor: colors.background, borderColor: colors.borderLight, color: colors.text, outlineStyle: 'none' }]}
              placeholder="you@example.com"
              value={resetEmail}
              onChangeText={setResetEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />

            {resetErrorMsg ? (
              <Text style={{ color: colors.error, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>{resetErrorMsg}</Text>
            ) : null}

            {resetSuccessMsg ? (
              <Text style={{ color: colors.success, fontSize: 13, marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>{resetSuccessMsg}</Text>
            ) : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.borderLight }]} 
                onPress={() => { setShowResetModal(false); setResetErrorMsg(''); setResetSuccessMsg(''); setResetEmail(''); }}
              >
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: colors.primary }]} 
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator color={colors.surface} /> : <Text style={[styles.modalBtnText, { color: colors.surface, fontWeight: 'bold' }]}>Send Link</Text>}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 16 : 32,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.OS === 'web' ? 32 : 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
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
  loginButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkButton: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  linkText: {
    fontSize: 16,
  },
  linkTextBold: {
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
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginTop: 8,
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
