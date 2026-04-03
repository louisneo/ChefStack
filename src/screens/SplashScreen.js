import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { colors } from '../theme/colors';
import ChefStackLogo from '../components/ChefStackLogo';

export default function SplashScreen() {
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 10, friction: 4, useNativeDriver: true })
    ]).start(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, { toValue: -12, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
          Animated.timing(translateY, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })
        ])
      ).start();
    });

    Animated.loop(
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // On web, use fixed positioning to escape any parent container constraints
  const containerStyle = Platform.OS === 'web' 
    ? [styles.container, { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }]
    : [styles.container];

  return (
    <View style={containerStyle}>
      <View style={[styles.blurCircle, styles.circle1]} />
      <View style={[styles.blurCircle, styles.circle2]} />
      <View style={[styles.blurCircle, styles.circle3]} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }, { translateY }] }]}>
        <View style={styles.iconCircle}>
          <ChefStackLogo size={100} withBackground={false} />
        </View>
        <Text style={styles.title}>ChefStack</Text>
        <Text style={styles.subtitle}>Your Culinary Companion</Text>
        <View style={styles.loadingDots}>
          <Animated.Text style={[styles.dot, { opacity: dot1 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3 }]}>•</Animated.Text>
        </View>
      </Animated.View>

      <Text style={styles.footer}>Naga City, Camarines Sur 🇵🇭</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    overflow: 'hidden',
  },
  blurCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 9999,
  },
  circle1: { top: '10%', left: '-12%', width: 200, height: 200 },
  circle2: { bottom: '5%', right: '-10%', width: 220, height: 220 },
  circle3: { top: '40%', right: '-15%', width: 140, height: 140 },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  iconCircle: {
    width: 130,
    height: 130,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 65,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
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
  dot: { color: colors.surface, fontSize: 28 },
  footer: {
    position: 'absolute',
    bottom: 40,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  }
});
