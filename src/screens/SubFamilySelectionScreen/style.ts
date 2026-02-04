/**
 * FamilySelectionScreen Styles (Version Premium): Ici subFamily style identique
 * Support Mood : Playful vs Clean
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    // =================== LAYOUT ===================
    safeArea: {
      flex: 1,
      backgroundColor: identity.palette.background || '#F9FAFB',
    },

    listContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    columnWrapper: {
      paddingHorizontal: tokens.spacing.sm,
    },

    // ✅ LAYOUT ADAPTATIF : Card unique centrée
    singleCardContainer: {
      alignItems: 'center',
      paddingHorizontal: tokens.spacing.xl,
    },

    // ✅ Wrapper pour limiter la largeur de la card unique (1 seule card totale)
    singleCardWrapper: {
      width: '100%',
      maxWidth: isPlayful ? 380 : 360,
      alignSelf: 'center',
    },

    // ✅ Wrapper pour mode grid - empêche l'étirement des cards orphelines
    gridCardWrapper: {
      flex: 1,
      maxWidth: '50%',
    },

    // =================== HEADER SECTION ===================
    headerSection: {
      marginBottom: tokens.spacing.md,
    },

    sectionTitle: {
      fontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.md,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginHorizontal: tokens.spacing.md,
      marginTop: tokens.spacing.lg,
      marginBottom: tokens.spacing.md,
      letterSpacing: isPlayful ? -0.5 : 0,
    },

    // =================== SKELETON LOADING ===================
    skeletonContainer: {
      flex: 1,
      paddingTop: tokens.spacing.lg,
    },

    gridSkeleton: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: tokens.spacing.sm,
      gap: tokens.spacing.xs,
    },

    // =================== EMPTY STATE ===================
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: 100,
    },

    emptyEmoji: {
      fontSize: 64,
      marginBottom: tokens.spacing.lg,
    },

    emptyTitle: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      textAlign: 'center',
      marginBottom: tokens.spacing.sm,
    },

    emptyText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      textAlign: 'center',
      lineHeight: 24,
      maxWidth: 320,
    },
  });
};
