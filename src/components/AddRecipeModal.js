import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  BackHandler
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';

export default function AddRecipeModal({ visible, onClose, onSave, editingRecipe }) {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ulam');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  
  const [time, setTime] = useState('30');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [image, setImage] = useState(null);
  
  const [newIngredient, setNewIngredient] = useState('');
  const [newStep, setNewStep] = useState('');
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (visible) {
      if (editingRecipe) {
        setTitle(editingRecipe.title || '');
        setCategory(editingRecipe.category || 'Ulam');
        setTime(editingRecipe.time?.toString() || '30');
        setIngredients(editingRecipe.ingredients || []);
        setSteps(editingRecipe.steps || []);
        setImage(editingRecipe.image || null);
      } else {
        setTitle('');
        setCategory('Ulam');
        setTime('30');
        setIngredients([]);
        setSteps([]);
        setImage(null);
      }
      setErrors({});
      setNewIngredient('');
      setNewStep('');
    }
  }, [visible, editingRecipe]);

  useEffect(() => {
    if (!visible) return;

    const onBack = () => {
      onClose();
      return true;
    };

    if (Platform.OS === 'web') {
      window.history.pushState({ modal: 'add-recipe' }, '');
      window.addEventListener('popstate', onBack);
      return () => window.removeEventListener('popstate', onBack);
    } else {
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBack);
      return () => subscription.remove();
    }
  }, [visible, onClose]);

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const removeIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const addStep = () => {
    if (newStep.trim()) {
      setSteps([...steps, newStep.trim()]);
      setNewStep('');
    }
  };

  const removeStep = (index) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = () => {
    const errs = {};
    if (!title.trim()) errs.title = 'Title is required';
    if (!time.trim() || isNaN(parseInt(time))) errs.time = 'Valid time is required';
    if (ingredients.length === 0) errs.ingredients = 'Add at least one ingredient';
    if (steps.length === 0) errs.steps = 'Add at least one step';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      ...(editingRecipe || {}),
      title: title.trim(),
      type: category === 'Drinks' ? 'drink' : 'food',
      category,
      time: parseInt(time),
      ingredients,
      steps,
      image,
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="close-outline" size={28} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
            <Text style={[styles.saveBtnText, { color: colors.surface }]}>
              {editingRecipe ? 'Update' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
          {/* Image Picker */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>RECIPE IMAGE</Text>
            <TouchableOpacity 
              style={[styles.imagePickerBtn, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
              onPress={pickImage}
            >
              {image ? (
                <>
                  <Image source={{ uri: image }} style={styles.imagePreview} />
                  <View style={styles.imageOverlayTextBg}>
                    <Text style={styles.imageOverlayText}>Change Image</Text>
                  </View>
                </>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera" size={32} color={colors.textMuted} />
                  <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Tap to upload image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Title */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>RECIPE TITLE</Text>
            <TextInput
              style={[
                styles.input, 
                { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text },
                errors.title && { borderColor: colors.error, backgroundColor: colors.error + '05' }
              ]}
              placeholder="e.g. Adobong Manok"
              value={title}
              onChangeText={(val) => { setTitle(val); setErrors({...errors, title: null}); }}
              placeholderTextColor={colors.textMuted}
            />
            {errors.title && <Text style={[styles.errorText, { color: colors.error }]}>{errors.title}</Text>}
          </View>

          {/* Category Dropdown */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>CATEGORY</Text>
            <TouchableOpacity 
              style={[styles.dropdownToggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
              onPress={() => setCategoryDropdownVisible(true)}
            >
              <Text style={[styles.dropdownToggleText, { color: colors.text }]}>{category}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Time */}
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>TIME (MIN)</Text>
            <View style={styles.timeInputContainer}>
              <Ionicons name="time-outline" size={24} color={colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[
                  styles.input, 
                  styles.inputWithIcon, 
                  { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text },
                  errors.time && { borderColor: colors.error, backgroundColor: colors.error + '05' }
                ]}
                placeholder="30"
                value={time}
                onChangeText={(val) => { setTime(val); setErrors({...errors, time: null}); }}
                keyboardType="numeric"
                placeholderTextColor={colors.textMuted}
              />
            </View>
            {errors.time && <Text style={[styles.errorText, { color: colors.error }]}>{errors.time}</Text>}
          </View>

          {/* Ingredients */}
          <View style={styles.formGroup}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={[
                  styles.input, 
                  { flex: 1, marginBottom: 0, backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }
                ]}
                placeholder="e.g. 1 kg chicken"
                value={newIngredient}
                onChangeText={setNewIngredient}
                onSubmitEditing={addIngredient}
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity 
                style={[styles.addBtn, { borderColor: colors.primary }]} 
                onPress={addIngredient}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {ingredients.length > 0 && (
              <View style={styles.listContainer}>
                {ingredients.map((item, i) => (
                  <View key={i} style={[styles.listItemLine, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <Text style={[styles.listItemText, { color: colors.text }]}>{item}</Text>
                    <TouchableOpacity onPress={() => removeIngredient(i)}>
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {errors.ingredients && <Text style={[styles.errorText, { color: colors.error }]}>{errors.ingredients}</Text>}
          </View>

          {/* Steps */}
          <View style={styles.formGroup}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Steps</Text>
            <View style={styles.addInputRow}>
              <TextInput
                style={[
                  styles.input, 
                  { flex: 1, marginBottom: 0, backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }
                ]}
                placeholder="e.g. Marinate chicken"
                value={newStep}
                onChangeText={setNewStep}
                onSubmitEditing={addStep}
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity 
                style={[styles.addBtn, { borderColor: colors.primary }]} 
                onPress={addStep}
              >
                <Ionicons name="add" size={24} color={colors.primary} />
                <Text style={[styles.addBtnText, { color: colors.primary }]}>Add</Text>
              </TouchableOpacity>
            </View>
            
            {steps.length > 0 && (
              <View style={styles.listContainer}>
                {steps.map((step, i) => (
                  <View key={i} style={[styles.listItemLine, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                    <View style={[styles.stepNumBubble, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.stepNumText, { color: colors.surface }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.listItemText, { color: colors.text }]}>{step}</Text>
                    <TouchableOpacity onPress={() => removeStep(i)}>
                      <Ionicons name="close-circle" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            {errors.steps && <Text style={[styles.errorText, { color: colors.error }]}>{errors.steps}</Text>}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* Category Dropdown Overlay */}
      {categoryDropdownVisible && (
        <TouchableOpacity 
          style={styles.dropdownOverlay} 
          activeOpacity={1} 
          onPress={() => setCategoryDropdownVisible(false)}
        >
          <View style={[styles.dropdownMenu, { backgroundColor: colors.surface }]}>
            {['Ulam', 'Meryenda', 'Drinks', 'Dessert', 'Appetizer', 'Soup', 'Breakfast'].map(c => (
              <TouchableOpacity 
                key={c} 
                style={[
                  styles.dropdownItem, 
                  category === c && { backgroundColor: colors.primary + '15' }
                ]}
                onPress={() => {
                  setCategory(c);
                  setCategoryDropdownVisible(false);
                }}
              >
                <Text style={[
                  styles.dropdownItemText, 
                  { color: colors.textSecondary },
                  category === c && { color: colors.primary, fontWeight: 'bold' }
                ]}>
                  {c}
                </Text>
                {category === c && <Ionicons name="checkmark" size={20} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    height: 60,
  },
  headerBtn: {
    padding: 8,
    zIndex: 10,
  },
  titleContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  saveBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 24,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 1,
  },
  input: {
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 8,
    fontWeight: '500',
  },
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dropdownToggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  timeInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 56,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderWidth: 2,
    borderRadius: 16,
    gap: 4,
  },
  addBtnText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    gap: 8,
  },
  listItemLine: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listItemText: {
    flex: 1,
    fontSize: 16,
    marginRight: 12,
  },
  stepNumBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  imagePickerBtn: {
    width: '100%',
    height: 180,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlayTextBg: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 8,
    alignItems: 'center',
  },
  imageOverlayText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imagePlaceholder: {
    alignItems: 'center',
    gap: 8,
  },
  imagePlaceholderText: {
    fontWeight: '600',
  }
});
