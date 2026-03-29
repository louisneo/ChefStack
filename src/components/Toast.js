import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withDelay,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

const Toast = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // success, error

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success') => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);
      
      // Auto-hide after 3 seconds
      setTimeout(() => {
        setVisible(false);
      }, 3000);
    }
  }));

  if (!visible) return null;

  return (
    <Animated.View 
      entering={FadeInUp.duration(400)}
      exiting={FadeOutUp.duration(400)}
      style={[
        styles.toast, 
        type === 'error' ? styles.errorToast : styles.successToast
      ]}
    >
      <Ionicons 
        name={type === 'success' ? 'checkmark-circle' : 'alert-circle'} 
        size={24} 
        color={colors.surface} 
      />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
    gap: 12,
  },
  successToast: {
    backgroundColor: colors.primary,
  },
  errorToast: {
    backgroundColor: '#ef4444',
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  }
});

export default Toast;
