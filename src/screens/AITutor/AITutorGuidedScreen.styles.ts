/**
 * Styles spécifiques à AITutorGuidedScreen (container, sélection domaine, empty state)
 */

import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createGuidedStyles = (identity: Identity) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: tokens.spacing.lg,
    },
    sectionTitle: {
      fontSize: tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      marginBottom: tokens.spacing.md,
    },

    // --- Empty state ---
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.xl,
      paddingTop: tokens.spacing.xxxl,
    },
    emptyEmoji: {
      fontSize: tokens.emojiSize.huge,
      marginBottom: tokens.spacing.lg,
    },
    emptyTitle: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
      textAlign: 'center',
      marginBottom: tokens.spacing.sm,
    },
    emptyText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      textAlign: 'center',
      lineHeight: tokens.fontSize.base * 1.6,
    },
  });
