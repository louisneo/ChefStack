import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

const CONSENT_KEY = '@chefstack_cookie_consent';

export default function CookieConsentModal({ onNavigateToPolicy }) {
  const { colors } = useTheme();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    checkConsent();
  }, []);

  const checkConsent = async () => {
    try {
      const consent = await AsyncStorage.getItem(CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch (e) {
      setVisible(true);
    }
  };

  const acceptAll = async () => {
    try {
      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: true, timestamp: new Date().toISOString() }));
      setVisible(false);
    } catch (e) {
      setVisible(false);
    }
  };

  const acceptEssentialOnly = async () => {
    // Keep cookie banner visible while storing essential choice
    try {
      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString() }));
      // Do not call setVisible(false) so banner remains visible on screen
    } catch (e) {
      // ignore
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      <Animated.View 
        entering={FadeInDown.duration(300)}
        exiting={FadeOutDown.duration(200)}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      >
        <View style={styles.headerRow}>
          <Ionicons name="shield-checkmark" size={24} color={colors.primary} />
          <Text style={[styles.title, { color: colors.text }]}>Cookie & Storage Choice</Text>
          <TouchableOpacity 
            onPress={() => setVisible(false)} 
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          We use local storage to keep you logged in and enable offline recipe access. No cross-site tracking cookies are used.
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={[styles.btn, styles.secondaryBtn, { borderColor: colors.borderLight }]}
            onPress={acceptEssentialOnly}
            accessibilityLabel="Accept essential storage only"
            accessibilityRole="button"
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Essential Only</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.btn, styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={acceptAll}
            accessibilityLabel="Accept all cookies and storage"
            accessibilityRole="button"
          >
            <Text style={styles.primaryBtnText}>Accept All</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    bottom: 75,
    left: 16,
    right: 16,
    zIndex: 9999,
    alignItems: 'center',
    pointerEvents: 'box-none',
  },
  card: {
    width: '100%',
    maxWidth: 540,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 13,
  }
});
