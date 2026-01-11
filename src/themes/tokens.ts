/**
 * 🎯 SPACING & SIZING
 */
export const spacing = {
  xs: 4,  sm: 8,  md: 12,  lg: 16,  xl: 20,  xxl: 24,  xxxl: 32,
};

export const emojiSize = {
  sm: 20, md: 28, lg: 40, xl: 48, xxl: 60, huge: 80,
};

/**
 * 🔤 TYPOGRAPHY
 */
export const fontSize = {
  xs: 12, sm: 14, base: 16, md: 18, lg: 20, xl: 24, xxl: 28, xxxl: 36, huge: 48,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
  black: '900' as const,
};

/**
 * 🔲 BORDERS & SHADOWS (Standardisées)
 */
export const borderRadius = {
  none: 0, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, round: 999,
};

export const shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
};

/**
 * 🎨 COLORS HELPERS
 */
export const withOpacity = (hexColor: string, opacityValue: number) => {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacityValue})`;
};

// Export global pour usage facile
export const tokens = {
  spacing,
  fontSize,
  fontWeight,
  emojiSize,
  borderRadius,
  shadows,
};