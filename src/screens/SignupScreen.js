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
  ScrollView,
  Image
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';

export default function SignupScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const { signUp, signInAsGuest } = useAuth();
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Cooldown effect
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => c - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);


  const handleSignup = async () => {
    if (!fullName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      Alert.alert('Error', 'Please enter a valid, working email address');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (!agreed) {
      Alert.alert('Error', 'You must agree to the Terms & Conditions');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting signup for:', email);
      const { data, error } = await signUp(email, password, fullName);
      
      if (error) {
        console.error('Signup error caught:', error);
        if (error.message?.includes('Too Many Requests') || error.status === 429) {
          setCooldown(60);
          Alert.alert(
            'Server Busy', 
            `Too many signup attempts! Please wait for the cooldown timer (60s) before trying again.\n\nTip: You can increase this limit in your Supabase Dashboard.`
          );
        } else {
          Alert.alert('Signup Failed', error.message);
        }
      } else if (!data?.user) {
        // Silent failure case
        console.warn('Signup returned no error and no user data.');
        Alert.alert('Server Error', 'The signup request failed silently. Please try again on a different network or wait for the cooldown.');
        setCooldown(10);
      } else {
        console.log('Signup successful:', data.user.id);
        Alert.alert('Success', 'Account created successfully! You can now sign in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err) {
      console.error('Unexpected signup crash:', err);
      Alert.alert('App Error', `An unexpected failure occurred: ${err.message || 'Unknown error'}`);
    } finally {
      // Add a tiny delay to prevent rapid-fire clicks even after isLoading is reset
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleGuestSignup = async () => {
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Back button */}
      <TouchableOpacity 
        style={[styles.backButton, { backgroundColor: colors.surface }]} 
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <Image source={require('../../assets/chefstack_logo.png')} style={{ width: 100, height: 100 }} />
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join ChefStack community</Text>
        </Animated.View>

        {/* Form */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text, outlineStyle: 'none' }]}
              placeholder="Juan Dela Cruz"
              value={fullName}
              onChangeText={setFullName}
              placeholderTextColor={colors.textMuted}
            />
          </View>

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

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirm Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text, outlineStyle: 'none' }]}
              placeholder="••••••••"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
          >
            <View style={[styles.checkbox, { backgroundColor: colors.surface, borderColor: colors.borderLight }, agreed && { backgroundColor: colors.primary, borderColor: colors.primary }]}>
              {agreed && <Ionicons name="checkmark" size={16} color={colors.surface} />}
            </View>
            <Text style={[styles.checkboxText, { color: colors.textSecondary }]}>
              I agree to the <Text style={[styles.linkTextBold, { color: colors.primary }]}>Terms & Conditions</Text> and <Text style={[styles.linkTextBold, { color: colors.primary }]}>Privacy Policy</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.signupButton, { backgroundColor: colors.primary }, cooldown > 0 && { backgroundColor: colors.textMuted, opacity: 0.7 }]} 
            onPress={handleSignup}
            disabled={isLoading || cooldown > 0}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.surface} />
            ) : (
              <Text style={[styles.signupButtonText, { color: colors.surface }]}>
                {cooldown > 0 ? `Wait ${cooldown}s` : 'Create Account'}
              </Text>
            )}
          </TouchableOpacity>


          <TouchableOpacity 
            style={styles.guestButton} 
            onPress={handleGuestSignup}
            disabled={isLoading}
          >
            <Text style={[styles.guestButtonText, { color: colors.textSecondary }]}>Continue as Guest</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
          >
            <Text style={[styles.linkText, { color: colors.textSecondary }]}>
              Already have an account? <Text style={[styles.linkTextBold, { color: colors.primary }]}>Sign In</Text>
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
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 10 : 60,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 32,
    paddingTop: Platform.OS === 'web' ? 30 : 120,
    paddingBottom: 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'web' ? 32 : 60,
  },
  title: {
    fontSize: 32,
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingRight: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  signupButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 12,
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  linkButton: {
    alignItems: 'center',
  },
  linkText: {
    fontSize: 16,
  },
  linkTextBold: {
    fontWeight: 'bold',
  }
});
