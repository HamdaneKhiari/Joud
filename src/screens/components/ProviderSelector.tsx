import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { AISettings } from '@/hooks/useAISettings';

type Provider = AISettings['provider'];

interface ProviderSelectorProps {
  providers: Array<{ id: Provider; name: string; icon: string }>;
  selectedProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
  styles: Record<string, object>;
}

export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  providers,
  selectedProvider,
  onSelectProvider,
  styles,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Fournisseur IA</Text>
      <View style={styles.providerChips}>
        {providers.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[
              styles.providerChip,
              selectedProvider === p.id && styles.providerChipActive,
            ]}
            onPress={() => onSelectProvider(p.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.providerChipText}>{p.icon}</Text>
            <Text
              style={[
                styles.providerChipText,
                selectedProvider === p.id && styles.providerChipTextActive,
              ]}
            >
              {p.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
