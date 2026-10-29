import { Platform } from 'react-native';

export const colors = {
  background: '#0D0D0D',
  surface: '#1C1C1C',
  primary: '#6B7A2F',
  primaryLight: '#8A9A3B',
  text: '#F5F5F0',
  star: '#F2B705',

  surfaceAlt: '#242424',
  surfaceRaised: '#2A2A2A',
  border: '#2E2E2E',
  borderStrong: '#3D3D3D',

  textMuted: '#A3A3A0',
  textFaint: '#8A8A88',

  success: '#4CAF50',
  warning: '#F2B705',
  danger: '#E5484D',

  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.65)',
} as const;

export type ColorName = keyof typeof colors;

export const paperTheme = {
  dark: true,
  roundness: 4,

  colors: {
    primary: colors.primary,
    onPrimary: colors.black,
    primaryContainer: colors.surfaceAlt,
    onPrimaryContainer: colors.primaryLight,

    secondary: colors.primaryLight,
    onSecondary: colors.black,

    background: colors.background,
    onBackground: colors.text,

    surface: colors.surface,
    onSurface: colors.text,
    surfaceVariant: colors.surfaceAlt,
    onSurfaceVariant: colors.textMuted,

    outline: colors.borderStrong,
    outlineVariant: colors.border,

    error: colors.danger,
    onError: colors.white,
    errorContainer: colors.surfaceAlt,
    onErrorContainer: colors.danger,

    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surfaceAlt,
      level4: colors.surfaceAlt,
      level5: colors.surfaceRaised,
    },
  },
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const hitSize = { minHeight: 52 } as const;

export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 26,
  xxxl: 34,
} as const;

export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' },
    android: { elevation: 4 },
    default: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' },
  }),
} as const;
