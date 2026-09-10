import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { FOOD_SUGGESTIONS } from '../data/foodSuggestions';

export default function SearchInputWithSuggestions({
  value,
  onChangeText,
  placeholder = "Search recipes or ingredients...",
  onSearch,
  customSuggestions = [],
  iconName = "search",
  iconColor,
  containerStyle,
  inputStyle,
  maxSuggestions = 6
}) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Pool all suggestion candidates (FOOD_SUGGESTIONS + user recipes titles/ingredients)
  const pool = useMemo(() => {
    const set = new Set();
    FOOD_SUGGESTIONS.forEach(item => set.add(item));
    customSuggestions.forEach(item => {
      if (item && typeof item === 'string') set.add(item);
    });
    return Array.from(set);
  }, [customSuggestions]);

  // Compute suggestions dynamically for every typed letter
  const suggestions = useMemo(() => {
    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return [];

    const matches = [];
    const added = new Set();

    // 1. Direct matches from pool (starts with or includes)
    for (const item of pool) {
      if (item.toLowerCase().includes(trimmed)) {
        matches.push(item);
        added.add(item.toLowerCase());
        if (matches.length >= maxSuggestions * 2) break;
      }
    }

    // Sort: items starting with typed query first
    matches.sort((a, b) => {
      const aStarts = a.toLowerCase().startsWith(trimmed);
      const bStarts = b.toLowerCase().startsWith(trimmed);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.length - b.length;
    });

    const result = matches.slice(0, maxSuggestions);

    // 2. Dynamic contextual suggestions (like Yahoo/Google search in user's image)
    const suffixes = ['recipes', 'dishes', 'carbonara recipe', 'soup', 'salad', 'sauce'];
    for (const suffix of suffixes) {
      const phrase = `${value.trim()} ${suffix}`;
      if (!added.has(phrase.toLowerCase()) && result.length < maxSuggestions) {
        result.push(phrase);
        added.add(phrase.toLowerCase());
      }
    }

    return result;
  }, [value, pool, maxSuggestions]);

  const handleSelect = (item) => {
    onChangeText(item);
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch(item);
    }
  };

  const handleClear = () => {
    onChangeText('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSearch) {
      onSearch('');
    }
  };

  const handleKeyPress = (e) => {
    if (!showDropdown || suggestions.length === 0) return;

    const nativeEvent = e.nativeEvent || {};
    const key = nativeEvent.key;

    if (key === 'ArrowDown') {
      if (e.preventDefault) e.preventDefault();
      const nextIndex = selectedIndex < suggestions.length - 1 ? selectedIndex + 1 : 0;
      setSelectedIndex(nextIndex);
      if (suggestions[nextIndex]) {
        onChangeText(suggestions[nextIndex]);
      }
    } else if (key === 'ArrowUp') {
      if (e.preventDefault) e.preventDefault();
      const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : suggestions.length - 1;
      setSelectedIndex(prevIndex);
      if (suggestions[prevIndex]) {
        onChangeText(suggestions[prevIndex]);
      }
    } else if (key === 'Enter' && selectedIndex >= 0 && suggestions[selectedIndex]) {
      if (e.preventDefault) e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    }
  };

  return (
    <View style={[styles.outerWrapper, containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.surface,
            borderColor: isFocused ? colors.primary : (colors.borderLight || colors.border || '#334155'),
            borderWidth: 1.5,
          },
        ]}
      >
        <Ionicons
          name={iconName}
          size={20}
          color={iconColor || (isFocused ? colors.primary : colors.textSecondary)}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.text, outlineStyle: 'none' }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowDropdown(text.trim().length > 0);
            setSelectedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (value.trim().length > 0) {
              setShowDropdown(true);
            }
          }}
          onBlur={() => {
            setIsFocused(false);
            // Small delay to allow pressing dropdown items
            setTimeout(() => setShowDropdown(false), 200);
          }}
          onKeyPress={handleKeyPress}
          onSubmitEditing={() => {
            if (selectedIndex >= 0 && suggestions[selectedIndex]) {
              handleSelect(suggestions[selectedIndex]);
            } else {
              setShowDropdown(false);
              if (onSearch) onSearch(value);
            }
          }}
          underlineColorAndroid="transparent"
          returnKeyType="search"
        />
        {value.length > 0 && (
          <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Instant Suggestions Dropdown (Yahoo / Google style) */}
      {showDropdown && suggestions.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          exiting={FadeOut.duration(150)}
          style={[
            styles.dropdown,
            {
              backgroundColor: isDark ? '#1E1E22' : '#FFFFFF',
              borderColor: colors.primary,
              shadowColor: '#000',
            },
          ]}
        >
          {suggestions.map((item, index) => {
            const isSelected = index === selectedIndex;
            const queryLower = value.trim().toLowerCase();
            const itemLower = item.toLowerCase();
            const matchIdx = itemLower.indexOf(queryLower);

            let prefix = '';
            let matchText = item;
            let suffix = '';

            if (matchIdx !== -1) {
              prefix = item.slice(0, matchIdx);
              matchText = item.slice(matchIdx, matchIdx + value.trim().length);
              suffix = item.slice(matchIdx + value.trim().length);
            }

            return (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={[
                  styles.suggestionRow,
                  {
                    backgroundColor: isSelected ? (colors.primary + '25') : 'transparent',
                    borderBottomColor:
                      index === suggestions.length - 1
                        ? 'transparent'
                        : colors.borderLight + '60',
                  },
                ]}
                onPress={() => handleSelect(item)}
              >
                <Ionicons
                  name="search-outline"
                  size={18}
                  color={isSelected ? colors.primary : colors.textSecondary}
                  style={styles.suggestionIcon}
                />
                <Text style={[styles.suggestionText, { color: colors.text }]} numberOfLines={1}>
                  {prefix}
                  <Text style={{ color: colors.text }}>{matchText}</Text>
                  <Text style={{ fontWeight: '700', color: colors.text }}>{suffix}</Text>
                </Text>
                
                {/* Arrow button: fills the input bar without executing search immediately */}
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onChangeText(item);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="arrow-back-outline" size={16} color={isSelected ? colors.primary : colors.textSecondary} style={{ transform: [{ rotate: '135deg' }] }} />
                </TouchableOpacity>
              </TouchableOpacity>
            );
          })}
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    zIndex: 999,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  dropdown: {
    position: 'absolute',
    top: 58,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    elevation: 10,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    zIndex: 1000,
    overflow: 'hidden',
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
  },
  arrowButton: {
    padding: 6,
    marginLeft: 8,
    borderRadius: 8,
  }
});
