import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Import de l'interface Identity depuis ton fichier de thèmes
import type { Identity } from '@/themes/ThemeContext';

interface ThemeContainerProps {
  identity: Identity;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  rounded?: boolean;
}

export default function ThemeContainer({ 
  identity, 
  children, 
  style,
  rounded = false 
}: ThemeContainerProps) {
  
  const borderRadius = rounded ? identity.ui.cardRadius : 0;
  
  const finalStyle: StyleProp<ViewStyle> = [
    style,
    {
      borderBottomLeftRadius: borderRadius,
      borderBottomRightRadius: borderRadius,
      overflow: 'hidden',
    }
  ];

  // Cas avec Gradient
  if (Array.isArray(identity.header.background)) {
    return (
      <LinearGradient
        colors={identity.header.background}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={finalStyle}
      >
        {children}
      </LinearGradient>
    );
  }

  // Cas sans Gradient (Couleur unie)
  return (
    <View style={[finalStyle, { backgroundColor: identity.palette.primary }]}>
      {children}
    </View>
  );
}