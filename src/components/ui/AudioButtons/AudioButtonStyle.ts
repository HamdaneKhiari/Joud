import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, shadows } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createStyles = (identity: Identity) => StyleSheet.create({
  audioButton: {
    borderRadius: identity.ui.cardRadius, // ✅ Radius dynamique selon l'identité
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
    fontWeight: fontWeight.extrabold,
  },
  shineEffect: {
    position: 'absolute',
    top: 0,
    left: '-50%',
    width: '200%',
    height: '100%',
    // ✅ Effet subtil adapté au mode sombre/clair
    backgroundColor: identity.themeMode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
    transform: [{ skewX: '-20deg' }],
  },
  // On utilise tes shadows définis dans tokens.ts
  shadow: {
    ...shadows.card,
  }
});