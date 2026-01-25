import React, { useMemo } from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getSentenceCardStyles } from './SentencesCard.styles';
import { SentenceData } from '@/hooks/exercises/useExerciseContent';

interface SentenceCardProps {
  data: SentenceData;
  isRevealed: boolean;
  userDraft: string;
  setUserDraft: (text: string) => void;
  moduleColor: string;
}

const SentenceCard: React.FC<SentenceCardProps> = ({ 
  data, 
  isRevealed, 
  userDraft, 
  setUserDraft,
  moduleColor 
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => getSentenceCardStyles(identity, moduleColor), [identity, moduleColor]);

  return (
    <View style={styles.container}>
      {/* 1. ÉNONCÉ */}
      <View style={styles.questionBox}>
        <Text style={styles.instruction}>Traduis cette phrase :</Text>
        <Text style={styles.phraseSource}>{data.phrase_fr}</Text>
      </View>

      {/* 2. ZONE DE SAISIE */}
      <TextInput
        style={[
          styles.input,
          { borderColor: isRevealed ? moduleColor : identity.text.tertiary + '33' }
        ]}
        placeholder="Tape ta traduction ici..."
        placeholderTextColor={identity.text.tertiary}
        value={userDraft}
        onChangeText={setUserDraft}
        editable={!isRevealed}
        multiline
        blurOnSubmit
      />

      {/* 3. RÉVÉLATION (Si validé) */}
      {isRevealed && (
        <View style={styles.revealContainer}>
          <View style={styles.correctionBlock}>
            <Text style={styles.labelCorrection}>PHRASE ATTENDUE :</Text>
            <Text style={styles.phraseTarget}>{data.phrase_en}</Text>
          </View>

          <View style={styles.pedagogyCard}>
            <Text style={styles.pedagogyTitle}>Concrètement</Text>
            <Text style={styles.pedagogyText}>{data.concretement}</Text>
          </View>

          <View style={styles.pedagogyCard}>
            <Text style={styles.pedagogyTitle}>La Structure (Build)</Text>
            <Text style={styles.pedagogyText}>{data.build}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

export default SentenceCard;