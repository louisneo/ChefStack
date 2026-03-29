import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Modal 
} from 'react-native';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

export default function DeleteConfirmation({ recipe, visible, onClose, onConfirm }) {
  if (!recipe || !visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View entering={ZoomIn.duration(300)} style={styles.modalBox}>
          
          <View style={styles.iconContainer}>
            <Ionicons name="trash" size={32} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Delete Recipe?</Text>
          <Text style={styles.message}>
            Are you sure you want to delete <Text style={styles.bold}>{recipe.title}</Text>? This action cannot be undone.
          </Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => onConfirm(recipe.id)}>
              <Text style={styles.deleteBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
          
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalBox: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.primaryLight,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: colors.text,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.borderLight,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.surface,
  }
});
