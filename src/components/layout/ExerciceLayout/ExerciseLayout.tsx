/**
 * ExerciseLayout - Layout universel pour tous les écrans d'exercices
 * Adapté aux 4 identités : PRIMARY | COLLEGE | LYCÉE | ADULT
 * White Label : 100% dynamique, aucune valeur hardcodée
 */

import React, { useMemo } from 'react';
import { View, StatusBar, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Composants
import ExerciseHeader from '@/components/layout/ExerciseHeader';
import ExerciseProgressBar from '@/components/common/ExerciseProgressBar';

import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

interface HeaderProps {
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory' | 'simple';
  onBack?: () => void;
  levelTitle?: string;
  showLevelBadge?: boolean;
  title?: string;
  exerciseTitle?: string;
  categoryTitle?: string;
  subcategoryTitle?: string;
  subtitle?: string;
  decorativeIcon?: string | number | React.ReactElement;
  decorativePosition?: 'left' | 'center' | 'right';
  showDecorative?: boolean;
  rightIcon?: string | React.ReactElement;
  onRightIconPress?: () => void;
}

interface ProgressProps {
  progressPercent: number;
  progressText: string;
}

interface ExerciseLayoutProps {
  children: React.ReactNode;
  headerProps: HeaderProps;
  progressProps?: ProgressProps;
  footer?: React.ReactNode;
}

const createStyles = (identity: Identity) => {
  const getContentPadding = () => {
    const isPlayful = identity.ui.mood === 'playful';
    const isBubbly = identity.ui.cardStyle === 'bubbly';
    if (isBubbly) {
      return { top: tokens.spacing.xxxl, bottom: tokens.spacing.xxxl, horizontal: tokens.spacing.xl };
    }
    if (isPlayful) {
      return { top: tokens.spacing.xl, bottom: tokens.spacing.xl, horizontal: tokens.spacing.lg };
    }
    return { top: tokens.spacing.lg, bottom: tokens.spacing.lg, horizontal: tokens.spacing.md };
  };

  const padding = getContentPadding();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: identity.palette.background
    },

    gradientContainer: {
      flex: 1
    },

    scrollView: {
      flex: 1
    },

    scrollViewContent: {
      paddingTop: padding.top,
      paddingBottom: padding.bottom
    },

    contentContainer: {
      paddingHorizontal: padding.horizontal
    }
  });
};

const ExerciseLayout: React.FC<ExerciseLayoutProps> = ({
  children,
  headerProps,
  progressProps,
  footer
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Header fond = primary (toujours foncé/saturé) → statusBar toujours light
  const statusBarStyle: 'light-content' | 'dark-content' = 'light-content';

  const gradientColors: [string, string] = [
    identity.palette.background,
    identity.palette.surface
  ];

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={identity.palette.primary}
        />

        <ExerciseHeader {...headerProps} />

        {progressProps && <ExerciseProgressBar {...progressProps} />}

        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientContainer}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.contentContainer}>
              {children}
            </View>
          </ScrollView>

          {footer}
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseLayout;
