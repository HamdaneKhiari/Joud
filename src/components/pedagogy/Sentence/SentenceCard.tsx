import React, { useMemo } from 'react';
import { View, Text, TextInput} from 'react-native';
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

  // Mémorisation des styles avec passage de l'identité sémantique
  const styles = useMemo(() =>
    getSentenceCardStyles(identity, moduleColor),
    [identity, moduleColor]
  );

  // Phrase anglaise attendue : phrase_en direct, ou reconstituée depuis sentence + correct_answer
  const expectedEnglish = useMemo(() => {
    if (data.phrase_en) return data.phrase_en;
    if (data.sentence && (data.correct_answer || data.correctAnswer)) {
      return data.sentence.replace('___', data.correct_answer || data.correctAnswer || '');
    }
    return '';
  }, [data]);

  return (
    <View style={styles.container}>
      {/* 1. ÉNONCÉ */}
      <View style={styles.questionBox}>
        <Text style={[styles.instruction, { color: identity.text.secondary }]}>
          Traduis cette phrase :
        </Text>
        <Text style={[styles.phraseSource, { color: identity.text.primary }]}>
          {data.phrase_fr || data.translation}
        </Text>
      </View>

      {/* 2. ZONE DE SAISIE */}
      <TextInput
        style={[
          styles.input,
          { 
            borderColor: isRevealed ? moduleColor : identity.text.tertiary + '33',
            color: identity.text.primary,
            backgroundColor: identity.palette.surface 
          }
        ]}
        placeholder="Tape ta traduction ici..."
        placeholderTextColor={identity.text.tertiary}
        value={userDraft}
        onChangeText={setUserDraft}
        editable={!isRevealed}
        multiline
        // ✅ Remplacement de blurOnSubmit (déprécié) par submitBehavior
        // "blurAndSubmit" permet de fermer le clavier sur Entrée même en multiline
        submitBehavior="blurAndSubmit" 
      />

      {/* 3. RÉVÉLATION (Si validé) */}
      {isRevealed && (
        <View style={styles.revealContainer}>
          <View style={[styles.correctionBlock, { borderLeftColor: moduleColor }]}>
            <Text style={[styles.labelCorrection, { color: moduleColor }]}>
              PHRASE ATTENDUE :
            </Text>
            <Text style={[styles.phraseTarget, { color: identity.text.primary }]}>
              {expectedEnglish}
            </Text>
          </View>

          {data.build ? (
            <View style={[styles.pedagogyCard, { backgroundColor: identity.palette.surface }]}>
              <Text style={[styles.pedagogyTitle, { color: identity.text.primary }]}>
                La Structure
              </Text>
              <Text style={[styles.pedagogyText, { color: identity.text.secondary }]}>
                {data.build}
              </Text>
            </View>
          ) : null}

          {data.explanation ? (
            <View style={[styles.pedagogyCard, { backgroundColor: identity.palette.surface }]}>
              <Text style={[styles.pedagogyTitle, { color: identity.text.primary }]}>
                Explication
              </Text>
              <Text style={[styles.pedagogyText, { color: identity.text.secondary }]}>
                {data.explanation}
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
};

export default SentenceCard;