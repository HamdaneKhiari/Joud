import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens } from '@/themes/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConnectorCardRenderer from './ConnectorCardRenderer';
import { 
  LogicQuestion, 
  FusionQuestion, 
  RephrasingQuestion 
} from './types';

interface ConnectorExerciseParams {
  familyId: number;
  title?: string;
  moduleColor?: string;
}

const ConnectorExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params as ConnectorExerciseParams;
  const familyId = params?.familyId;
  const moduleColor = params?.moduleColor || identity.branding.primary;
  const title = params?.title || 'Connector';

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // État unifié pour tous les types d'exercices
  const [exerciseState, setExerciseState] = useState({
    selectedOption: undefined as string | undefined, // Pour Logic
    userAnswer: undefined as string | undefined,     // Pour Fusion/Rephrasing
    isValidated: false,
    isCorrect: false,
    attemptCount: 0
  });

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      
      try {
        setLoading(true);
        // On charge tout le contenu de la famille
        // Le champ 'content_type' déterminera si c'est 'logic', 'fusion' ou 'rephrasing'
        const result = await db.getAllAsync(
          `SELECT * FROM content WHERE family_id = ?`,
          [familyId]
        );
        
        if (result && result.length > 0) {
          // Parsing des données JSON
          const parsedQuestions = result.map((item: any) => ({
            ...item,
            data: JSON.parse(item.data),
            type: item.content_type // 'logic' | 'fusion' | 'rephrasing'
          }));
          setQuestions(parsedQuestions);
        } else {
          Alert.alert("Info", "Aucun exercice trouvé pour cette section.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur chargement Connector:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [db, familyId]);

  // --- LOGIQUE MÉTIER ---

  const currentItem = questions[currentIndex];
  const currentQuestion = currentItem?.data;
  const exerciseType = currentItem?.type;

  const handleAnswer = useCallback((answer: string) => {
    if (exerciseState.isValidated) return;
    
    if (exerciseType === 'logic') {
      setExerciseState(prev => ({ ...prev, selectedOption: answer }));
    } else {
      setExerciseState(prev => ({ ...prev, userAnswer: answer }));
    }
  }, [exerciseState.isValidated, exerciseType]);

  const handleValidate = useCallback(() => {
    let isCorrect = false;

    if (exerciseType === 'logic') {
      isCorrect = exerciseState.selectedOption === currentQuestion.correctAnswer;
    } else if (exerciseType === 'fusion' || exerciseType === 'rephrasing') {
      // Comparaison simple (peut être améliorée avec de la tolérance)
      const userClean = (exerciseState.userAnswer || '').trim().toLowerCase();
      const correctClean = (currentQuestion.correctAnswer || '').trim().toLowerCase();
      isCorrect = userClean === correctClean;
    }

    setExerciseState(prev => ({
      ...prev,
      isValidated: true,
      isCorrect,
      attemptCount: isCorrect ? prev.attemptCount : prev.attemptCount + 1
    }));
  }, [exerciseType, exerciseState, currentQuestion]);

  const handleRetry = useCallback(() => {
    setExerciseState(prev => ({
      ...prev,
      isValidated: false,
      isCorrect: false,
      // On garde attemptCount incrémenté
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset state pour la prochaine question
      setExerciseState({
        selectedOption: undefined,
        userAnswer: undefined,
        isValidated: false,
        isCorrect: false,
        attemptCount: 0
      });
    } else {
      // Fin de la série
      Alert.alert("Bravo !", "Série terminée.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    }
  }, [currentIndex, questions.length, navigation]);

  // --- RENDU ---

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface || '#FFFFFF' }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Loading exercises...</Text>
      </View>
    );
  }

  if (!currentItem) return null;

  // Construction des objets props pour le Renderer
  const commonHandlers = {
    onAnswer: handleAnswer,
    onValidate: handleValidate,
    onRetry: handleRetry,
    onNext: handleNext
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.branding.surface || '#FFFFFF' }]}>
      {/* HEADER SIMPLE */}
      <View style={[styles.header, { borderBottomColor: identity.text.tertiary }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={tokens.fontSize.xl} color={identity.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: identity.text.primary }]}>
          {title} ({currentIndex + 1}/{questions.length})
        </Text>
        <View style={styles.placeholderIcon} /> 
      </View>

      {/* RENDERER */}
      <ConnectorCardRenderer
        exerciseType={exerciseType}
        currentQuestion={currentQuestion}
        currentQuestionIndex={currentIndex}
        isLastQuestion={currentIndex === questions.length - 1}
        exerciseFamily={{ color: moduleColor }}
        states={{
          logicState: {
            selectedOption: exerciseState.selectedOption,
            isValidated: exerciseState.isValidated,
            isCorrect: exerciseState.isCorrect,
            attemptCount: exerciseState.attemptCount
          },
          fusionState: {
            userAnswer: exerciseState.userAnswer,
            isValidated: exerciseState.isValidated,
            isCorrect: exerciseState.isCorrect,
            attemptCount: exerciseState.attemptCount
          },
          rephrasingState: {
            userAnswer: exerciseState.userAnswer,
            isValidated: exerciseState.isValidated,
            isCorrect: exerciseState.isCorrect,
            attemptCount: exerciseState.attemptCount
          }
        }}
        handlers={{
          logic: commonHandlers,
          fusion: commonHandlers,
          rephrasing: commonHandlers
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  loadingText: {
    fontSize: tokens.fontSize.md,
    fontWeight: tokens.fontWeight.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.layout.screenPadding,
    height: tokens.layout.navBarHeight,
    borderBottomWidth: tokens.borderWidth.thin,
  },
  backButton: {
    padding: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.round,
  },
  headerTitle: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.semibold,
  },
  placeholderIcon: {
    width: tokens.fontSize.xl + (tokens.spacing.xs * 2), // Taille icône + padding
  },
});

export default ConnectorExerciseScreen;