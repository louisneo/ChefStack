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
  BackHandler,
  Switch,
  ActivityIndicator,
  useWindowDimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import { standardizeCategory, STANDARD_CATEGORIES } from '../lib/categories';

const getIngredientIcon = (text) => {
  const lower = text.toLowerCase();
  if (lower.includes('garlic') || lower.includes('onion')) return 'nutrition-outline';
  if (lower.includes('sauce') || lower.includes('oil') || lower.includes('vinegar') || lower.includes('milk') || lower.includes('water')) return 'wine-outline';
  if (lower.includes('pork') || lower.includes('chicken') || lower.includes('beef') || lower.includes('meat') || lower.includes('shrimp')) return 'restaurant-outline';
  if (lower.includes('rice') || lower.includes('noodle') || lower.includes('pasta')) return 'grid-outline';
  if (lower.includes('pepper') || lower.includes('salt') || lower.includes('spice') || lower.includes('sugar')) return 'sparkles-outline';
  return 'cube-outline';
};

export default function AddRecipeModal({ visible, onClose, onSave, editingRecipe }) {
  const { colors, isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Ulam');
  const [categoryDropdownVisible, setCategoryDropdownVisible] = useState(false);
  
  const [time, setTime] = useState('30');
  const [servings, setServings] = useState('4');
  const [ingredients, setIngredients] = useState([]);
  const [steps, setSteps] = useState([]);
  const [image, setImage] = useState(null);
  
  const [newIngredient, setNewIngredient] = useState('');
  const [newStep, setNewStep] = useState('');
  const [aiDraftEnabled, setAiDraftEnabled] = useState(true);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (visible) {
      if (editingRecipe) {
        setTitle(editingRecipe.title || '');
        setCategory(standardizeCategory(editingRecipe.category, editingRecipe.title));
        setTime(editingRecipe.time?.toString() || '30');
        setServings(editingRecipe.servings?.toString() || '4');
        setIngredients(editingRecipe.ingredients || []);
        setSteps(editingRecipe.steps || []);
        setImage(editingRecipe.image || null);
      } else {
        setTitle('');
        setCategory('Ulam');
        setTime('30');
        setServings('4');
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
      aspect: [16, 9],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImage(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleGenerateAIDescription = () => {
    if (!title.trim()) {
      setErrors({ ...errors, title: 'Please enter a title first to generate steps' });
      return;
    }
    setAiGenerating(true);
    setTimeout(() => {
      const draftSteps = [
        `Prepare and marinate ${title.trim()} ingredients for 20-30 minutes.`,
        `Heat cooking oil in a pan over medium flame.`,
        `Sauté garlic, onions, and key spices until fragrant.`,
        `Add main ingredients and simmer until tender and thoroughly cooked.`,
        `Season to taste and serve hot!`
      ];
      setSteps(draftSteps);
      if (ingredients.length === 0) {
        setIngredients([`1 kg ${title.trim()} main protein/veggies`, `5 cloves Garlic`, `1/2 cup Soy Sauce/Seasoning`, `1 tbsp Black Peppercorn`]);
      }
      setAiGenerating(false);
    }, 800);
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

    const stdCat = standardizeCategory(category, title);
    onSave({
      ...(editingRecipe || {}),
      title: title.trim(),
      type: stdCat === 'Drinks' ? 'drink' : 'food',
      category: stdCat,
      time: parseInt(time),
      servings: parseInt(servings) || 4,
      ingredients,
      steps,
      image,
    });
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={{ flex: 1, width: '100%', backgroundColor: colors.background }}>
        <KeyboardAvoidingView 
          style={[styles.container, { backgroundColor: colors.background }]}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
        >
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
            <TouchableOpacity onPress={onClose} style={styles.headerBtn} accessibilityLabel="Close Modal">
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {editingRecipe ? 'Edit Recipe' : 'New Recipe'}
              </Text>
            </View>
            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]}>
              <Text style={[styles.saveBtnText, { color: '#FFFFFF' }]}>
                {editingRecipe ? 'Update' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formContainer} contentContainerStyle={styles.formContent} showsVerticalScrollIndicator={false}>
            
            {/* Card 0: Cover Photo Section */}
            <View style={[styles.coverContainer, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              {image ? (
                <Image source={{ uri: image }} style={styles.coverImage} />
              ) : (
                <View style={[styles.coverPlaceholder, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                  <Ionicons name="restaurant-outline" size={48} color={colors.textMuted} />
                </View>
              )}
              
              {/* Glassmorphic Change Cover Button */}
              <TouchableOpacity 
                style={[styles.changeCoverBtn, { backgroundColor: isDark ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.9)' }]}
                onPress={pickImage}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={18} color={colors.text} />
                <Text style={[styles.changeCoverText, { color: colors.text }]}>Change Cover</Text>
              </TouchableOpacity>
            </View>

            {/* Card 1: RECIPE TITLE */}
            <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>RECIPE TITLE</Text>
              <TextInput
                style={[
                  styles.input, 
                  { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text },
                  errors.title && { borderColor: colors.error, backgroundColor: colors.error + '10' }
                ]}
                placeholder="e.g. Adobong Manok"
                value={title}
                onChangeText={(val) => { setTitle(val); setErrors({...errors, title: null}); }}
                placeholderTextColor={colors.textMuted}
              />
              {errors.title && <Text style={[styles.errorText, { color: colors.error }]}>{errors.title}</Text>}
            </View>

            {/* Card 2: Category, Time (Min), Servings (Row Layout) */}
            <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={[styles.rowContainer, { flexDirection: isDesktop ? 'row' : 'column' }]}>
                
                {/* Category Column */}
                <View style={[styles.rowCol, { flex: 1.2 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Category</Text>
                  <TouchableOpacity 
                    style={[styles.dropdownToggle, { backgroundColor: colors.surface, borderColor: colors.borderLight }]} 
                    onPress={() => setCategoryDropdownVisible(true)}
                  >
                    <Text style={[styles.dropdownToggleText, { color: colors.text }]}>{category}</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                {/* Time (Min) Column */}
                <View style={[styles.rowCol, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Time (Min)</Text>
                  <View style={styles.timeInputContainer}>
                    <Ionicons name="time-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[
                        styles.input, 
                        styles.inputWithIcon, 
                        { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text },
                        errors.time && { borderColor: colors.error }
                      ]}
                      placeholder="30"
                      value={time}
                      onChangeText={(val) => { setTime(val); setErrors({...errors, time: null}); }}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textMuted}
                    />
                  </View>
                </View>

                {/* Servings Column */}
                <View style={[styles.rowCol, { flex: 1 }]}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Servings</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text, textAlign: 'center' }
                    ]}
                    placeholder="4"
                    value={servings}
                    onChangeText={setServings}
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                  />
                </View>

              </View>
            </View>

            {/* Card 3: Ingredients */}
            <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredients</Text>
              </View>
              
              <View style={styles.addInputRow}>
                <TextInput
                  style={[
                    styles.input, 
                    { flex: 1, backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }
                  ]}
                  placeholder="e.g. 1 kg pork belly"
                  value={newIngredient}
                  onChangeText={setNewIngredient}
                  onSubmitEditing={addIngredient}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: colors.primary }]} 
                  onPress={addIngredient}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {/* Ingredient Tag Chips */}
              {ingredients.length > 0 && (
                <View style={styles.chipsContainer}>
                  {ingredients.map((item, i) => (
                    <View key={i} style={[styles.chipPill, { backgroundColor: isDark ? '#27272A' : '#F1F5F9', borderColor: colors.borderLight }]}>
                      <Ionicons name={getIngredientIcon(item)} size={16} color={colors.primary} />
                      <Text style={[styles.chipText, { color: colors.text }]}>{item}</Text>
                      <TouchableOpacity onPress={() => removeIngredient(i)} style={styles.chipRemoveBtn}>
                        <Ionicons name="close" size={14} color={colors.textSecondary} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {errors.ingredients && <Text style={[styles.errorText, { color: colors.error }]}>{errors.ingredients}</Text>}
            </View>

            {/* Card 4: Steps */}
            <View style={[styles.cardGroup, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Steps</Text>
                
                <View style={styles.aiToggleContainer}>
                  <Text style={[styles.aiToggleText, { color: colors.textSecondary }]}>AI Step Draft</Text>
                  <Switch
                    value={aiDraftEnabled}
                    onValueChange={setAiDraftEnabled}
                    trackColor={{ false: '#767577', true: colors.primary }}
                    thumbColor={Platform.OS === 'ios' ? '#fff' : aiDraftEnabled ? colors.surface : '#f4f3f4'}
                  />
                </View>
              </View>

              {/* Step Input */}
              <View style={styles.addInputRow}>
                <TextInput
                  style={[
                    styles.input, 
                    { flex: 1, backgroundColor: colors.surface, borderColor: colors.borderLight, color: colors.text }
                  ]}
                  placeholder="e.g. Marinate pork belly for 30 min."
                  value={newStep}
                  onChangeText={setNewStep}
                  onSubmitEditing={addStep}
                  placeholderTextColor={colors.textMuted}
                />
                <TouchableOpacity 
                  style={[styles.addBtn, { backgroundColor: colors.primary }]} 
                  onPress={addStep}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </TouchableOpacity>
              </View>

              {/* Steps List with drag/reorder handles */}
              {steps.length > 0 && (
                <View style={styles.stepsListContainer}>
                  {steps.map((step, i) => (
                    <View key={i} style={[styles.stepItemCard, { backgroundColor: isDark ? '#27272A' : '#F8FAFC', borderColor: colors.borderLight }]}>
                      <Text style={[styles.stepIndexText, { color: colors.text }]}>{i + 1}.</Text>
                      <Text style={[styles.stepContentText, { color: colors.text }]}>{step}</Text>
                      
                      <View style={styles.stepRightActions}>
                        <TouchableOpacity onPress={() => removeStep(i)} style={{ padding: 4 }}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                        <Ionicons name="ellipsis-vertical" size={18} color={colors.textMuted} style={{ marginLeft: 4 }} />
                      </View>
                    </View>
                  ))}
                </View>
              )}
              {errors.steps && <Text style={[styles.errorText, { color: colors.error }]}>{errors.steps}</Text>}

              {/* Generate Description with AI Action Button */}
              <TouchableOpacity 
                style={[styles.aiGenerateBtn, { backgroundColor: colors.primary }]}
                onPress={handleGenerateAIDescription}
                activeOpacity={0.85}
                disabled={aiGenerating}
              >
                {aiGenerating ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                    <Text style={styles.aiGenerateBtnText}>Generate Description with AI</Text>
                  </>
                )}
              </TouchableOpacity>
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
              {STANDARD_CATEGORIES.map(c => (
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
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    height: 64,
  },
  headerBtn: {
    padding: 6,
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
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 10,
  },
  saveBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  formContainer: {
    flex: 1,
  },
  formContent: {
    padding: 20,
    paddingBottom: 60,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  coverContainer: {
    width: '100%',
    height: 190,
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  coverPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeCoverBtn: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  changeCoverText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardGroup: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    width: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  rowContainer: {
    gap: 12,
    width: '100%',
  },
  rowCol: {
    minWidth: 0,
  },
  dropdownToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownToggleText: {
    fontSize: 15,
    fontWeight: '600',
  },
  timeInputContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: 42,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  aiToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiToggleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    borderRadius: 14,
    gap: 6,
    justifyContent: 'center',
  },
  addBtnText: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#FFFFFF',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  chipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipRemoveBtn: {
    padding: 2,
    marginLeft: 2,
  },
  stepsListContainer: {
    gap: 8,
    marginTop: 8,
  },
  stepItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  stepIndexText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  stepContentText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  stepRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 16,
    gap: 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  aiGenerateBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownMenu: {
    width: '80%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  dropdownItemText: {
    fontSize: 15,
  },
});
