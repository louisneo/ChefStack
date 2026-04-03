import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import ChefStackLogo from './ChefStackLogo';

export default function Header({ onMenuClick, onAddClick, onAISearch }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.iconButton} 
        onPress={onMenuClick}
        activeOpacity={0.7}
      >
        <Ionicons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>
      
      <View style={styles.logoContainer}>
        <ChefStackLogo size={32} withBackground={true} />
        <Text style={styles.logoText}>ChefStack</Text>
      </View>

      <View style={styles.rightButtons}>
        {onAISearch && (
          <TouchableOpacity 
            style={styles.aiButton} 
            onPress={onAISearch}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.addButton} 
          onPress={onAddClick}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'web' ? 5 : 60, // reduce padding on web
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
