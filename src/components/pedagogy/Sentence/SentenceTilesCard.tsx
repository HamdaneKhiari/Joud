/**
 * ============================================
 * SENTENCE TILES CARD (Mode Collège)
 * Reconstruction de phrase par tuiles de mots (tap-to-place)
 * ✅ 100% White Label
 * ============================================
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getSentenceTilesCardStyles } from './SentenceTilesCard.styles';
import { SentenceData } from '@/hooks/exercises/useExerciseContent';
import { getExpectedPhraseEn, tokenizePhraseForTiles, shuffleTiles, TileToken } from '@/utils/phraseUtils';

interface SentenceTilesCardProps {
  data: SentenceData;
  placedTokens: TileToken[];
  onTokensChange: (tokens: TileToken[]) => void;
  isValidated: boolean;
  isCorrect: boolean;
  moduleColor: string;
}

const SentenceTilesCard: React.FC<SentenceTilesCardProps> = ({
  data,
  placedTokens,
  onTokensChange,
  isValidated,
  isCorrect,
  moduleColor,
}) => {
  const { identity } = useTheme();

  // Mémorisation des styles avec white label
  const styles = useMemo(
    () => getSentenceTilesCardStyles(identity, moduleColor),
    [identity, moduleColor]
  );

  // Phrase anglaise attendue (fallback depuis sentence + correct_answer si besoin)
  const phraseEn = useMemo(() => getExpectedPhraseEn(data), [data]);

  // Tokenisation (ordre correct) + ponctuation finale décorative
  const { tokens: orderedTokens, trailingPunctuation } = useMemo(
    () => tokenizePhraseForTiles(phraseEn),
    [phraseEn]
  );

  // Ordre mélangé pour le pool (stable tant que la phrase ne change pas)
  const shuffledTokens = useMemo(() => shuffleTiles(orderedTokens), [orderedTokens]);

  // Tuiles du pool = tuiles mélangées non encore placées (identifiées par id, jamais par texte)
  const placedIds = useMemo(() => new Set(placedTokens.map((t) => t.id)), [placedTokens]);
  const poolTokens = useMemo(
    () => shuffledTokens.filter((t) => !placedIds.has(t.id)),
    [shuffledTokens, placedIds]
  );

  const handlePlace = (tile: TileToken) => {
    if (isValidated) return;
    onTokensChange([...placedTokens, tile]);
  };

  const handleRemove = (tile: TileToken) => {
    if (isValidated) return;
    onTokensChange(placedTokens.filter((t) => t.id !== tile.id));
  };

  return (
    <View style={styles.container}>
      {/* 1. INSTRUCTION */}
      <View style={styles.instructionBox}>
        <Text style={styles.instruction}>Reconstruis la phrase :</Text>
      </View>

      {/* 2. CONSIGNE FR */}
      {(data.translation || data.phrase_fr) && (
        <View style={styles.promptBox}>
          <Text style={styles.promptText}>{data.translation || data.phrase_fr}</Text>
        </View>
      )}

      {/* 3. ZONE DE CONSTRUCTION */}
      <View style={styles.buildZone}>
        {placedTokens.length === 0 ? (
          <Text style={styles.emptyText}>Tape les mots ci-dessous...</Text>
        ) : (
          placedTokens.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.placedTile}
              onPress={() => handleRemove(tile)}
              disabled={isValidated}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Retirer "${tile.text}"`}
            >
              <Text style={styles.placedTileText}>{tile.text}</Text>
            </TouchableOpacity>
          ))
        )}
        {trailingPunctuation ? <Text style={styles.punctuation}>{trailingPunctuation}</Text> : null}
      </View>

      {/* 4. BLOC ASTUCE (optionnel) */}
      {data.tip && (
        <View style={styles.tipBlock}>
          <Text style={styles.tipLabel}>💡 Tip</Text>
          <Text style={styles.tipText}>{data.tip}</Text>
        </View>
      )}

      {/* 5. POOL DE TUILES */}
      {!isValidated && (
        <View style={styles.poolContainer}>
          {poolTokens.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.poolTile}
              onPress={() => handlePlace(tile)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Ajouter "${tile.text}"`}
            >
              <Text style={styles.poolTileText}>{tile.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* 6. FEEDBACK APRÈS VALIDATION */}
      {isValidated && (
        <View style={styles.feedbackContainer}>
          <View
            style={[
              styles.correctAnswerBlock,
              {
                backgroundColor: isCorrect
                  ? identity.palette.accent + '10'
                  : identity.aiDiagnostic.error + '10',
                borderLeftColor: isCorrect ? identity.palette.accent : identity.aiDiagnostic.error,
              },
            ]}
          >
            <Text
              style={[
                styles.correctAnswerLabel,
                { color: isCorrect ? identity.palette.accent : identity.aiDiagnostic.error },
              ]}
            >
              ✓ PHRASE CORRECTE :
            </Text>
            <Text style={styles.correctAnswerText}>{phraseEn}</Text>
          </View>

          {data.explanation && (
            <View
              style={[
                styles.explanationBlock,
                { backgroundColor: moduleColor + '10', borderColor: moduleColor + '20' },
              ]}
            >
              <Text style={[styles.explanationTitle, { color: moduleColor }]}>💡 POURQUOI ?</Text>
              <Text style={styles.explanationText}>{data.explanation}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default SentenceTilesCard;
