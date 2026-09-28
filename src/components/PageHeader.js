import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function PageHeader({ title, subtitle, icon, onBack, rightComponent, noBorder, maxWidth }) {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.headerContainer, !noBorder && { borderBottomWidth: 1, borderBottomColor: colors.borderLight }]}>
      <View style={[styles.innerWrapper, maxWidth ? { maxWidth } : null]}>
        <View style={styles.headerLeft}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
          <View style={styles.headerTitleGroup}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
            {subtitle && (
              <View style={styles.dateGroup}>
                <Ionicons name={icon || "information-circle-outline"} size={14} color={colors.textMuted} />
                <Text style={[styles.dateText, { color: colors.textMuted }]}>{subtitle}</Text>
              </View>
            )}
          </View>
        </View>
        {rightComponent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: '100%',
    zIndex: 10,
  },
  innerWrapper: {
    width: '100%',
    maxWidth: 1100,
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleGroup: {
    justifyContent: 'center',
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 12,
  },
});
