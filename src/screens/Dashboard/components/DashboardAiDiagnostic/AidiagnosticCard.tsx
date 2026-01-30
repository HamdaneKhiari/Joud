/**
 * AIDiagnosticCard - Version améliorée
 * 100% White Label + Mood-Aware + Animations
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/themes/ThemeContext';
import { createStyles } from './AidiagnosticCardStyles';

interface ErrorPattern {
  count: number;
  severity?: number;
}

interface AIDiagnosticCardProps {
  errorPatterns: Record<string, ErrorPattern>;
  challenge?: {
    userMessage: string;
  } | null;
  onTakeChallenge: () => void;
}

const AIDiagnosticCard: React.FC<AIDiagnosticCardProps> = ({
  errorPatterns,
  challenge,
  onTakeChallenge
}) => {
  const { identity } = useTheme();
  const styles = useMemo(() => createStyles(identity), [identity]);

  const diagnostic = useMemo(() => {
    // 1. Transformation des données brutes en tableau d'objets exploitables
    const patterns = Object.entries(errorPatterns || {}).map(([key, val]) => ({
      id: key,
      name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      count: val.count,
      severity: val.severity || 1
    }));

    if (patterns.length === 0) return null;

    /**
     * ✅ CORRECTION CRASH & SONARLINT :
     * On ne peut pas utiliser .toSorted() (pas supporté par React Native).
     * On ne doit pas faire .sort() directement sur 'patterns' (mutation interdite).
     * Solution : On spread [...] pour copier, puis on trie sur une ligne à part.
     */
    const sortedPatterns = [...patterns];
    sortedPatterns.sort((a, b) => (b.count * b.severity) - (a.count * a.severity));

    const topWeakness = sortedPatterns[0];
    const mastery = Math.max(0, 100 - (patterns.length * 8));

    return { mastery, topWeakness };
  }, [errorPatterns]);

  // Si aucune donnée à analyser et aucun défi en cours, on n'affiche rien
  if (!diagnostic && !challenge) return null;

  const isPlayful = identity.ui.mood === 'playful';

  return (
    <Animated.View entering={FadeInDown.springify()} style={styles.container}>
      {/* HEADER : Titre et Score de Maîtrise */}
      <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons
            name="brain"
            size={isPlayful ? 28 : 24}
            color={identity.aiDiagnostic.accent}
          />
          <Text style={styles.title}>
            {isPlayful ? 'Coach IA' : 'Analyse Coach IA'}
          </Text>
        </View>
        <View style={styles.masteryBadge}>
          <Text style={styles.masteryText}>{diagnostic?.mastery || '--'}%</Text>
        </View>
      </Animated.View>

      {/* SECTION CONSTAT : Affiche la difficulté principale */}
      <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
        <Text style={styles.sectionLabel}>
          {isPlayful ? 'Constat' : 'CONSTAT'}
        </Text>
        <View style={styles.bubble}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={isPlayful ? 22 : 18}
            color={identity.aiDiagnostic.error}
          />
          <Text style={styles.bubbleText} numberOfLines={1}>
            Difficulté : <Text style={styles.bold}>{diagnostic?.topWeakness?.name || 'Analyse...'}</Text>
          </Text>
        </View>
      </Animated.View>

      {/* SECTION SOLUTION : Le message du coach et le bouton d'action */}
      {challenge && (
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <LinearGradient
            colors={identity.aiDiagnostic.solutionBackground}
            style={styles.solutionBox}
          >
            <Text style={styles.sectionLabel}>
              {isPlayful ? 'Solution' : 'SOLUTION'}
            </Text>
            <Text style={styles.coachMessage}>
              {isPlayful ? challenge.userMessage : `"${challenge.userMessage}"`}
            </Text>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={onTakeChallenge}
              activeOpacity={0.8}
            >
              <Text style={styles.ctaText}>
                {isPlayful ? 'Relever le défi !' : 'Relever le défi'}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color={identity.text.onPrimary}
              />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      )}
    </Animated.View>
  );
};

export default AIDiagnosticCard;