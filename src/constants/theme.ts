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

// Brand asset paths (relative to public or src)
export const BRAND_ASSETS = {
  logo: '/logo.svg',
  logoLarge: '/logo-large.svg',
  logoPng: '/saletoru-logo.png',
  favicon: '/favicon.png',
  splash: '/assets/splash.png',
  adaptiveIcon: '/assets/adaptive-icon.png',
  icon: '/assets/icon.png',
  appleLogo: '/brand-assets/apple-logo.png',
  googleLogo: '/brand-assets/google-logo.png',
};

// Dashboard-specific layout tokens
export const DASHBOARD_LAYOUT = {
  containerPadding: 'px-4 sm:px-6 lg:px-8',
  sectionSpacing: 'space-y-6',
  cardPadding: 'p-4 lg:p-6',
  cardRadius: 'rounded-xl',
  cardBorder: 'border border-[#23233a]/50',
  cardBg: 'bg-[#23233a]/40 backdrop-blur-sm',
  cardShadow: 'shadow-lg',
  headerFont: 'text-2xl lg:text-3xl font-bold',
  subheaderFont: 'text-[#b0b0d0] mt-1',
  buttonHeight: 'h-12',
  buttonMinWidth: 'min-w-[140px]',
  badgeFont: 'text-xs font-semibold',
};

// Add new animation tokens directly to ANIMATIONS
const ANIMATIONS_EXTENDED = {
  ...ANIMATIONS,
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  slideUp: 'animate-slide-up',
  slideDown: 'animate-slide-down',
  glassBlur: 'backdrop-blur-md',
};

// Add new font tokens directly to FONTS
const FONTS_EXTENDED = {
  ...FONTS,
  heading: 'Inter, ui-sans-serif, system-ui, sans-serif',
  body: 'Inter, ui-sans-serif, system-ui, sans-serif',
  mono: 'Menlo, Monaco, Consolas, monospace',
};

// Extend ANIMATIONS type
type AnimationTokens = typeof ANIMATIONS & {
  fadeIn: string;
  fadeOut: string;
  slideUp: string;
  slideDown: string;
  glassBlur: string;
};
const ANIMATIONS_TYPED: AnimationTokens = ANIMATIONS_EXTENDED;

// Extend FONTS type
type FontTokens = typeof FONTS & {
  heading: string;
  body: string;
  mono: string;
};
const FONTS_TYPED: FontTokens = FONTS_EXTENDED;

// 3D Spline Brand Design
/**
 * Usage: import { BRAND } from 'src/constants/theme';
 * <Spline scene={BRAND.SPLINE_SCENE_URL} />
 */
export const SPLINE_SCENE_URL = 'https://prod.spline.design/n0GFhlzrcT-MOycs/scene.splinecode';

// Modal Layout Tokens
/**
 * Usage: <Modal className={BRAND.MODAL_LAYOUT.container} ... />
 */
export const MODAL_LAYOUT = {
  container: 'bg-[#23233a]/90 backdrop-blur-md border border-[#23233a]/50 rounded-xl shadow-xl max-w-lg w-full mx-4 animate-fade-in',
  header: 'text-2xl font-bold text-white mb-4',
  body: 'p-6',
  closeButton: 'absolute top-3 right-3 text-[#b0b0d0] hover:text-white text-xl font-bold focus:outline-none',
  overlay: 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm',
  animation: 'animate-fade-in',
};

// Add new brand gradients and color palette for analytics charts based on the button colors in the screenshot: purple, green, blue, orange, plus gradient red and yellow. Export as BRAND.CHART_COLORS and BRAND.CHART_GRADIENTS. Prepare for use in AnalyticsChart and DashboardAnalytics.
export const CHART_COLORS = [
  '#a259ff', // Brand purple
  '#43e7ad', // Brand green
  '#377dff', // Brand blue
  '#ff9900', // Brand orange
  '#ef4444', // Brand red
  '#f59e0b', // Brand yellow
];

export const CHART_GRADIENTS = [
  ['#a259ff', '#7c3aed'], // Purple gradient
  ['#43e7ad', '#06b6d4'], // Green gradient
  ['#377dff', '#2563eb'], // Blue gradient
  ['#ff9900', '#f59e0b'], // Orange-yellow gradient
  ['#ef4444', '#f87171'], // Red gradient
  ['#f59e0b', '#fde68a'], // Yellow gradient
];

// Export everything as a single object for easy import
export const BRAND = {
  COLORS,
  GRADIENTS,
  SIZES,
  FONTS: FONTS_TYPED,
  ANIMATIONS: ANIMATIONS_TYPED,
  BRAND_ASSETS,
  DASHBOARD_LAYOUT,
  SPLINE_SCENE_URL,
  MODAL_LAYOUT,
  CHART_COLORS,
  CHART_GRADIENTS,
}; 