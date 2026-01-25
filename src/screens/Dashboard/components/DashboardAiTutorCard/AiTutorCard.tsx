import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './AiTutorCardStyles';

const AITutorCard: React.FC = () => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons 
            name="robot" 
            size={24} 
            color={identity.palette.primary} 
          />
        </View>

        <View style={styles.textBody}>
          <Text style={styles.title}>
            {identity.aiTutor.title}
          </Text>
          <Text style={styles.subtitle}>
            {identity.aiTutor.subtitle}
          </Text>
        </View>

        <MaterialCommunityIcons 
          name="chevron-right" 
          size={22} 
          color={identity.text.tertiary} 
        />
      </View>
    </TouchableOpacity>
  );
};

export default AITutorCard;