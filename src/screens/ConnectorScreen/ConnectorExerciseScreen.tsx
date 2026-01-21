import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens } from '@/themes/tokens';
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
  const navigation = useNavigation();
  const route = useRoute();
  
  const params = route.params as ConnectorExerciseParams;
  const familyId = params?.familyId;
  const moduleColor = params?.moduleColor || identity.branding.primary;
  const title = params?.title || 'Connector';
  const levelId = params?.levelId || 1;

  // --- STATE ---
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // --- HOOKS ---
  const currentItem = questions[currentIndex];
  const exerciseType = currentItem?.type || 'logic';
  const connectorStates = useConnectorState(exerciseType);

  // --- CHARGEMENT DES DONNÉES ---
  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      
      try {
        setLoading(true);
        // On charge tout le contenu de la famille
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

           // --- LOGIQUE DE REPRISE (Resume) ---
           // On cherche si une progression existe pour cette famille
           // Note: Dans une implémentation idéale, on stockerait l'index exact dans 'progress'
           // Ici on simule en vérifiant si la famille est déjà complétée
           await db.getFirstAsync(
             `SELECT completed FROM progress WHERE family_id = ? AND level = ?`,
             [familyId, levelId]
           );
           
           // Si la famille n'est pas marquée comme complétée, on commence au début (ou logique plus fine si DB le permet)
           // Pour l'instant, on reste simple : index 0
           setCurrentIndex(0);

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
  }, [db, familyId, levelId]);

  // --- LOGIQUE MÉTIER ---

  const currentQuestion = currentItem?.data;

  const handleValidationSuccess = useCallback(() => {
    // Logique de succès (ex: tracking analytique)
    // La sauvegarde finale se fait à la fin de la série
  }, []);

  const handleNavigateBack = useCallback(() => {
    // Fin de la série : Sauvegarde DB
    if (db && familyId) {
      db.runAsync(
        `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) 
         VALUES (?, ?, ?, 1, ?, ?)`,
        ['user_default', familyId, levelId, 100, new Date().toISOString()]
      ).catch((e) => {
        console.error("Erreur sauvegarde progression:", e);
      });
    }

    Alert.alert("Bravo !", "Série terminée.", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  }, [db, familyId, levelId, navigation]);

  const handlers = useConnectorHandlers({
    question: currentQuestion,
    isLastQuestion: currentIndex === questions.length - 1,
    onNavigateBack: handleNavigateBack,
    setCurrentQuestionIndex: setCurrentIndex,
    states: connectorStates,
    onValidationSuccess: handleValidationSuccess
  });

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
        states={connectorStates}
        handlers={handlers}
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