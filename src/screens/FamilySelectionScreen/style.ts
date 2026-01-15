/**
 * FamilySelectionScreen Styles - Coquille layout uniquement
 * FlowCard gère ses propres styles, l'écran ne fait que le layout
 */

import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

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
      backgroundColor: identity.branding.surface || '#FFFFFF', // ✅ White Label
    },

    scrollView: {
      flex: 1
    },

    scrollViewContent: {
      padding: containerPadding,
      paddingBottom: tokens.spacing.xxxl
    },

    // =================== LOADING ===================
    loadingContainer: {
      marginTop: 100,
      alignItems: 'center'
    },

    loadingText: {
      fontSize: tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color: identity.text.secondary, // ✅ White Label
      marginTop: tokens.spacing.md,
      letterSpacing: 0.2
    },

    // =================== ERROR MESSAGE (NO FAMILIES) ===================
    errorContainer: {
      padding: containerPadding,
      backgroundColor: identity.themeMode === 'dark' ? '#1A1A1A' : '#FEE2E2', // ✅ Utilise themeMode
      borderRadius: identity.ui.cardRadius,
      borderLeftColor: '#EF4444' // TODO: Ajouter identity.branding.error
    },

    errorText: {
      fontSize: tokens.fontSize.base,
      color: identity.themeMode === 'dark' ? '#FF5252' : '#DC2626', // ✅ Utilise themeMode
      fontWeight: tokens.fontWeight.bold,
      textAlign: 'center',
      letterSpacing: 0.2
    },

    // =================== BOTTOM SPACER ===================
    bottomSpacer: {
      height: tokens.spacing.xxxl
    }
  });
};
