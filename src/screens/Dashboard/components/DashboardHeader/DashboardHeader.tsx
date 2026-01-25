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
        <View style={styles.textSection}>
          {/* ✅ Correction : onMain -> onPrimary */}
          <Text style={[styles.greeting, { color: identity.text.onPrimary }]}>
            {identity.header.welcomeText}
          </Text>
          {/* ✅ Correction : onMain -> onPrimary */}
          <Text style={[styles.userName, { color: identity.text.onPrimary }]}>
            {user.name}
          </Text>
        </View>
      </View>
    </ThemeContainer>
  );
};

export default DashboardHeader;