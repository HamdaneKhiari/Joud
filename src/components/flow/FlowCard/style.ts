/**
 * FlowCard Styles - Styles dynamiques selon l'identité
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/identities';
import { tokens } from '@/themes/tokens';

const baseColors = {
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray800: '#1F2937',
  gray900: '#111827'
};

export const createStyles = (identity: Identity) => {
  // Espacement selon l'identité
  const getCardSpacing = () => {
    switch (identity.id) {
      case 'primary':
        return tokens.spacing.xl; // Très espacé, ludique
      case 'college':
        return tokens.spacing.lg; // Équilibré
      case 'lycee':
      case 'adult':
        return tokens.spacing.md; // Compact
    }
  };

  // Taille de l'icône selon l'identité
  const getIconSize = () => {
    switch (identity.id) {
      case 'primary':
        return 68; // Plus grand pour Primary
      case 'college':
        return 64;
      case 'lycee':
      case 'adult':
        return 60; // Plus compact
    }
  };

  // Couleur de l'icône locked selon l'identité
  const getLockedIconColor = () => {
    switch (identity.id) {
      case 'lycee':
        return '#607D8B'; // Gris bleuté moyen
      case 'adult':
        return '#9CA3AF'; // Gris moyen professionnel
      case 'college':
        return '#94A3B8'; // Gris moyen
      case 'primary':
        return '#B8C1CC'; // Gris doux
    }
  };

  const cardSpacing = getCardSpacing();
  const iconSize = getIconSize();
  const lockedIconColor = getLockedIconColor();

  return StyleSheet.create({
    // =================== CARD PRINCIPALE ===================
    card: {
      backgroundColor: baseColors.white,
      borderRadius: identity.ui.cardRadius,
      padding: cardSpacing,
      marginBottom: tokens.spacing.lg,
      shadowColor: baseColors.black,
      shadowOffset: {
        width: 0,
        height: identity.id === 'primary' ? 4 :
                identity.id === 'college' ? 2 :
                identity.id === 'adult' ? 1 : 2
      },
      shadowOpacity: identity.id === 'primary' ? 0.15 :
                      identity.id === 'college' ? 0.12 :
                      identity.id === 'adult' ? 0.04 : 0.08,
      shadowRadius: identity.id === 'primary' ? 8 :
                     identity.id === 'college' ? 6 :
                     identity.id === 'adult' ? 3 : 4,
      elevation: identity.id === 'primary' ? 6 :
                  identity.id === 'college' ? 4 :
                  identity.id === 'adult' ? 1 : 2,
      position: 'relative',
      overflow: 'hidden',
      borderWidth: 0
    },

    cardLocked: {
      opacity: 0.5,
      backgroundColor: baseColors.gray100
    },

    // =================== BARRE LATÉRALE ===================
    colorBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: identity.id === 'primary' ? 10 : identity.id === 'college' ? 8 : 6,
      borderTopLeftRadius: identity.ui.cardRadius,
      borderBottomLeftRadius: identity.ui.cardRadius
    },

    content: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: tokens.spacing.sm
    },

    // =================== ICÔNE ===================
    iconContainer: {
      width: iconSize,
      height: iconSize,
      borderRadius: identity.id === 'primary' ? tokens.borderRadius.xl :
                     identity.id === 'college' ? tokens.borderRadius.lg :
                     tokens.borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: tokens.spacing.lg,
      shadowColor: baseColors.black,
      shadowOffset: {
        width: 0,
        height: identity.id === 'primary' ? 2 :
                identity.id === 'adult' ? 1 : 2
      },
      shadowOpacity: identity.id === 'primary' ? 0.15 :
                      identity.id === 'college' ? 0.12 :
                      identity.id === 'adult' ? 0.05 : 0.1,
      shadowRadius: identity.id === 'primary' ? 4 :
                     identity.id === 'adult' ? 2 : 4,
      elevation: identity.id === 'primary' ? 3 :
                  identity.id === 'adult' ? 1 : 2
    },

    iconText: {
      fontSize: identity.id === 'primary' ? 40 : 36,
      textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2
    },

    lockIconText: {
      color: lockedIconColor,
      fontSize: 32
    },

    // =================== TEXTE ===================
    textContainer: {
      flex: 1,
      justifyContent: 'center'
    },

    title: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.xl :
               identity.id === 'college' ? tokens.fontSize.lg :
               tokens.fontSize.md,
      fontWeight: identity.id === 'primary' ? tokens.fontWeight.black :
                   identity.id === 'college' ? tokens.fontWeight.black :
                   tokens.fontWeight.bold,
      color: baseColors.gray900,
      marginBottom: tokens.spacing.xs,
      letterSpacing: identity.id === 'lycee' || identity.id === 'adult' ? 0 : -0.3
    },

    subtitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: identity.id === 'primary' ? tokens.fontWeight.semibold :
                   identity.id === 'college' ? tokens.fontWeight.bold :
                   tokens.fontWeight.medium,
      color: identity.id === 'primary' ? '#FF5722' :
             identity.id === 'college' ? '#F39C12' :
             identity.id === 'lycee' ? '#00E5FF' :
             baseColors.gray600,
      letterSpacing: 0.2
    },

    // =================== INDICATEUR DE DROITE ===================
    indicator: {
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: tokens.spacing.xs
    },

    // =================== BADGE ===================
    badge: {
      paddingVertical: tokens.spacing.xs + 2,
      paddingHorizontal: tokens.spacing.md + 2,
      borderRadius: identity.id === 'primary' ? tokens.borderRadius.lg :
                     identity.id === 'college' ? tokens.borderRadius.md :
                     tokens.borderRadius.sm,
      shadowColor: baseColors.black,
      shadowOffset: {
        width: 0,
        height: identity.id === 'primary' ? 2 :
                identity.id === 'adult' ? 0 : 1
      },
      shadowOpacity: identity.id === 'primary' ? 0.2 :
                      identity.id === 'college' ? 0.15 :
                      identity.id === 'adult' ? 0.05 : 0.1,
      shadowRadius: identity.id === 'primary' ? 3 :
                     identity.id === 'adult' ? 1 : 2,
      elevation: identity.id === 'primary' ? 2 :
                  identity.id === 'adult' ? 0 : 1
    },

    badgeText: {
      color: baseColors.white,
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.extrabold,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1
    },

    // =================== PROGRESSION ===================
    progressBar: {
      width: 80,
      height: identity.id === 'primary' ? 10 : 8,
      backgroundColor: baseColors.gray200,
      borderRadius: tokens.borderRadius.sm,
      overflow: 'hidden'
    },

    progressFill: {
      height: '100%',
      borderRadius: tokens.borderRadius.sm
    },

    progressText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.black,
      color: identity.branding.accent,
      letterSpacing: -0.2
    },

    // =================== CHEVRON ===================
    chevron: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.xxxl :
               identity.id === 'college' ? tokens.fontSize.xxl + 4 :
               tokens.fontSize.xxl,
      color: identity.branding.accent,
      fontWeight: tokens.fontWeight.bold,
      opacity: identity.id === 'adult' ? 0.4 : 0.6
    }
  });
};
