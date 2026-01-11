import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ThemeContainer from '@/components/common/ThemeContainer';
import { styles } from './headerStyles';

interface DashboardHeaderProps {
  user: {
    name: string;
  };
}

/**
 * DashboardHeader - Version TypeScript Core
 * Utilise ThemeContainer pour gérer l'identité visuelle (Gradient/Couleur/Radius)
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { identity } = useTheme();

  // Sécurité si l'identité n'est pas encore chargée
  if (!identity) return null;

  return (
    <ThemeContainer identity={identity} style={styles.header} rounded>
      <View style={styles.headerContent}>

        {/* Affichage de l'icône si définie dans l'identité (ex: 🚀) */}
        {Boolean(identity.header.emoji) && (
          <Text style={styles.emoji}>{identity.header.emoji}</Text>
        )}

        <View style={styles.textSection}>
          <Text
            style={[styles.welcomeText, { color: identity.text.onMain }]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {identity.header.welcomeText}{' '}
            <Text style={[styles.userName, { color: identity.text.onMain }]}>
              {user.name}!
            </Text>
          </Text>
        </View>

      </View>
    </ThemeContainer>
  );
};

export default DashboardHeader;