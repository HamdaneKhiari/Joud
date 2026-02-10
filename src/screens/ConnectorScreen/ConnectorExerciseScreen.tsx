import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { useProgress } from '@/contexts/ProgressContext';
import { useExerciseActivity } from '@/hooks/exercises/useExerciseActivity';
import { useExerciseSaveOnUnmount } from '@/hooks/exercises/useExerciseSaveOnUnmount';
import { tokens, withOpacity } from '@/themes/tokens';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ConnectorCardRenderer from '../../components/pedagogy/Connector/ConnectorCardRenderer';
import { useConnectorState } from './hooks/useConnectorState';
import { useConnectorHandlers } from './hooks/useConnectorHandlers';

interface ConnectorExerciseParams {
  familyId: number;
  title?: string;
  moduleColor?: string;
  levelId?: number;
}

const ConnectorExerciseScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db } = useUser();
  const { trackItemCompletion, saveProgressNow } = useProgress();
  const navigation = useNavigation();
  const route = useRoute();

  const params = route.params as ConnectorExerciseParams;
  const familyId = params?.familyId;
  const safeFamilyId = String(familyId || '');

  const moduleColor = params?.moduleColor || identity.palette.primary;
  const title = params?.title || 'Exercise';
  const levelId = params?.levelId || 1;

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentItem = questions[currentIndex];
  const exerciseType = currentItem?.type || 'logic';
  
  // ✅ On passe l'exerciseType actuel pour que le hook sache quel état piloter
  const connectorStates = useConnectorState(exerciseType);

  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      try {
        setLoading(true);
        const result = await db.getAllAsync(
          `SELECT * FROM content WHERE family_id = ? AND subfamily_id = 0`,
          [familyId]
        );
        
        if (result && result.length > 0) {
          const parsedQuestions = result.map((item: any) => ({
            ...item,
            data: typeof item.data === 'string' ? JSON.parse(item.data) : item.data,
            type: item.content_type 
          }));
          setQuestions(parsedQuestions);
        } else {
          Alert.alert("Info", "No exercises found for this family.");
          navigation.goBack();
        }
      } catch (error) {
        console.error("Erreur Load Content:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [db, familyId]);

  // Activité + auto-save
  useExerciseActivity({
    moduleSlug: 'connector',
    familyId: safeFamilyId,
    levelId: Number(levelId),
    familyName: title,
    icon: 'puzzle',
    currentIndex,
    totalItems: questions.length,
    enabled: !loading && questions.length > 0,
  });

  useExerciseSaveOnUnmount();

  const handleNavigateBack = useCallback(async () => {
    trackItemCompletion(Number(levelId), 'connector', safeFamilyId, questions.length - 1, questions.length);
    await saveProgressNow();
    Alert.alert("Bravo !", "You have finished this series.", [{ text: "Done", onPress: () => navigation.goBack() }]);
  }, [trackItemCompletion, levelId, safeFamilyId, questions.length, saveProgressNow, navigation]);

  const handlers = useConnectorHandlers({
    question: currentItem?.data,
    isLastQuestion: currentIndex === questions.length - 1,
    onNavigateBack: handleNavigateBack,
    setCurrentQuestionIndex: setCurrentIndex,
    states: connectorStates,
    onValidationSuccess: () => {
      // Optionnel : trigger une petite animation de succès ici
    } 
  });

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.palette.surface }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={[styles.loadingText, { color: identity.text.secondary }]}>Preparing your session...</Text>
      </View>
    );
  }

  if (!currentItem) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: identity.palette.surface }]}>
        <Text style={[styles.errorText, { color: identity.text.primary }]}>Question introuvable</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: identity.palette.surface }]}>
      {/* Header White Label */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: identity.palette.surface,
          borderBottomColor: withOpacity(identity.text.tertiary, 0.1) 
        }
      ]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={identity.text.primary} />
        </TouchableOpacity>

        <View style={styles.titleWrapper}>
          <Text style={[styles.headerTitle, { color: identity.text.primary }]}>
            {title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: identity.text.tertiary }]}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <View style={styles.headerRight} /> 
      </View>

      <ConnectorCardRenderer
        exerciseType={exerciseType}
        currentQuestion={currentItem.data}
        currentQuestionIndex={currentIndex}
        isLastQuestion={currentIndex === questions.length - 1}
        exerciseFamily={{ color: moduleColor }}
        states={connectorStates}
        handlers={handlers}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: tokens.spacing.md },
  loadingText: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.medium 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: tokens.layout.screenPadding, 
    height: 70, // Un peu plus grand pour plus de confort
    borderBottomWidth: 1 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: tokens.borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: tokens.fontSize.md, 
    fontWeight: tokens.fontWeight.bold,
  },
  headerSubtitle: {
    fontSize: tokens.fontSize.xs,
    fontWeight: tokens.fontWeight.medium,
  },
  headerRight: { width: 40 }, // Équilibre le bouton retour
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: tokens.fontSize.lg,
    fontWeight: tokens.fontWeight.bold,
  },
});

export default ConnectorExerciseScreen;