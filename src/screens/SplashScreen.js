import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import ChefStackLogo from '../components/ChefStackLogo';

export default function SplashScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Animation Values
  const scale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // Animated dots
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Entrance animation
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
      // Gentle floating animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(translateY, {
            toValue: -12,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          })
        ])
      ).start();
    });

    // Loading dots animation
    const animateDots = () => {
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
    };
    animateDots();
  }, []);

  // Dynamic sizing based on screen
  const logoSize = Math.min(width * 0.3, height * 0.18, 140);
  const titleSize = Math.min(width * 0.11, 48);
  const subtitleSize = Math.min(width * 0.045, 18);

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Background decorative circles — responsive */}
      <View style={[styles.blurCircle, { 
        top: height * 0.05, left: -width * 0.12, 
        width: width * 0.5, height: width * 0.5 
      }]} />
      <View style={[styles.blurCircle, { 
        bottom: height * 0.05, right: -width * 0.12, 
        width: width * 0.55, height: width * 0.55 
      }]} />
      <View style={[styles.blurCircle, { 
        top: height * 0.4, right: -width * 0.2, 
        width: width * 0.35, height: width * 0.35 
      }]} />

      <Animated.View style={[styles.content, { opacity, transform: [{ scale }, { translateY }] }]}>
        <View style={[styles.iconCircle, { width: logoSize + 20, height: logoSize + 20, borderRadius: (logoSize + 20) / 2 }]}>
          <ChefStackLogo size={logoSize} withBackground={false} />
        </View>
        <Text style={[styles.title, { fontSize: titleSize }]}>ChefStack</Text>
        <Text style={[styles.subtitle, { fontSize: subtitleSize }]}>Your Culinary Companion</Text>
        <View style={styles.loadingDots}>
          <Animated.Text style={[styles.dot, { opacity: dot1 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot2 }]}>•</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: dot3 }]}>•</Animated.Text>
        </View>
      </Animated.View>

      <Text style={[styles.footer, { bottom: insets.bottom + 20 }]}>
        Naga City, Camarines Sur 🇵🇭
      </Text>
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
    borderRadius: 9999,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  iconCircle: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontWeight: 'bold',
    color: colors.surface,
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitle: {
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
  },
  footer: {
    position: 'absolute',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  }
});
