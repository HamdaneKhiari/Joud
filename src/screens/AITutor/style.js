// ============================================
// FICHIER: src/screens/exercises/AITutor/style.js
// ✅ VERSION COLLEGE - Refonte complète avec Quick Actions
// ============================================

import { StyleSheet, Platform } from 'react-native';
import { spacing, fontSize, fontWeight } from '@themes/tokens';
import { baseColors, collegeColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // =================== CONTAINER ===================
  container: {
    flex: 1,
    backgroundColor: baseColors.gray50,
  },

  keyboardView: {
    flex: 1,
  },


  // =================== MESSAGES ZONE ===================
  messagesContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },

  messagesContent: {
    padding: spacing.lg,
    gap: spacing.md,
  },

  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    maxWidth: '80%',
    marginBottom: spacing.xs,
  },

  messageBubbleAI: {
    alignSelf: 'flex-start',
  },

  messageBubbleUser: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },

  // Avatar IA (emoji 🤖)
  aiAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  aiAvatar: {
    fontSize: 20,
  },

  // Contenu message
  messageContent: {
    flex: 1,
    flexShrink: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  messageContentAI: {
    backgroundColor: baseColors.white,
    borderBottomLeftRadius: 4,
  },

  messageContentUser: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },

  messageText: {
    fontSize: fontSize.base,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
    flexWrap: 'wrap',
  },

  messageTextAI: {
    color: '#2C3E50',
  },

  messageTextUser: {
    color: baseColors.white,
  },

  // =================== INPUT ZONE (FIXE EN BAS) ===================
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: spacing.lg,
    backgroundColor: baseColors.white,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingBottom: Platform.select({
      ios: spacing.lg + 10,
      android: spacing.lg,
    }),
  },

  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: '#F8F9FA',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: '#2C3E50',
  },

  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  sendButtonDisabled: {
    backgroundColor: '#BDC3C7',
    opacity: 0.4,
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default styles;
