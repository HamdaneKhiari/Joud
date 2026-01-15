import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import ThemeContainer from '@/themes/ThemeContainer';
import { styles } from './headerStyles';

interface DashboardHeaderProps {
  user: {
    name: string;
  };
}

/**
 * DashboardHeader - Premium No-Media Edition
 * Design sobre et typographique inspiré Apple
 */
const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user }) => {
  const { identity } = useTheme();

  // Sécurité si l'identité n'est pas encore chargée
  if (!identity) return null;

  return (
    <ThemeContainer identity={identity} style={styles.header} rounded>
      <View style={styles.headerContent}>
        {/* ✅ No-Media: Pas d'emoji, focus sur la typographie */}
        <View style={styles.textSection}>
          <Text style={[styles.greeting, { color: identity.text.onMain }]}>
            {identity.header.welcomeText}
          </Text>
          <Text style={[styles.userName, { color: identity.text.onMain }]}>
            {user.name}
          </Text>
        </View>
      </View>
    </ThemeContainer>
  );
};

export default DashboardHeader;