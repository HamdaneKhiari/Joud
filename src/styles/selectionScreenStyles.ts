/**
 * Styles partagés pour les écrans de sélection en grille
 * (ExerciceSelection, FamilySelection, SubFamilySelection)
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  const isPlayful = identity.ui.mood === 'playful';

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },

    listContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    columnWrapper: {
      paddingHorizontal: tokens.spacing.sm,
    },

    singleCardContainer: {
      alignItems: 'center',
      paddingHorizontal: tokens.spacing.xl,
    },

    singleCardWrapper: {
      width: '100%',
      maxWidth: isPlayful ? 380 : 360,
      alignSelf: 'center',
    },

    gridCardWrapper: {
      flex: 1,
      maxWidth: '50%',
    },

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

    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: tokens.spacing.xxxl * 3,
    },

    emptyEmoji: {
      fontSize: tokens.emojiSize.huge,
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
      lineHeight: tokens.fontSize.base * 1.5,
      maxWidth: 320,
    },
  });
};
