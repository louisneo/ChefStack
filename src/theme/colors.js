const shared = {
  primary: '#10B981', // Clean Emerald Green (Tarsi style)
  primaryHover: '#059669',
  primaryLight: 'rgba(16, 185, 129, 0.12)',
  primaryActive: '#047857',
  error: '#EF4444',
  errorBackground: '#FEE2E2',
  success: '#10B981',
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
    primary: '#10B981', // Vibrant Emerald
    primaryHover: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',
    background: '#0F172A', // Tarsi Slate 900 dark background
    surface: '#1E293B', // Tarsi Slate 800 surface panels
    text: '#F8FAFC', // Crisp white text
    textSecondary: '#94A3B8', // Slate-400
    textMuted: '#64748B', // Slate-500
    border: '#334155', // Slate-700
    borderLight: '#1E293B',
    card: '#1E293B',
  }
};

// Deprecated: old export for backward compatibility during refactor
export const colors = themeColors.light;
