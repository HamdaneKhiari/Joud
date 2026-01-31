/**
 * FlowCard Styles - Machine de guerre White Label
 * Support : Mood (playful/clean), Variants (grid/horizontal)
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (
  identity: Identity,
  isPlayful: boolean,
  isHorizontal: boolean,
  cardColor: string
) => {
  // =================== CONFIGURATION SELON MOOD + VARIANT ===================
  const cardRadius = isPlayful ? 24 : (isHorizontal ? 16 : 12);
  const iconSize = isHorizontal ? 72 : (isPlayful ? 56 : 48);
  const iconRadius = isHorizontal
    ? (isPlayful ? 36 : 16)
    : (isPlayful ? iconSize / 2 : 12);

  return StyleSheet.create({
    // =================== WRAPPER ===================
    wrapper: {
      flex: isHorizontal ? undefined : 1,
      padding: isHorizontal ? 0 : tokens.spacing.xs,
    },

    // =================== CARD PRINCIPALE ===================
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: cardRadius,
      padding: isHorizontal ? tokens.spacing.lg : (isPlayful ? tokens.spacing.lg : tokens.spacing.md),
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: isHorizontal ? 4 : 2,
      },
      shadowOpacity: isHorizontal ? 0.15 : 0.1,
      shadowRadius: isHorizontal ? 12 : 8,
      elevation: isHorizontal ? 6 : 3,

      // Layout selon variant
      ...(isHorizontal
        ? {
            flexDirection: 'row',
            alignItems: 'center',
            marginHorizontal: tokens.spacing.md,
            marginBottom: tokens.spacing.lg,
            minHeight: 120,
          }
        : {
            aspectRatio: isPlayful ? 1 : undefined,
            justifyContent: isPlayful ? 'center' : 'flex-start',
          }
      ),
    },

    cardLocked: {
      opacity: 0.5,
      backgroundColor: '#F3F4F6',
    },

    // =================== BARRE LATÉRALE ===================
    colorBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: isHorizontal ? 8 : 6,
      backgroundColor: cardColor,
      borderTopLeftRadius: cardRadius,
      borderBottomLeftRadius: cardRadius,
    },

    // =================== ICÔNE ===================
    iconContainer: {
      width: iconSize,
      height: iconSize,
      borderRadius: iconRadius,
      backgroundColor: cardColor,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isHorizontal ? 0.2 : 0.15,
      shadowRadius: isHorizontal ? 6 : 4,
      elevation: isHorizontal ? 4 : 2,

      // Position selon variant et mood
      ...(isHorizontal
        ? { marginLeft: tokens.spacing.sm }
        : isPlayful
        ? {
            alignSelf: 'center',
            marginBottom: tokens.spacing.md,
          }
        : {}
      ),
    },

    iconText: {
      fontSize: isHorizontal ? 40 : (isPlayful ? 32 : 28),
      textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
    },

    // =================== TEXTE ===================
    textContainer: {
      flex: 1,
      ...(isHorizontal
        ? {
            marginLeft: tokens.spacing.lg,
            justifyContent: 'center',
          }
        : {
            marginLeft: isPlayful ? 0 : tokens.spacing.sm,
            marginTop: isPlayful ? 0 : tokens.spacing.xs,
          }
      ),
    },

    label: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color: cardColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: tokens.spacing.xs,
    },

    title: {
      fontSize: isHorizontal ? tokens.fontSize.xl : (isPlayful ? tokens.fontSize.lg : tokens.fontSize.md),
      fontWeight: tokens.fontWeight.black,
      color: '#1F2937',
      marginBottom: tokens.spacing.xs,
      ...(isPlayful && !isHorizontal ? { textAlign: 'center' } : {}),
    },

    subtitle: {
      fontSize: isHorizontal ? tokens.fontSize.sm : tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color: '#6B7280',
      lineHeight: isHorizontal ? 20 : 16,
      ...(isHorizontal ? { marginBottom: tokens.spacing.sm } : {}),
      ...(isPlayful && !isHorizontal ? { textAlign: 'center', fontSize: tokens.fontSize.sm } : {}),
    },

    // =================== BADGE ===================
    badge: {
      ...(isHorizontal
        ? {
            alignSelf: 'flex-start',
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.md,
            borderRadius: 12,
            marginTop: tokens.spacing.sm,
          }
        : {
            position: 'absolute',
            top: tokens.spacing.sm,
            right: tokens.spacing.sm,
            paddingVertical: tokens.spacing.xs,
            paddingHorizontal: tokens.spacing.sm,
            borderRadius: 12,
          }
      ),
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },

    badgeText: {
      color: '#FFFFFF',
      fontSize: tokens.fontSize.xs - 1,
      fontWeight: tokens.fontWeight.extrabold,
      letterSpacing: 0.5,
      textShadowColor: 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 1,
    },

    // Badge de progression (mode grid)
    progressBadge: {
      minWidth: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // =================== PROGRESSION ===================
    progressContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: tokens.spacing.xs,
      gap: tokens.spacing.sm,
    },

    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: '#E5E7EB',
      borderRadius: 4,
      overflow: 'hidden',
    },

    progressFill: {
      height: '100%',
      backgroundColor: cardColor,
      borderRadius: 4,
    },

    progressText: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.extrabold,
      color: cardColor,
      minWidth: 40,
    },

    // =================== CHEVRON ===================
    chevron: {
      marginLeft: tokens.spacing.sm,
      opacity: 0.6,
    },
  });
};
