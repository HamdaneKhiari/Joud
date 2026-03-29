/**
 * Composant InfoBox - Boîte d'information réutilisable
 */

import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/themes/tokens';

interface InfoBoxProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  backgroundColor: string;
  borderColor: string;
  title?: string;
  text: string;
  containerStyle?: ViewStyle;
  textColor?: string;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
  icon,
  iconColor,
  backgroundColor,
  borderColor,
  title,
  text,
  containerStyle,
  textColor = '#666',
}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          gap: tokens.spacing.sm,
          padding: tokens.spacing.md,
          borderRadius: tokens.borderRadius.md,
          backgroundColor,
          borderWidth: 1,
          borderColor,
        },
        containerStyle,
      ]}
    >
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text
        style={{
          flex: 1,
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.medium,
          color: textColor,
          lineHeight: tokens.fontSize.xs * 1.6,
        }}
      >
        {title && (
          <>
            <Text style={{ fontWeight: tokens.fontWeight.bold }}>{title}</Text>
            {'\n'}
          </>
        )}
        {text}
      </Text>
    </View>
  );
};
