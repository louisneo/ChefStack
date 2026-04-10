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
  const [errorMsg, setErrorMsg] = useState('');
  
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
    setErrorMsg('');
    if (!fullName || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all fields.');
      return;
    }
    
    // Strict email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setErrorMsg('You must agree to the Terms & Conditions.');
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
          setErrorMsg('Too many signup attempts! Please wait for 60 seconds.');
        } else if (error.message?.includes('Error sending confirmation email')) {
          setErrorMsg('Server Error: Supabase Email Confirmations are still ON. Please disable them in your Supabase Auth Providers settings.');
        } else {
          setErrorMsg(error.message);
        }
      } else if (!data?.user) {
        // Silent failure case
        console.warn('Signup returned no error and no user data.');
        setErrorMsg('The signup request failed silently. Please try again.');
        setCooldown(10);
      } else {
        console.log('Signup successful:', data.user.id);
        Alert.alert('Success', 'Account created successfully! You can now sign in.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      }
    } catch (err) {
      console.error('Unexpected signup crash:', err);
      setErrorMsg(`An unexpected failure occurred: ${err.message || 'Unknown error'}`);
    } finally {
      // Add a tiny delay to prevent rapid-fire clicks even after isLoading is reset
      setTimeout(() => setIsLoading(false), 1000);
    }
  };

  const handleGuestSignup = async () => {
    setErrorMsg('');
    setIsLoading(true);
    const { error } = await signInAsGuest();
    setIsLoading(false);
    if (error) {
      if (error.message?.includes('Anonymous sign-ins are not enabled')) {
        setErrorMsg('Guest Mode is disabled in the Supabase Dashboard. Please contact the developer.');
      } else {
        setErrorMsg(error.message);
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

          {errorMsg ? (
            <Animated.View entering={FadeInDown} style={{ backgroundColor: colors.error + '20', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: colors.error + '40' }}>
              <Text style={{ color: colors.error, fontSize: 14, textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</Text>
            </Animated.View>
          ) : null}

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
