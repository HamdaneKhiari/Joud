/**
 * Styles spécifiques à AITutorFreeScreen (header, barre conversations, badge RAG)
 */

import { StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createFreeStyles = (identity: Identity, isPlayful: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },

    // --- Header ---
    header: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      backgroundColor: identity.palette.surface,
      borderBottomWidth: 2,
      borderBottomColor: identity.palette.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: { padding: tokens.spacing.sm },
    headerCenter: {
      flex: 1,
      alignItems: isPlayful ? 'center' : 'flex-start',
      marginHorizontal: tokens.spacing.md,
    },
    headerTitle: {
      fontSize: tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.primary,
    },
    headerSubtitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: tokens.spacing.xs,
    },
    iconButton: { padding: tokens.spacing.sm },

    // --- Barre des conversations ---
    convBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.sm,
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.sm,
      backgroundColor: identity.palette.background,
      borderBottomWidth: 1,
      borderBottomColor: withOpacity(identity.palette.primary, 0.1),
    },
    convChip: {
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.borderRadius.round,
      backgroundColor: identity.palette.surface,
      borderWidth: 1,
      borderColor: withOpacity(identity.palette.primary, 0.2),
    },
    convChipActive: {
      backgroundColor: identity.palette.primary,
      borderColor: identity.palette.primary,
    },
    convChipText: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.text.secondary,
    },
    convChipTextActive: { color: identity.text.onPrimary },
  });
