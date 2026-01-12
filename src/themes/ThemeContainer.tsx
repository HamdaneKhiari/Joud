import React from 'react';
import { View, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Import de l'interface Identity depuis ton fichier de thèmes
import { Identity } from '@/themes/identities';

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
  if (identity.ui.hasGradient && identity.ui.gradientColors) {
    return (
      <LinearGradient
        colors={identity.ui.gradientColors}
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
    <View style={[finalStyle, { backgroundColor: identity.branding.main }]}>
      {children}
    </View>
  );
}