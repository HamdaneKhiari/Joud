import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/themes/ThemeContext';
import type { StyleProp, ViewStyle } from 'react-native';

interface DynamicIconProps {
  name?: string | null;
  fallback?: string;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ 
  name, 
  fallback = 'help-circle', 
  size = 24, 
  color,
  style 
}) => {
  const { identity } = useTheme();
  
  // 1. Priorité : Nom venant de la DB
  // 2. Fallback 1 : Logo de l'identité (si configuré)
  // 3. Fallback 2 : Icône par défaut ('help-circle' ou autre)
  const iconName = (name || identity.icons.logo || fallback) as React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  const iconColor = color || identity.text.onPrimary;

  return <MaterialCommunityIcons name={iconName} size={size} color={iconColor} style={style} />;
};