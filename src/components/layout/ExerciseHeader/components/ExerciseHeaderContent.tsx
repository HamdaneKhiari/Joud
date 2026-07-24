import React, { useMemo } from 'react';
import { View, Text, StyleSheet, type TextStyle } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

interface ExerciseHeaderContentProps {
  title?: string;
  subtitle?: string;
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory';
}

type IdentityId = Identity['id'];

interface TypographyConfig {
  titleSize: number;
  titleWeight: TextStyle['fontWeight'];
  titleLetterSpacing: number;
  titleLineHeight: number;
  subtitleWeight: TextStyle['fontWeight'];
}

const TYPOGRAPHY_CONFIG: Record<IdentityId, TypographyConfig> = {
  primary: {
    titleSize: tokens.fontSize.xxxl,
    titleWeight: tokens.fontWeight.black,
    titleLetterSpacing: -0.5,
    titleLineHeight: 40,
    subtitleWeight: tokens.fontWeight.bold,
  },
  college: {
    titleSize: tokens.fontSize.xxl + 4,
    titleWeight: tokens.fontWeight.black,
    titleLetterSpacing: -0.5,
    titleLineHeight: 38,
    subtitleWeight: tokens.fontWeight.extrabold,
  },
  lycee: {
    titleSize: tokens.fontSize.xxl,
    titleWeight: tokens.fontWeight.bold,
    titleLetterSpacing: 0,
    titleLineHeight: 34,
    subtitleWeight: tokens.fontWeight.semibold,
  },
  adult: {
    titleSize: tokens.fontSize.xxl,
    titleWeight: tokens.fontWeight.bold,
    titleLetterSpacing: 0,
    titleLineHeight: 34,
    subtitleWeight: tokens.fontWeight.semibold,
  },
} as const;

const createStyles = (identity: Identity) => {
  const config = TYPOGRAPHY_CONFIG[identity.id] || TYPOGRAPHY_CONFIG.adult;

  // Header est toujours sur fond primary (foncé) → texte onPrimary
  const textColor = identity.text.onPrimary;

  const isClean = identity.ui.mood === 'clean';
  const textShadow = isClean
    ? { shadowColor: 'transparent', shadowOpacity: 0 }
    : {
        shadowColor: '#000000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
      };

  return StyleSheet.create({
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: tokens.spacing.md,
    },
    exerciseTitle: {
      fontSize: config.titleSize,
      fontWeight: config.titleWeight,
      fontFamily: identity.fontFamily.bold,
      color: textColor,
      textAlign: 'center',
      marginBottom: tokens.spacing.xs,
      letterSpacing: config.titleLetterSpacing,
      lineHeight: config.titleLineHeight,
      ...textShadow,
    },
    selectionTitle: {
      fontSize: config.titleSize + 2,
    },
    exerciseSubtitle: {
      fontSize: tokens.fontSize.sm,
      fontWeight: config.subtitleWeight,
      fontFamily: identity.fontFamily.semibold,
      color: textColor,
      textAlign: 'center',
      letterSpacing: 0.3,
      lineHeight: 20,
      ...(!isClean && {
        shadowColor: '#000000',
        shadowOpacity: 0.2,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
      }),
    },
  });
};

const ExerciseHeaderContent: React.FC<ExerciseHeaderContentProps> = ({
  title,
  subtitle,
  variant = 'exercise'
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const titleStyle = variant === 'selection'
    ? [styles.exerciseTitle, styles.selectionTitle]
    : styles.exerciseTitle;

  return (
    <View style={styles.contentContainer}>
      {title && (
        <Text style={titleStyle} numberOfLines={2}>
          {title}
        </Text>
      )}

      {subtitle && subtitle.length > 0 && (
        <Text style={styles.exerciseSubtitle} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

export default ExerciseHeaderContent;