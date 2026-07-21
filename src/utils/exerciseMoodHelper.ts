import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export type ExerciseMood = 'very-playful' | 'moderate' | 'clean';

export interface ExerciseMoodConfig {
  borderRadius: {
    card: number;
    input: number;
    button: number;
  };
  padding: {
    container: number;
    card: number;
  };
  fontSize: {
    title: number;
    subtitle: number;
    body: number;
  };
  alignment: 'center' | 'flex-start';
  spacing: number;
}

export const getExerciseMood = (identity: Identity): ExerciseMood => {
  switch (identity.id) {
    case 'primary':
      return 'very-playful';
    case 'college':
      return 'moderate';
    case 'lycee':
    case 'adult':
      return 'clean';
    default:
      return 'moderate';
  }
};

export const getExerciseMoodConfig = (mood: ExerciseMood): ExerciseMoodConfig => {
  switch (mood) {
    case 'very-playful':
      return {
        borderRadius: {
          card: 24,
          input: 16,
          button: 16,
        },
        padding: {
          container: tokens.spacing.xxl,
          card: tokens.spacing.xl,
        },
        fontSize: {
          title: tokens.fontSize.huge - 6, // 42px
          subtitle: tokens.fontSize.xl,
          body: tokens.fontSize.lg,
        },
        alignment: 'center',
        spacing: tokens.spacing.xl,
      };

    case 'moderate':
      return {
        borderRadius: {
          card: 18,
          input: 14,
          button: 14,
        },
        padding: {
          container: tokens.spacing.xl,
          card: tokens.spacing.lg,
        },
        fontSize: {
          title: tokens.fontSize.xxl, // 30px
          subtitle: tokens.fontSize.lg,
          body: tokens.fontSize.md,
        },
        alignment: 'center',
        spacing: tokens.spacing.lg,
      };

    case 'clean':
      return {
        borderRadius: {
          card: 12,
          input: 12,
          button: 12,
        },
        padding: {
          container: tokens.spacing.lg,
          card: tokens.spacing.md,
        },
        fontSize: {
          title: tokens.fontSize.xxl, // 30px
          subtitle: tokens.fontSize.lg,
          body: tokens.fontSize.md,
        },
        alignment: 'flex-start',
        spacing: tokens.spacing.md,
      };
  }
};

export const getExerciseConfig = (identity: Identity): ExerciseMoodConfig => {
  const mood = getExerciseMood(identity);
  return getExerciseMoodConfig(mood);
};
