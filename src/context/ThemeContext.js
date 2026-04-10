import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themeColors } from '../theme/colors';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light'); // default to light

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('user_theme');
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        // Fallback to system preferred theme if no user preference is saved
        const systemTheme = Appearance.getColorScheme();
        if (systemTheme) setTheme(systemTheme);
      }
    } catch (e) {
      console.error('Failed to load theme preference', e);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('user_theme', newTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const colors = themeColors[theme];
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
