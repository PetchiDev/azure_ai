export const THEME = {
  colors: {
    surface: "#101419",
    surfaceContainerLowest: "#0b0e14",
    surfaceContainerLow: "#181c22",
    surfaceContainer: "#1c2026",
    surfaceContainerHigh: "#272a30",
    surfaceContainerHighest: "#31353b",
    surfaceBright: "#363940",
    surfaceDim: "#101419",
    
    primary: "#a3c9ff",
    primaryContainer: "#0078d4",
    onPrimary: "#00315c",
    onPrimaryContainer: "#ffffff",
    
    secondary: "#adc8f2",
    secondaryContainer: "#2d486b",
    onSecondary: "#143153",
    onSecondaryContainer: "#9cb7df",
    
    tertiary: "#ffb689",
    tertiaryContainer: "#bc5b00",
    onTertiary: "#512300",
    onTertiaryContainer: "#ffffff",
    
    error: "#ffb4ab",
    errorContainer: "#93000a",
    onError: "#690005",
    onErrorContainer: "#ffdad6",
    
    background: "#101419",
    onBackground: "#e0e2ea",
    onSurface: "#e0e2ea",
    onSurfaceVariant: "#c0c7d4",
    
    outline: "#8a919e",
    outlineVariant: "#404752",
    
    kineticGradient: ["#001c39", "#0078d4", "#a3c9ff"],
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  typography: {
    fontFamily: "Inter",
    h1: { fontSize: 32, fontWeight: "800", letterSpacing: -0.64 },
    h2: { fontSize: 24, fontWeight: "700", letterSpacing: -0.48 },
    body: { fontSize: 16, fontWeight: "400" },
    label: { fontSize: 12, fontWeight: "600", letterSpacing: 0.6, textTransform: "uppercase" },
  }
} as const;
