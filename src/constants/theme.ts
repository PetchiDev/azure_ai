export const COLORS = {
  primary: '#0078D4',
  secondary: '#6366F1',
  tertiary: '#22C55E',
  primaryGradient: ['#0078D4', '#6366F1'],
  kineticGradient: ['#0078D4', '#6366F1'],
  background: '#0A0A0F',
  surface: '#12121A',
  card: '#1A1A2E',
  border: 'rgba(255, 255, 255, 0.08)',
  text: {
    primary: '#F0F4FF',
    secondary: '#8892A4',
  },
  status: {
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
  },
  glass: {
    bg: 'rgba(255, 255, 255, 0.05)',
    border: 'rgba(255, 255, 255, 0.1)',
  },
  // Compatibility mappings for existing code
  onSurface: '#F0F4FF',
  onSurfaceVariant: '#8892A4',
  onPrimary: '#FFFFFF',
  outlineVariant: 'rgba(255, 255, 255, 0.1)',
  primaryContainer: '#1A1A2E',
  surfaceContainerHighest: '#1A1A2E',
  surfaceContainerHigh: '#12121A',
  surfaceContainer: '#0F0F16',
  surfaceContainerLow: '#0A0A0F',
  surfaceContainerLowest: '#050508',
  error: '#EF4444',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const TYPOGRAPHY = {
  fontFamily: 'Inter-Regular',
  display: {
    fontSize: 32,
    fontFamily: 'Inter-Black',
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
  },
  body: {
    fontSize: 15,
    fontFamily: 'Inter-Regular',
  },
  caption: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  mono: {
    fontFamily: 'JetBrainsMono-Regular',
  },
  // Compatibility mappings
  h1: {
    fontSize: 32,
    fontFamily: 'Inter-Black',
  },
  h2: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
  },
  label: {

    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
} as const;

export const THEME = {
  colors: COLORS,
  spacing: SPACING,
  borderRadius: BORDER_RADIUS,
  typography: TYPOGRAPHY,
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
} as const;
