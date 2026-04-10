import React from 'react';
import { View, Text, StyleSheet, Platform, Image } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function Header() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
      <View style={styles.innerContainer}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/chefstack_logo.png')} style={{ width: 32, height: 32 }} />
          <Text style={[styles.logoText, { color: colors.text }]}>ChefStack</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    width: '100%',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'web' ? 16 : 60,
    paddingBottom: 16,
    paddingHorizontal: 20,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});
