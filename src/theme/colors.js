const shared = {
  primary: '#059669', // Deep Muted Emerald Green (easy on eyes)
  primaryHover: '#047857',
  primaryLight: 'rgba(5, 150, 105, 0.15)',
  primaryActive: '#065F46',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  success: '#059669',
  accent: '#F59E0B', // Warm Amber
};

export const themeColors = {
  light: {
    ...shared,
    background: '#F8FAFC', // Slate-50 background
    surface: '#FFFFFF',
    text: '#0F172A', // Slate-900 heading
    textSecondary: '#475569', // Slate-600
    textMuted: '#94A3B8', // Slate-400
    border: '#E2E8F0', // Slate-200
    borderLight: '#F1F5F9', // Slate-100
    card: '#FFFFFF',
  },
  dark: {
    ...shared,
    primary: '#059669', // Deep Muted Emerald
    primaryHover: '#047857',
    primaryLight: 'rgba(5, 150, 105, 0.18)',
    background: '#121214', // Deep obsidian charcoal black
    surface: '#1C1C1E', // Sleek dark zinc surface panels
    text: '#F4F4F5', // Crisp bright text
    textSecondary: '#A1A1AA', // Zinc secondary text
    textMuted: '#71717A', // Zinc muted text
    border: '#27272A', // Dark zinc border
    borderLight: '#202023',
    card: '#1C1C1E',
  }
};

// Deprecated: old export for backward compatibility during refactor
export const colors = themeColors.light;
