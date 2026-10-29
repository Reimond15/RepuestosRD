import { MD3DarkTheme, configureFonts, type MD3Theme } from 'react-native-paper';

import { colors, fontSize, radius, shadow, spacing } from './colors';

export const theme: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
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

    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surfaceAlt,
      level4: colors.surfaceAlt,
      level5: colors.surfaceRaised,
    },
  },
  fonts: configureFonts({
    config: {
      displayLarge: { fontSize: fontSize.xxxl, lineHeight: 40, fontWeight: '700' },
      displayMedium: { fontSize: fontSize.xxl, lineHeight: 32, fontWeight: '700' },
      displaySmall: { fontSize: fontSize.xl, lineHeight: 28, fontWeight: '700' },
      headlineLarge: { fontSize: fontSize.xl, lineHeight: 26, fontWeight: '700' },
      headlineMedium: { fontSize: fontSize.lg, lineHeight: 24, fontWeight: '700' },
      headlineSmall: { fontSize: fontSize.md, lineHeight: 20, fontWeight: '700' },
      titleLarge: { fontSize: fontSize.lg, lineHeight: 24, fontWeight: '600' },
      titleMedium: { fontSize: fontSize.md, lineHeight: 20, fontWeight: '600' },
      titleSmall: { fontSize: fontSize.sm, lineHeight: 18, fontWeight: '600' },
      bodyLarge: { fontSize: fontSize.md, lineHeight: 22 },
      bodyMedium: { fontSize: fontSize.sm, lineHeight: 18 },
      bodySmall: { fontSize: fontSize.xs, lineHeight: 15 },
      labelLarge: { fontSize: fontSize.md, lineHeight: 20, fontWeight: '700' },
      labelMedium: { fontSize: fontSize.sm, lineHeight: 16, fontWeight: '600' },
      labelSmall: { fontSize: fontSize.xs, lineHeight: 14, fontWeight: '600' },
    },
  }),
};

export { colors, radius, spacing, fontSize, shadow };
export type { MD3Theme };
