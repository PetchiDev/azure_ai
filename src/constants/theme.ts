export const COLORS = {
  primary: "#904d00",
  primaryContainer: "#ff8c00",
  primaryFixed: "#ffdcc3",
  primaryFixedDim: "#ffb77d",
  onPrimary: "#ffffff",
  onPrimaryContainer: "#623200",
  secondary: "#515f74",
  secondaryContainer: "#d5e3fc",
  tertiary: "#00658f",
  tertiaryContainer: "#00b5fc",
  background: "#f7f9fb",
  surface: "#f7f9fb",
  onSurface: "#191c1e",
  onSurfaceVariant: "#564334",
  surfaceVariant: "#e0e3e5",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f2f4f6",
  surfaceContainer: "#eceef0",
  surfaceContainerHigh: "#e6e8ea",
  surfaceContainerHighest: "#e0e3e5",
  outline: "#897362",
  outlineVariant: "#ddc1ae",
  error: "#ba1a1a",
  kineticGradient: ['#904d00', '#ff8c00'] as [string, string],
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
