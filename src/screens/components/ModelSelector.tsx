/**
 * Composant ModelSelector - Sélecteur de modèle IA
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface ModelSelectorProps {
  models: string[];
  selectedModel: string;
  onSelectModel: (model: string) => void;
  styles: any;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedModel,
  onSelectModel,
  styles,
}) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Modèle IA</Text>
      <View style={styles.modelPicker}>
        {models.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.modelChip, selectedModel === m && styles.modelChipActive]}
            onPress={() => onSelectModel(m)}
            activeOpacity={0.7}
          >
            <Text style={[styles.modelChipText, selectedModel === m && styles.modelChipTextActive]}>
              {m}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
