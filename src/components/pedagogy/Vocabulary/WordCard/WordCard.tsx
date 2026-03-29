/**
 * ============================================
 * FICHIER: src/components/pedagogy/vocabulary/WordCard.tsx
 * Composant universel de carte de vocabulaire.
 * S'adapte automatiquement à l'identité visuelle de l'app.
 * ============================================
 */

import React, { FC, useMemo } from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { getWordCardStyles } from './WordCard.styles';
import AudioButton from '@/components/ui/AudioButtons/AudioButton';

interface WordCardProps {
  englishWord: string;
  frenchWord: string;
  exampleSentence?: string;
  exampleTranslation?: string;
  highlightWord?: string;
  audio?: string;
  moduleSlug?: string;
}

const WordCard: FC<WordCardProps> = ({
  englishWord,
  frenchWord,
  exampleSentence,
  exampleTranslation,
  highlightWord,
  audio,
  moduleSlug: _moduleSlug,
}) => {
  const { identity } = useTheme();

  const showExample = !!exampleSentence;
  
  // Génération des styles basés sur l'identité actuelle
  const styles = useMemo(() => getWordCardStyles(identity), [identity]);

  /**
   * Rendu de la phrase d'exemple avec mise en évidence du mot clé.
   * Utilise la couleur d'accent de l'identité pour le highlight.
   */
  const renderExample = () => {
    if (!exampleSentence) return null;

    if (!highlightWord) {
      return <Text style={styles.exampleText}>{exampleSentence}</Text>;
    }

    // Découpage simple insensible à la casse pour le highlight
    const parts = exampleSentence.split(new RegExp(`(${highlightWord})`, 'gi'));

    return (
      <Text style={styles.exampleText}>
        {parts.map((part, index) => (
          <Text
            key={index}
            style={
              part.toLowerCase() === highlightWord.toLowerCase()
                ? { color: identity.palette.accent, fontWeight: '700' }
                : {}
            }
          >
            {part}
          </Text>
        ))}
      </Text>
    );
  };

  return (
    <View style={styles.container}>
      {/* Zone du mot principal */}
      <View style={styles.wordContainer}>
        <View style={styles.wordRow}>
          <Text
            style={styles.englishWord}
            adjustsFontSizeToFit
            numberOfLines={1}
            minimumFontScale={0.7}
          >
            {englishWord}
          </Text>
          <AudioButton
            text={englishWord}
            size="medium"
            audioUrl={audio}
            variant="default"
          />
        </View>
        <Text style={styles.frenchWord}>{frenchWord}</Text>
      </View>

      {/* Séparateur décoratif aux couleurs de la marque */}
      {showExample && <View style={styles.separator} />}

      {showExample && (
        <View style={styles.exampleContainer}>
          {renderExample()}
          {exampleTranslation && (
            <Text style={styles.exampleTranslation}>{exampleTranslation}</Text>
          )}
        </View>
      )}
    </View>
  );
};

export default WordCard;