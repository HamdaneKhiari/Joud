import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight, borderRadius, borderWidth as borderWidths, shadows, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import type { Identity } from '@/themes/ThemeContext';

// baseColors utilisé uniquement pour success/error (couleurs système), le reste vient de l'identity (white label)
export const getStyles = (identity: Identity) => StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    backgroundColor: identity.palette.surface,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    borderTopWidth: borderWidths.thin,
    borderTopColor: withOpacity('#000000', 0.05),
    ...shadows.lg,
  },

  feedbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: borderWidths.thick,
    ...shadows.md,
  },

  feedbackCorrect: {
    backgroundColor: baseColors.green50,
    borderColor: baseColors.green500,
  },

  feedbackIncorrect: {
    backgroundColor: baseColors.red50,
    borderColor: baseColors.red500,
  },

  feedbackIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    backgroundColor: baseColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
    ...shadows.sm,
  },

  feedbackTextContainer: {
    flex: 1,
  },

  feedbackTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    marginBottom: spacing.xs,
    letterSpacing: 0.3,
  },

  feedbackTitleCorrect: {
    color: baseColors.green600,
  },

  feedbackTitleIncorrect: {
    color: baseColors.red500,
  },

  feedbackMessage: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    lineHeight: 21,
    letterSpacing: 0.2,
  },

  feedbackMessageCorrect: {
    color: baseColors.green600,
  },

  feedbackMessageIncorrect: {
    color: baseColors.red600,
  },

  successBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.round,
    backgroundColor: baseColors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    ...shadows.sm,
  },

  buttonWrapper: {
    marginHorizontal: spacing.md,
  },

  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 64,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    ...shadows.xl,
  },

  buttonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.lg,
    backgroundColor: withOpacity(baseColors.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },

  buttonLabel: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.extrabold,
    fontFamily: identity.fontFamily.extrabold,
    color: identity.text.onPrimary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },

  buttonArrow: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: withOpacity(baseColors.white, 0.2),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  // buttonInitial : couleur principale de l'identity (white label)
  buttonInitial: {
    backgroundColor: identity.palette.primary,
    borderWidth: borderWidths.thick,
    borderColor: withOpacity(baseColors.white, 0.3),
  },

  buttonCorrect: {
    backgroundColor: baseColors.green500,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.green600,
  },

  buttonIncorrect: {
    backgroundColor: baseColors.orange500,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.orange600,
  },

  buttonSkip: {
    backgroundColor: baseColors.gray400,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.gray500,
    ...shadows.xl,
  },

  buttonDisabled: {
    backgroundColor: baseColors.gray300,
    borderWidth: borderWidths.thick,
    borderColor: baseColors.gray400,
    opacity: 1,
    shadowOpacity: 0.1,
    elevation: 3,
  },

  attemptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  attemptDotFilled: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: baseColors.red400,
  },
  attemptDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: baseColors.gray200,
  },
  attemptText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: baseColors.orange600,
    marginLeft: spacing.xs,
  },
});
