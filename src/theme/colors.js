const shared = {
  primary: '#2D6A4F', // deep green
  primaryHover: '#1B4332',
  primaryLight: '#D8F3DC',
  primaryActive: '#B7E4C7',
  error: '#D90429',
  errorBackground: '#FFE6E9',
  success: '#2B9348',
  accent: '#FFD700', // Gold/Star accent
};

export const themeColors = {
  light: {
    ...shared,
    background: '#F4F7F5',
    surface: '#FFFFFF',
    text: '#1A2F26',
    textSecondary: '#4A5D53',
    textMuted: '#8E9C95',
    border: '#DDE2DF',
    borderLight: '#F0F2F1',
    card: '#FFFFFF',
  },
  dark: {
    ...shared,
    background: '#0D1B15', // Dark deep green charcoal
    surface: '#15251E', // Darker surface
    text: '#F4F7F5', // Light off-white
    textSecondary: '#B0C2BB',
    textMuted: '#6D8279',
    border: '#2A3F36',
    borderLight: '#1D2E26',
    card: '#1A2F26',
  }
};

// Deprecated: old export for backward compatibility during refactor
export const colors = themeColors.light;
