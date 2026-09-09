import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  useWindowDimensions 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { ZoomIn } from 'react-native-reanimated';

export default function DeleteConfirmation({ recipe, visible, onClose, onConfirm }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();

  if (!recipe || !visible) return null;

  // Strict compact width calculation for PC/Web & Mobile (max 380px)
  const cardWidth = Math.min(width * 0.85, 380);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} style={{ width: cardWidth }}>
          <Animated.View 
            entering={ZoomIn.duration(250)} 
            style={[
              styles.modalBox, 
              { 
                width: cardWidth, 
                backgroundColor: colors.surface,
                borderColor: colors.borderLight 
              }
            ]}
          >
            
            <View style={[styles.iconContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="trash-outline" size={28} color={colors.error} />
            </View>
            
            <Text style={[styles.title, { color: colors.text }]}>Delete Recipe?</Text>
            <Text style={[styles.message, { color: colors.textSecondary }]}>
              Are you sure you want to delete <Text style={[styles.bold, { color: colors.text }]}>{recipe.title}</Text>? This action cannot be undone.
            </Text>

            <View style={styles.buttonsRow}>
              <TouchableOpacity 
                style={[styles.cancelBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                onPress={onClose}
              >
                <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.deleteBtn, { backgroundColor: colors.error }]} 
                onPress={() => onConfirm(recipe.id)}
              >
                <Text style={[styles.deleteBtnText, { color: '#FFFFFF' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
            
          </Animated.View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    maxWidth: 380,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 14,
    fontWeight: '700',
  }
});
