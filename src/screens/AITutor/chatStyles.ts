/**
 * Styles partagés pour les bulles de chat AI Tutor (Free + Guided)
 */

import { StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import type { Identity } from '@/themes/ThemeContext';

export const createChatStyles = (identity: Identity, isPlayful: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // --- Layout chat ---
    keyboardView: { flex: 1 },
    messagesContainer: { flex: 1 },
    messagesContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      gap: tokens.spacing.md,
    },

    // --- Bulles ---
    messageBubble: {
      flexDirection: 'row',
      gap: tokens.spacing.sm,
    },
    messageBubbleAI: { justifyContent: 'flex-start' },
    messageBubbleUser: { justifyContent: 'flex-end' },

    aiAvatarContainer: {
      width: 32,
      height: 32,
      borderRadius: tokens.borderRadius.round,
      backgroundColor: identity.palette.accent,
      alignItems: 'center',
      justifyContent: 'center',
    },
    aiAvatar: { fontSize: tokens.fontSize.lg },

    messageContent: {
      maxWidth: '75%',
      padding: tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
    },
    messageContentAI: {
      backgroundColor: identity.palette.surface,
      borderWidth: 1,
      borderColor: withOpacity(identity.palette.primary, 0.2),
    },
    messageContentUser: { backgroundColor: identity.palette.primary },
    messageContentError: {
      backgroundColor: withOpacity(identity.aiDiagnostic.error, 0.1),
      borderWidth: 1,
      borderColor: withOpacity(identity.aiDiagnostic.error, 0.3),
    },

    messageText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.fontSize.base * 1.5,
    },
    messageTextAI: { color: identity.text.primary },
    messageTextUser: { color: identity.text.onPrimary },
    messageTextError: { color: identity.aiDiagnostic.error },

    messageProvider: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.tertiary,
      marginTop: tokens.spacing.xs,
      fontStyle: 'italic',
    },

    // --- Badge RAG (source Joud Academy) ---
    ragBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: tokens.spacing.xs,
      marginBottom: tokens.spacing.xs,
      paddingHorizontal: tokens.spacing.sm,
      paddingVertical: tokens.spacing.xs,
      borderRadius: tokens.borderRadius.sm,
      backgroundColor: withOpacity(identity.palette.accent, 0.15),
    },
    ragBadgeText: {
      fontSize: tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.semibold,
      color: identity.palette.accent,
    },

    // --- Saisie ---
    inputContainer: {
      flexDirection: 'row',
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical: tokens.spacing.md,
      backgroundColor: identity.palette.surface,
      borderTopWidth: 1,
      borderTopColor: withOpacity(identity.palette.primary, 0.2),
      gap: tokens.spacing.sm,
    },
    input: {
      flex: 1,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical: tokens.spacing.sm,
      borderRadius: tokens.borderRadius.md,
      borderWidth: 1,
      borderColor: withOpacity(identity.palette.primary, 0.3),
      backgroundColor: identity.palette.background,
      fontSize: tokens.fontSize.base,
      color: identity.text.primary,
      maxHeight: 100,
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: tokens.borderRadius.round,
      backgroundColor: identity.palette.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: { opacity: 0.5 },
  });
