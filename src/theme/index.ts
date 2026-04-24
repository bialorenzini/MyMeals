export const Colors = {
  primary: '#FF6B6B',
  primaryLight: '#FF8E8E',
  primaryDark: '#E85555',

  secondary: '#4ECDC4',
  secondaryLight: '#72DDD6',
  secondaryDark: '#38B2AB',

  accent: '#FFE66D',
  accentDark: '#F5D63D',

  background: '#F7F9FC',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F4F8',

  text: '#2D3436',
  textSecondary: '#636E72',
  textMuted: '#B2BEC3',

  border: '#DFE6E9',
  shadow: '#00000015',

  success: '#55EFC4',
  warning: '#FDCB6E',
  danger: '#FF7675',

  white: '#FFFFFF',
  black: '#000000',

  category: {
    breakfast: '#FFB347',   // laranja quente
    lunch: '#87CEEB',       // azul céu
    dinner: '#9B89C9',      // roxo suave
    snack: '#90EE90',       // verde claro
  },

  categoryGradient: {
    breakfast: ['#FFB347', '#FF8C42'] as [string, string],
    lunch:     ['#87CEEB', '#5BA3D9'] as [string, string],
    dinner:    ['#9B89C9', '#7B6BAF'] as [string, string],
    snack:     ['#90EE90', '#5DBD5D'] as [string, string],
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 20,
  xl: 28,
  full: 999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.text },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.text },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, textTransform: 'uppercase' as const, letterSpacing: 0.8 },
  caption: { fontSize: 11, fontWeight: '400' as const, color: Colors.textMuted },
};

export const Shadow = {
  sm: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
};
