import { StyleSheet } from 'react-native';
import { borderRadius, spacing, fontSize, fontWeight, shadows } from '@/themes/tokens';

export const styles = StyleSheet.create({
  audioButton: {
    borderRadius: borderRadius.lg, // 16px via tes tokens
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  icon: {
    marginRight: spacing.sm,
  },
  text: {
    fontWeight: fontWeight.extrabold as any, // "800"
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '200%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  // On utilise tes shadows définis dans tokens.ts
  shadow: {
    ...shadows.card,
  }
});