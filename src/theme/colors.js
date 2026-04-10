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
    primary: '#00E58F', // Neon mint green accent for dark mode
    primaryHover: '#00C77A',
    primaryLight: '#00E58F20',
    background: '#1D1F24', // Very dark gray/charcoal
    surface: '#262931', // Slightly lighter charoal for panels
    text: '#FFFFFF', // Clean white
    textSecondary: '#A0A4B0',
    textMuted: '#686D7B',
    border: '#353945',
    borderLight: '#2C303A',
    card: '#262931',
  }
};

// Deprecated: old export for backward compatibility during refactor
export const colors = themeColors.light;
