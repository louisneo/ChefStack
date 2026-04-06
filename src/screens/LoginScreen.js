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
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signInAsGuest } = useAuth();
  const navigation = useNavigation();


  const handleGuestLogin = async () => {
    setIsLoading(true);
    const { error } = await signInAsGuest();
    setIsLoading(false);
    if (error) {
      if (error.message?.includes('Anonymous sign-ins are not enabled')) {
        Alert.alert('Configuration Error', 'Guest Mode is not yet enabled in the Supabase Dashboard. Please contact the developer.');
      } else {
        Alert.alert('Guest Login Failed', error.message);
      }
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        if (error.message?.includes('Too Many Requests') || error.status === 429) {
          Alert.alert(
            'Server Busy', 
            'Too many login attempts! Please wait a few minutes, or try using Google/Facebook login instead.'
          );
        } else {
          Alert.alert('Login Failed', error.message);
        }
      }
    } finally {
      // Add a tiny delay to prevent rapid-fire clicks even after isLoading is reset
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        {/* Logo */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <Image source={require('../../assets/chefstack_logo.png')} style={{ width: 120, height: 120 }} />
          <Text style={styles.title}>ChefStack</Text>
          <Text style={styles.subtitle}>Your Personal Recipe Manager</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={handleGuestLogin}
            disabled={isLoading}
          >
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => navigation.navigate('Signup')}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>
              Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF2F2', // Light red gradient equivalent
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: Platform.OS === 'web' ? 16 : 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.OS === 'web' ? 32 : 60,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  form: {
    width: '100%',
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
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  loginButtonText: {
    color: colors.surface,
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  guestButtonText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    color: colors.primary,
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: 'bold',
  }
});
