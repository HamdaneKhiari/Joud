/**
 * Composant APIKeyInput - Input sécurisé pour clé API
 */

import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { withOpacity } from '@/themes/tokens';
import { InfoBox } from './InfoBox';
import { INFO_BOXES } from '../SettingsAIScreen.config';
import type { AISettings } from '@/hooks/useAISettings';
import type { Identity } from '@/themes/ThemeContext';

type Provider = AISettings['provider'];

interface APIKeyInputProps {
  provider: Provider;
  providerName: string;
  apiKey: string;
  onChangeApiKey: (key: string) => void;
  styles: Record<string, object>;
  identity: Identity;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({
  provider: _provider,
  providerName,
  apiKey,
  onChangeApiKey,
  styles,
  identity,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Clé API</Text>
      <Text style={styles.label}>Ta clé API {providerName}</Text>
      <TextInput
        style={[styles.input, styles.inputSecure]}
        placeholder="sk-..."
        placeholderTextColor={identity.text.tertiary}
        value={apiKey}
        onChangeText={onChangeApiKey}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Info Box - Sécurité */}
      <InfoBox
        icon={INFO_BOXES.security.icon}
        iconColor={INFO_BOXES.security.color}
        backgroundColor={withOpacity(INFO_BOXES.security.color, 0.1)}
        borderColor={withOpacity(INFO_BOXES.security.color, 0.3)}
        title={INFO_BOXES.security.title}
        text={INFO_BOXES.security.text}
        textColor={identity.text.secondary}
      />

      {/* Warning Box - Responsabilité */}
      <InfoBox
        icon={INFO_BOXES.responsibility.icon}
        iconColor={INFO_BOXES.responsibility.color}
        backgroundColor={withOpacity(INFO_BOXES.responsibility.color, 0.1)}
        borderColor={withOpacity(INFO_BOXES.responsibility.color, 0.3)}
        title={INFO_BOXES.responsibility.title}
        text={INFO_BOXES.responsibility.text}
        textColor={identity.text.secondary}
        containerStyle={{ marginTop: 8 }}
      />
    </View>
  );
};
