/**
 * Composant UsageLimits - Configuration des limites d'usage
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { withOpacity, tokens } from '@/themes/tokens';

interface UsageLimitsProps {
  maxMessages: string;
  onChangeMaxMessages: (value: string) => void;
  currentUsage: number;
  maxDaily: number;
  styles: any;
  identity: any;
}

export const UsageLimits: React.FC<UsageLimitsProps> = ({
  maxMessages,
  onChangeMaxMessages,
  currentUsage,
  maxDaily,
  styles,
  identity,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Limites d'usage</Text>
      <Text style={styles.label}>Messages maximum par jour</Text>
      <TextInput
        style={styles.input}
        placeholder="50"
        placeholderTextColor={identity.text.tertiary}
        value={maxMessages}
        onChangeText={onChangeMaxMessages}
        keyboardType="number-pad"
      />
      <View
        style={[
          styles.infoBox,
          {
            backgroundColor: withOpacity(identity.palette.accent, 0.1),
            borderColor: withOpacity(identity.palette.accent, 0.3),
          },
        ]}
      >
        <Ionicons name="information-circle" size={16} color={identity.palette.accent} />
        <Text style={[styles.infoText, { color: identity.text.secondary }]}>
          Limite quotidienne pour éviter les coûts excessifs. Actuellement : {currentUsage} / {maxDaily} aujourd'hui.
        </Text>
      </View>
    </View>
  );
};
