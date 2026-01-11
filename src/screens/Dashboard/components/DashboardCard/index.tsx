import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import ThemeContainer from '@/components/common/ThemeContainer';
import { styles } from './styles';

interface DashboardCardProps {
  title: string;
  icon: string;
  subtitle?: string;
  onPress?: () => void;
  children: React.ReactNode;
  variant: 'daily-word' | 'continue' | 'revision' | 'ai-tutor';
}

const DashboardCard: React.FC<DashboardCardProps> = ({ 
  title, icon, subtitle, onPress, children, variant 
}) => {
  const { identity } = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
      <ThemeContainer
        identity={identity}
        style={[styles.card, { borderRadius: identity.ui.cardRadius }]}
      >
        {/* Header commun */}
        <View style={styles.cardHeader}>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseIcon}>{icon}</Text>
            <View>
              <Text style={styles.exerciseTitle}>{title}</Text>
              {subtitle && (
                <Text style={{ color: identity.branding.accent }}>{subtitle}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Contenu spécifique injecté */}
        <View style={{ zIndex: 2 }}>
          {children}
        </View>
      </ThemeContainer>
    </TouchableOpacity>
  );
};

export default DashboardCard;