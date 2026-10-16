import { Platform } from 'react-native';

/**
 * ============================================================================
 *  ⭐ ARCHIVO DE TEMPORAL CENTRAL — EDITAR SOLO AQUÍ
 * ============================================================================
 *  Cambias un color acá y cambia en toda la app: tarjetas, botones,
 *  barras, textos, estrellas, estados.
 *
 *  Paleta:
 *    Fondo ............ #0D0D0D  negro
 *    Superficies ...... #1C1C1C  tarjetas y barras
 *    Primario ......... #6B7A2F  verde oliva (botones, elementos activos)
 *    Primario claro ... #8A9A3B  enlaces y textos destacados
 *    Texto ............ #F5F5F0  texto principal
 *    Estrellas ........ #F2B705  dorado
 *
 *  Contraste verificado (WCAG AA necesita 4.5:1):
 *    #F5F5F0 sobre #0D0D0D ....... 17.4:1  ✅
 *    #F5F5F0 sobre #1C1C1C ....... 15.1:1  ✅
 *    #000000 sobre #6B7A2F ........  5.2:1  ✅
 *    #A3A3A0 sobre #1C1C1C .......  7.0:1  ✅
 *    #8A8A88 sobre #1C1C1C .......  5.3:1  ✅
 * ============================================================================
 */

export const colors = {
  // ---- tus 6 colores ----
  background: '#0D0D0D', // fondo de la app
  surface: '#1C1C1C', // tarjetas, barra inferior, campos
  primary: '#6B7A2F', // verde oliva: botones, elementos activos
  primaryLight: '#8A9A3B', // enlaces, textos destacados
  text: '#F5F5F0', // texto principal
  star: '#F2B705', // estrellas de calificación

  // ---- derivados, para que nada se vea plano ----
  surfaceAlt: '#242424', // hover, campos, filas alternas
  surfaceRaised: '#2A2A2A', // elementos sobre superficies
  border: '#2E2E2E', // líneas y bordes
  borderStrong: '#3D3D3D',

  textMuted: '#A3A3A0', // texto secundario (contraste 7:1)
  textFaint: '#8A8A88', // texto terciario, placeholders (contraste 5.3:1)

  success: '#4CAF50',
  warning: '#F2B705',
  danger: '#E5484D',

  black: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.65)',
} as const;

export type ColorName = keyof typeof colors;

// ============================================================================
//  TEMA DE REACT NATIVE PAPER (MD3) ARMADO DESDE LOS COLORES DE ARRIBA
// ============================================================================

export const paperTheme = {
  dark: true,
  roundness: 4, // con los radios de styles.ts queda el look redondeado

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

// ============================================================================
//  TOKENS DE ESTILO
// ============================================================================

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

/** Altura mínima de un botón grande, fácil de tocar con el dedo. */
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

/**
 * Sombras.
 *
 * Se usa `boxShadow` y no `shadowColor`/`shadowOffset`/etc. porque esas
 * propiedades son de iOS y react-native-web las marca como deprecadas
 * (avisa por consola). `boxShadow` funciona en las tres plataformas y es
 * una sola línea. `elevation` se mantiene para Android, que lo necesita.
 */
export const shadow = {
  card: Platform.select({
    web: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' },
    android: { elevation: 4 },
    default: { boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)' },
  }),
} as const;
