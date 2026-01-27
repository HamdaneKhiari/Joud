import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/themes/ThemeContext';
import AudioButton from '@/components/ui/AudioButtons/AudioButton';
import { createStyles } from './DailyWordCardStyles';

interface DailyWordProps {
  word: {
    english: string;
    french: string;
    emoji?: string;
  };
}

const DailyWordCard: React.FC<DailyWordProps> = ({ word }) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  // Gestion du fond : Couleur unie ou Dégradé
  const isGradient = Array.isArray(identity.dailyWord.background);
  const Container: any = isGradient ? LinearGradient : View;
  
  const containerProps = isGradient 
    ? { colors: identity.dailyWord.background, start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }
    : { style: [styles.container, { backgroundColor: identity.dailyWord.background as string }] };

  return (
    <Container {...containerProps} style={isGradient ? styles.container : containerProps.style}>
      {/* Élément décoratif type Watermark */}
      <Text style={styles.watermark}>
        {identity.header.emoji}
      </Text>

      <View style={styles.header}>
        <Text style={{ fontSize: 18, marginRight: 8 }}>{word.emoji || '🌱'}</Text>
        <Text style={styles.tag}>Mot du jour</Text>
      </View>

      <View style={styles.wordRow}>
        <Text style={[styles.englishWord, { color: identity.text.primary }]}>{word.english}</Text>
        {/* Utilisation du mode "Icône Seule" validé à l'étape précédente */}
        <AudioButton 
          text={word.english} 
          size="small" 
          style={{ marginLeft: 12 }} 
        />
      </View>

      <Text style={styles.frenchTranslation}>{word.french}</Text>
    </Container>
  );
};

export default DailyWordCard;