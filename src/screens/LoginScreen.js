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
  ScrollView
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { signIn, signInAsGuest } = useAuth();
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
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
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
  }
});
