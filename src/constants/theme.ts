export const COLORS = {
  // Primary brand colors
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryLight: '#818cf8',
  
  // Secondary colors
  secondary: '#06b6d4',
  secondaryDark: '#0891b2',
  secondaryLight: '#22d3ee',
  
  // Background colors
  background: '#0f0f23',
  surface: '#1a1a2e',
  surfaceLight: '#2d2d44',
  surfaceDark: '#0a0a1a',
  
  // Text colors
  text: '#ffffff',
  textSecondary: '#a1a1aa',
  textMuted: '#71717a',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Gradient colors
  gradientStart: '#6366f1',
  gradientEnd: '#06b6d4',
  gradientSecondary: '#8b5cf6',
  
  // Border colors
  border: '#374151',
  borderLight: '#4b5563',
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
};

export const GRADIENTS = {
  primary: [COLORS.gradientStart, COLORS.gradientEnd],
  secondary: [COLORS.gradientSecondary, COLORS.primary],
  background: [COLORS.background, COLORS.surface],
  surface: [COLORS.surface, COLORS.surfaceLight],
};

export const SIZES = {
  // Font sizes
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  // Border radius
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },
  
  // Shadows
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
};

export const ANIMATIONS = {
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
}; 