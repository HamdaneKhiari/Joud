import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens, withOpacity } from '@/themes/tokens'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ReadingCard from '../../components/pedagogy/reading/ReadingCard';
import { useReadingState } from './hooks/useReadingState';
import { useReadingHandlers } from './hooks/useReadingHandlers';
import { ReadingQuestionData } from '../../components/pedagogy/reading/types';

interface ReadingExerciseParams {
  familyId: number;
  title?: string;
  moduleColor?: string;
  levelId?: number;
}

const MAX_ATTEMPTS = 2;

const ReadingExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params as ReadingExerciseParams;
  const familyId = params?.familyId;
  
  // 1. CORRECTION : Utilisation de identity.branding.main par défaut au lieu de primary
  const moduleColor = params?.moduleColor || identity.branding.main;
  const title = params?.title || 'Reading';
  const levelId = params?.levelId || 1;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<ReadingQuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { state, setState, resetState } = useReadingState();

  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      try {
        setLoading(true);
        const result = await db.getAllAsync(
          `SELECT * FROM content WHERE family_id = ?`,
          [familyId]
        );
        
        if (result && result.length > 0) {
          const parsedQuestions = result.map((item: any) => JSON.parse(item.data));
          setQuestions(parsedQuestions);
          setCurrentIndex(0);
        } else {
          Alert.alert("Info", "Aucun exercice trouvé.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur chargement Reading:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [db, familyId, navigation]);

  const handleValidationSuccess = useCallback(() => {
    // Tracking success logic
  }, []);

  const handleNavigateBack = useCallback(() => {
    if (db && familyId) {
      db.runAsync(
        `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) 
         VALUES (?, ?, ?, 1, ?, ?)`,
        ['user_default', familyId, levelId, 100, new Date().toISOString()]
      ).catch((e) => console.error("Erreur sauvegarde:", e));
    }
    Alert.alert("Bravo !", "Série terminée.", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  }, [db, familyId, levelId, navigation]);

  const currentQuestion = questions[currentIndex];

  const handlers = useReadingHandlers({
    question: currentQuestion,
    isLastQuestion: currentIndex === questions.length - 1,
    onNavigateBack: handleNavigateBack,
    setCurrentQuestionIndex: setCurrentIndex,
    state,
    setState,
    resetState,
    onValidationSuccess: handleValidationSuccess
  });

  // 2. CORRECTION : Remplacement du #FFFFFF par identity.branding.surface ou tokens.colors.white
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Loading...</Text>
      </View>
    );
  }

  if (!currentQuestion) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.branding.surface }]}>
      {/* 3. CORRECTION : Header avec bordure à opacité variable pour le White Label */}
      <View style={[
        styles.header, 
        { borderBottomColor: withOpacity(identity.text.tertiary, 0.2) }
      ]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons 
            name="arrow-left" 
            size={tokens.fontSize.xl} 
            color={identity.text.primary} 
          />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: identity.text.primary }]}>
          {title} ({currentIndex + 1}/{questions.length})
        </Text>
        
        <View style={{ width: 40 }} /> 
      </View>

      <ReadingCard
        question={currentQuestion}
        selectedOption={state.selectedOption}
        isValidated={state.isValidated}
        isCorrect={state.isCorrect}
        attemptCount={state.attemptCount}
        maxAttempts={MAX_ATTEMPTS}
        isPlaying={state.isPlaying}
        onPlayAudio={handlers.onPlayAudio}
        onAnswer={handlers.onAnswer}
        onValidate={handlers.onValidate}
        onNext={handlers.onNext}
        onRetry={handlers.onRetry}
        isLastQuestion={currentIndex === questions.length - 1}
        color={moduleColor} // Passage de la couleur de module
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: tokens.spacing.md 
  },
  loadingText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.medium 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: tokens.layout.screenPadding, 
    height: tokens.layout.navBarHeight, 
    borderBottomWidth: tokens.borderWidth.thin 
  },
  backButton: { 
    padding: tokens.spacing.xs, 
    borderRadius: tokens.borderRadius.round 
  },
  headerTitle: { 
    fontSize: tokens.fontSize.lg, 
    fontWeight: tokens.fontWeight.semibold 
  },
});

export default ReadingExerciseScreen;