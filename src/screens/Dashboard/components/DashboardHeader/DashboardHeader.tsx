/**
 * ============================================
 * DashboardHeader - Version Minimaliste
 * Gauche: Bonjour [Nom]
 * Droite: Nom de l'organisation (White Label)
 * 100% piloté par Identity
 * ============================================
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ThemeContainer from '@/themes/ThemeContainer';
import { createStyles } from './headerStyles';

interface DashboardHeaderProps {
  user: {
    name: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { identity } = useTheme();
  const styles = createStyles(identity);

  if (!identity) return null;

  return (
    <ThemeContainer identity={identity} style={styles.header} rounded>
      <View style={styles.headerContent}>
        {/* Gauche: Bonjour [Nom] */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            {identity.header.welcomeText}
          </Text>
          <Text style={styles.userName}>
            {user.name}
          </Text>
        </View>

        {/* Droite: Nom de l'organisation */}
        <View style={styles.organizationSection}>
          <Text style={styles.organizationName}>
            {identity.organizationName}
          </Text>
        </View>
      </View>
    </ThemeContainer>
  );
};

export default DashboardHeader;
