// ============================================
// FICHIER: src/components/pedagogy/dialogues/DialogueCard/style.js
// ✅ VERSION COLLEGE - Design moderne type iMessage
// ============================================

import { StyleSheet } from 'react-native';
import {
  spacing,
  fontSize,
  fontWeight,
  borderRadius,
  borderWidth as borderWidths,
  shadows,
  opacity,
} from '@themes/tokens';
import { baseColors, semanticColors, collegeColors } from '@themes/colors';

export const styles = StyleSheet.create({
  // =================== CONTAINER DIALOGUE ===================
  dialogueContainer: {
    flex: 1,
    backgroundColor: baseColors.white,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: collegeColors.borderLight,
    overflow: 'hidden',
    shadowColor: collegeColors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },

  // =================== BARRE PERSONNAGES - COLLEGE ===================
  charactersBar: {
    backgroundColor: collegeColors.background,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    gap: spacing.xl,
    borderBottomWidth: 2,
    borderBottomColor: collegeColors.borderLight,
  },

  characterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: baseColors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: collegeColors.border,
  },

  characterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  characterName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: collegeColors.text,
  },

  // =================== MESSAGES - COLLEGE iMessage STYLE ===================
  messagesContainer: {
    flex: 1,
    backgroundColor: baseColors.gray50,
  },

  messagesContent: {
    padding: spacing.xl,
    gap: spacing.lg + 4, // Plus d'espace entre bulles
  },

  messageBubble: {
    gap: spacing.xs + 2,
    maxWidth: '75%',
  },

  messageBubbleLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  messageBubbleRight: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },

  // Nom du speaker - Plus visible
  bubbleName: {
    fontSize: fontSize.xs + 1,
    fontWeight: fontWeight.extrabold,
    paddingHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },

  bubbleNameRight: {
    textAlign: 'right',
  },

  // Conteneur texte + audio
  bubbleTextContainer: {
    position: 'relative',
  },

  // Bulle de texte - Style iMessage
  bubbleText: {
    padding: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: 18,
    shadowColor: baseColors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },

  bubbleTextLeft: {
    borderBottomLeftRadius: 4,
    backgroundColor: baseColors.white,
    borderWidth: 1,
    borderColor: collegeColors.border,
  },

  bubbleTextRight: {
    borderBottomRightRadius: 4,
    backgroundColor: baseColors.blue500,
    borderWidth: 0,
  },

  bubbleTextContent: {
    fontSize: fontSize.base,
    lineHeight: 22,
    fontWeight: fontWeight.medium,
  },

  // Bouton audio - College sobre
  bubbleAudioBtn: {
    position: 'absolute',
    top: '50%',
    right: -40,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: collegeColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: collegeColors.accent,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
    transform: [{ translateY: -18 }],
  },

  bubbleAudioBtnRight: {
    right: 'auto',
    left: -40,
  },

  bubbleAudioBtnPlaying: {
    backgroundColor: collegeColors.success,
  },

  // Traduction
  bubbleTranslation: {
    fontSize: fontSize.xs + 1,
    color: collegeColors.textSecondary,
    fontStyle: 'italic',
    paddingHorizontal: spacing.sm,
    marginTop: spacing.xs,
    fontWeight: fontWeight.medium,
  },

  bubbleTranslationRight: {
    textAlign: 'right',
  },

  // =================== NAVIGATION DIALOGUE - COLLEGE ===================
  navigationBar: {
    backgroundColor: baseColors.white,
    padding: spacing.lg + 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    borderTopWidth: 2,
    borderTopColor: collegeColors.borderLight,
  },

  navButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: baseColors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
    backgroundColor: collegeColors.accent,
  },

  navButtonNext: {
    backgroundColor: collegeColors.accent,
  },

  navButtonFinish: {
    backgroundColor: collegeColors.success,
  },

  navButtonDisabled: {
    opacity: 0.3,
    backgroundColor: baseColors.gray300,
  },

  navigationText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    color: collegeColors.text,
  },

  // =================== CONTAINER QUESTIONS ===================
  questionContainer: {
    backgroundColor: baseColors.white,
    borderRadius: borderRadius.xl,
    borderTopWidth: borderWidths.heavy,
    overflow: 'hidden',
    ...shadows.xl,
  },

  colorBar: {
    height: borderWidths.heavy,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6,
    shadowOpacity: 0.3,
  },

  // =================== HEADER QUESTIONS ===================
  questionHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderBottomWidth: borderWidths.base,
    borderBottomColor: '#E2E8F0',
  },

  questionHeaderLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // =================== CONTENU QUESTIONS ===================
  questionContent: {
    padding: spacing.xl,
  },
});

export default styles;