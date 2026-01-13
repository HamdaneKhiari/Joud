/**
 * ExerciceSelectionScreen Styles - Coquille layout uniquement
 * FlowCard gère ses propres styles, l'écran ne fait que le layout
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/identities';
import { tokens } from '@/themes/tokens';

const baseColors = {
  gray600: '#4B5563'
};

export const createStyles = (identity: Identity) => {
  // Espacement du container selon l'identité
  const getContainerPadding = () => {
    switch (identity.id) {
      case 'primary':
        return tokens.spacing.xl;
      case 'college':
        return tokens.spacing.lg;
      case 'lycee':
      case 'adult':
        return tokens.spacing.md;
    }
  };

  const containerPadding = getContainerPadding();

  return StyleSheet.create({
    // =================== LAYOUT ===================
    safeArea: {
      flex: 1,
      backgroundColor: identity.id === 'lycee'
        ? '#0A0A0A'
        : identity.id === 'adult'
        ? '#F9FAFB'
        : identity.id === 'college'
        ? '#F3F4F6'
        : '#FFFFFF'
    },

    scrollView: {
      flex: 1
    },

    scrollViewContent: {
      padding: containerPadding,
      paddingBottom: tokens.spacing.xxxl
    },

    // =================== LISTE (FlowCard gère son propre spacing) ===================
    listContainer: {
      // FlowCard a déjà son marginBottom intégré
    },

    // =================== LOADING ===================
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

    // =================== BOTTOM SPACER ===================
    bottomSpacer: {
      height: tokens.spacing.xxxl
    }
  });
};
