import { StyleSheet } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

export const createStyles = (identity: Identity) => {
  // Espacement dynamique selon l'identité
  // Primary (enfants) : plus aéré et ludique
  // Adult : plus compact et sobre
  const getSectionSpacing = () => {
    switch (identity.id) {
      case 'primary':
        return tokens.spacing.xl; // 20px - plus aéré
      case 'college':
        return tokens.spacing.lg; // 16px - équilibré
      case 'lycee':
        return tokens.spacing.md; // 12px - plus compact
      case 'adult':
        return tokens.spacing.md; // 12px - sobre
      default:
        return tokens.spacing.lg;
    }
  };

  // Couleur de fond selon l'identité
  const getBackgroundColor = () => {
    switch (identity.id) {
      case 'primary':
        return '#FFF9E6'; // Fond légèrement jaune pour Primary
      case 'college':
        return '#F5F7FA'; // Fond gris très clair pour College
      case 'lycee':
        return '#F8F9FA'; // Fond gris ultra clair pour Lycée
      case 'adult':
        return '#FFFFFF'; // Fond blanc pur pour Adult
      default:
        return '#F5F7FA';
    }
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: getBackgroundColor(),
    },

    scrollContent: {
      paddingBottom: tokens.spacing.xxxl,
    },

    section: {
      marginTop: getSectionSpacing(),
    },

    sectionHeader: {
      marginTop: tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.xl,
    },

    levelsGrid: {
      gap: tokens.spacing.md,
    },
  });
};
