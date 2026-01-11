import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from './aiDiagnosticStyle';

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
  
  const diagnostic = useMemo(() => {
    const patterns = Object.entries(errorPatterns || {}).map(([key, val]) => ({
      id: key,
      name: key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      count: val.count,
      severity: val.severity || 1
    }));

    if (patterns.length === 0) return null;

    const topWeakness = patterns.sort((a, b) => (b.count * b.severity) - (a.count * a.severity))[0];
    const mastery = Math.max(0, 100 - (patterns.length * 8));

    return { mastery, topWeakness };
  }, [errorPatterns]);

  if (!diagnostic && !challenge) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="brain" size={24} color="#6366F1" />
          <Text style={styles.title}>Analyse Coach IA</Text>
        </View>
        <View style={styles.masteryBadge}>
          <Text style={styles.masteryText}>{diagnostic?.mastery || '--'}%</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>CONSTAT</Text>
        <View style={styles.bubble}>
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#EF4444" />
          <Text style={styles.bubbleText} numberOfLines={1}>
            Difficulté : <Text style={styles.bold}>{diagnostic?.topWeakness?.name || 'Analyse...'}</Text>
          </Text>
        </View>
      </View>

      {challenge && (
        <LinearGradient colors={['#F5F3FF', '#EDE9FE']} style={styles.solutionBox}>
          <Text style={styles.sectionLabel}>SOLUTION</Text>
          <Text style={styles.coachMessage}>"{challenge.userMessage}"</Text>
          
          <TouchableOpacity style={styles.ctaButton} onPress={onTakeChallenge} activeOpacity={0.8}>
            <Text style={styles.ctaText}>Relever le défi</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
          </TouchableOpacity>
        </LinearGradient>
      )}
    </View>
  );
};

export default AIDiagnosticCard;