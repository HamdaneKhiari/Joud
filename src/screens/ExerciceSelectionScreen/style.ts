/**
 * ExerciceSelectionScreen Styles - Styles dynamiques selon l'identité
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/identities';
import { tokens } from '@/themes/tokens';

const baseColors = {
  white: '#FFFFFF',
  gray600: '#4B5563',
  gray800: '#1F2937'
};

export const createStyles = (identity: Identity) => {
  // Espacement selon l'identité
  const getSpacing = () => {
    switch (identity.id) {
      case 'primary':
        return { container: tokens.spacing.xxxl, card: tokens.spacing.xl };
      case 'college':
        return { container: tokens.spacing.xl, card: tokens.spacing.lg };
      case 'lycee':
      case 'adult':
        return { container: tokens.spacing.lg, card: tokens.spacing.md };
    }
  };

  const spacing = getSpacing();

  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: identity.id === 'lycee'
        ? '#0A0A0A' // Noir profond pour Lycée
        : identity.id === 'adult'
        ? '#F9FAFB' // Gris très clair pour Adult
        : '#F3F4F6' // Gris clair par défaut
    },

    scrollView: {
      flex: 1
    },

    scrollViewContent: {
      padding: spacing.container,
      paddingBottom: tokens.spacing.xxxl
    },

    introContainer: {
      marginBottom: spacing.container
    },

    introTitle: {
      fontSize: identity.id === 'primary' ? tokens.fontSize.xxxl + 4 : tokens.fontSize.xxxl,
      fontWeight: identity.id === 'primary' || identity.id === 'college'
        ? tokens.fontWeight.black
        : tokens.fontWeight.bold,
      color: identity.id === 'lycee' ? '#00E5FF' : baseColors.gray800,
      marginBottom: tokens.spacing.xs,
      letterSpacing: identity.id === 'lycee' || identity.id === 'adult' ? 0 : -0.5
    },

    introSubtitle: {
      fontSize: tokens.fontSize.base,
      fontWeight: identity.id === 'primary' ? tokens.fontWeight.bold :
                   identity.id === 'college' ? tokens.fontWeight.extrabold :
                   tokens.fontWeight.semibold,
      color: identity.branding.accent,
      letterSpacing: 0.2
    },

    listContainer: {
      marginTop: spacing.card
    },

    flowCardWrapper: {
      marginBottom: spacing.card
    },

    loadingContainer: {
      marginTop: 100,
      alignItems: 'center'
    },

    loadingText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: baseColors.gray600,
      marginTop: tokens.spacing.md,
      letterSpacing: 0.2
    },

    encouragementContainer: {
      marginTop: spacing.container,
      padding: spacing.container,
      backgroundColor: identity.branding.main,
      borderRadius: identity.ui.cardRadius,
      borderWidth: 0,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: identity.id === 'primary' ? 6 : 4 },
      shadowOpacity: identity.id === 'primary' ? 0.2 : 0.15,
      shadowRadius: identity.id === 'primary' ? 8 : 6,
      elevation: identity.id === 'primary' ? 6 : 4,
      position: 'relative',
      overflow: 'hidden'
    },

    encouragementText: {
      fontSize: tokens.fontSize.base,
      color: identity.text.onMain,
      fontWeight: tokens.fontWeight.extrabold,
      textAlign: 'center',
      letterSpacing: 0.3,
      textShadowColor: identity.id === 'adult' ? 'transparent' : 'rgba(0, 0, 0, 0.2)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 2,
      zIndex: 2
    },

    bottomSpacer: {
      height: tokens.spacing.xxxl
    }
  });
};
