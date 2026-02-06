/**
 * Composant FeatureItem - Item de feature avec checkmark
 */

import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeatureItemProps {
  text: string;
  containerStyle?: ViewStyle;
  checkStyle?: ViewStyle;
  textStyle?: TextStyle;
  checkColor: string;
}

export const FeatureItem: React.FC<FeatureItemProps> = ({
  text,
  containerStyle,
  checkStyle,
  textStyle,
  checkColor,
}) => {
  return (
    <View style={containerStyle}>
      <View style={checkStyle}>
        <Ionicons name="checkmark" size={14} color={checkColor} />
      </View>
      <Text style={textStyle}>{text}</Text>
    </View>
  );
};
