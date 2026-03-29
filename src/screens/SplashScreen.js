import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { FontAwesome5 } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export default function SplashScreen() {
  const { user, loading } = useAuth();
  
  // Animation Values
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Elegant entrance: fade in and scale up
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 10,
        friction: 4,
        useNativeDriver: true,
      })
    ]).start(() => {
      // Endless gentle bouncing after entrance
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -15,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1000,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      {/* Subtle background circles */}
      <View style={[styles.blurCircle, { top: '10%', left: -50, width: 200, height: 200 }]} />
      <View style={[styles.blurCircle, { bottom: -50, right: -50, width: 250, height: 250 }]} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }, { translateY }] }]}>
        <View style={styles.iconCircle}>
          <Image source={require('../../assets/chefstack_logo_v2.png')} style={styles.logoImage} />
        </View>
        <Text style={styles.title}>ChefStack</Text>
        <Text style={styles.subtitle}>Your Culinary Companion</Text>
        <View style={styles.loadingDots}>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.dot}>•</Text>
        </View>
      </Animated.View>

      <Text style={styles.footer}>Naga City, Camarines Sur 🇵🇭</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    width: '100%',
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden', // clips the image perfectly to circle
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
    marginTop: 8,
    marginBottom: 40,
    textAlign: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    color: colors.surface,
    fontSize: 28,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  }
});
