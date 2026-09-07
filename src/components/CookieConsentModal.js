import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';

const CONSENT_KEY = '@chefstack_cookie_consent';

export default function CookieConsentModal({ onNavigateToPolicy }) {
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
    try {
      await AsyncStorage.setItem(CONSENT_KEY, JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString() }));
      setVisible(false);
    } catch (e) {
      setVisible(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Ionicons name="shield-checkmark" size={26} color={colors.primary} />
            <Text style={styles.title}>Cookie & Storage Choice</Text>
          </View>

          <Text style={styles.description}>
            We use strictly necessary local storage (AsyncStorage) to keep you logged in and enable offline recipe browsing. We do NOT sell your data or use cross-site tracking cookies.
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.btn, styles.secondaryBtn]}
              onPress={acceptEssentialOnly}
              accessibilityLabel="Accept strictly necessary local storage only"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryBtnText}>Essential Only</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.btn, styles.primaryBtn]}
              onPress={acceptAll}
              accessibilityLabel="Accept all cookies and local storage"
              accessibilityRole="button"
            >
              <Text style={styles.primaryBtnText}>Accept All</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 21,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: colors.primary,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  secondaryBtnText: {
    color: colors.text,
    fontWeight: '600',
    fontSize: 14,
  }
});
