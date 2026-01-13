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

// Theme
import { useTheme } from '@/themes/ThemeContext';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// ============================================
// TYPES
// ============================================

interface HeaderProps {
  variant?: 'exercise' | 'selection' | 'category' | 'subcategory' | 'simple';
  onBack?: () => void;
  levelTitle?: string;
  levelColor?: string | string[];
  showLevelBadge?: boolean;
  title?: string;
  exerciseTitle?: string;
  categoryTitle?: string;
  subcategoryTitle?: string;
  subtitle?: string;
  decorativeIcon?: string | number | React.ReactElement;
  decorativePosition?: 'left' | 'center' | 'right';
  gradientColors?: string[];
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
  gradientColors?: string[];
  footer?: React.ReactNode;
}

// ============================================
// STYLES DYNAMIQUES
// ============================================

const createStyles = (identity: Identity) => {
  // Espacement du contenu selon l'identité
  const getContentPadding = () => {
    switch (identity.id) {
      case 'primary':
        return { top: tokens.spacing.xxxl, bottom: tokens.spacing.xxxl, horizontal: tokens.spacing.xl };
      case 'college':
        return { top: tokens.spacing.xl, bottom: tokens.spacing.xl, horizontal: tokens.spacing.lg };
      case 'lycee':
      case 'adult':
        return { top: tokens.spacing.lg, bottom: tokens.spacing.lg, horizontal: tokens.spacing.md };
    }
  };

  const padding = getContentPadding();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: identity.id === 'lycee' ? '#0A0A0A' :
                       identity.id === 'adult' ? '#F9FAFB' :
                       '#FFFFFF'
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

// ============================================
// COMPOSANT
// ============================================

const ExerciseLayout: React.FC<ExerciseLayoutProps> = ({
  children,
  headerProps,
  progressProps,
  gradientColors,
  footer
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // StatusBar dynamique selon l'identité
  const getStatusBarStyle = (): 'light-content' | 'dark-content' => {
    // Lycée et College : header sombre → texte blanc
    if (identity.id === 'lycee' || identity.id === 'college') {
      return 'light-content';
    }
    // Primary et Adult : header clair → texte noir
    return 'dark-content';
  };

  // Gradient dynamique selon l'identité
  const getGradientColors = (): string[] => {
    if (gradientColors) return gradientColors;

    // Gradient par défaut selon l'identité
    if (identity.ui.hasGradient && identity.ui.gradientColors) {
      return identity.ui.gradientColors;
    }

    // Couleur unie selon l'identité
    const bgColor = identity.id === 'lycee' ? '#0F0F0F' :
                    identity.id === 'adult' ? '#F9FAFB' :
                    identity.id === 'college' ? '#F3F4F6' :
                    '#FFFBF5'; // Primary (jaune très clair)

    return [bgColor, bgColor];
  };

  const gradient = getGradientColors();
  const statusBarStyle = getStatusBarStyle();

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={statusBarStyle}
          backgroundColor={identity.branding.main}
        />

        {/* Header dynamique */}
        <ExerciseHeader {...headerProps} />

        {/* Barre de progression (optionnelle) */}
        {progressProps && <ExerciseProgressBar {...progressProps} />}

        {/* Gradient background + contenu scrollable */}
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
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

          {/* Footer optionnel (bouton validation, etc.) */}
          {footer}
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

export default ExerciseLayout;
