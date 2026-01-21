import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ActivityIndicator
} from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// Types pour les données JSON stockées en DB
interface SentenceData {
  phrase_fr: string;
  phrase_en: string;
  concretement: string;
  build: string;
  audio?: string;
}

interface SentenceScreenProps {
  navigation?: any;
  route?: any;
}

interface SentenceParams {
  familyId?: number;
  levelId?: number;
  moduleColor?: string;
  data?: string;
}

const SentenceScreen: React.FC<SentenceScreenProps> = (props) => {
  const { identity } = useTheme();
  const { db } = useUser();
  const navigation = useNavigation();
  const route = useRoute();
  
  // Fusion des params (priorité aux props passées directement si existantes)
  const params = (props.route?.params || route.params || {}) as SentenceParams;
  const { familyId } = params;
  const moduleColor = params.moduleColor || identity.branding.main;

  // État local
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // Chargement du contenu depuis la DB
  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      
      try {
        setLoading(true);
        // On récupère le contenu de type 'sentence' pour cette famille
        const result = await db.getAllAsync(
          `SELECT * FROM content WHERE family_id = ? AND content_type = 'sentence'`,
          [familyId]
        );
        
        if (result && result.length > 0) {
          setExercises(result);
        } else {
          // Fallback si pas de données (pour éviter l'écran blanc en dev)
          console.warn("Aucun contenu 'sentence' trouvé pour familyId:", familyId);
        }
      } catch (error) {
        console.error("Erreur chargement phrases:", error);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [db, familyId]);

  // Données courantes
  const currentExercise = exercises[currentIndex];
  const data: SentenceData = currentExercise ? JSON.parse(currentExercise.data) : {
    phrase_fr: "Chargement...",
    phrase_en: "",
    concretement: "",
    build: ""
  };

  // Calcul de la couleur de bordure (Refacto pour éviter nested ternary)
  const isCorrect = inputText.toLowerCase().trim() === data.phrase_en.toLowerCase().trim();
  const inputBorderColor = showFeedback 
    ? (isCorrect ? '#4CAF50' : moduleColor) 
    : '#E0E0E0';

  const handleCheck = () => {
    Keyboard.dismiss();
    setShowFeedback(true);
  };

  const handleResult = (success: boolean) => {
    // Logique de progression ici (sauvegarde score, etc.)
    console.log(success ? "Gagné" : "À revoir");

    if (currentIndex < exercises.length - 1) {
      // Exercice suivant
      setInputText('');
      setShowFeedback(false);
      setCurrentIndex(prev => prev + 1);
    } else if (props.navigation) {
      props.navigation.goBack();
    } else {
      navigation.goBack();
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
        <ActivityIndicator size="large" color={moduleColor} />
        <Text style={{ color: identity.branding.textOnMain, marginTop: 10 }}>Chargement des phrases...</Text>
      </View>
    );
  }

  if (!currentExercise) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
        <Text style={{ color: identity.branding.textOnMain }}>Aucune phrase disponible pour le moment.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: moduleColor }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: identity.branding.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- HEADER : La consigne --- */}
        <View style={styles.headerContainer}>
          <Text style={[styles.instructionLabel, { color: identity.branding.textOnMain + '80' }]}>
            TRADUIS CETTE PHRASE ({currentIndex + 1}/{exercises.length})
          </Text>
          <View style={[styles.phraseCard, { backgroundColor: identity.ui.hasGradient ? 'transparent' : '#fff' }]}>
            <Text style={[styles.phraseFr, { color: identity.branding.textOnMain }]}>
              {data.phrase_fr}
            </Text>
          </View>
        </View>

        {/* --- ZONE DE SAISIE (Phase 1) --- */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              { 
                borderColor: inputBorderColor,
                backgroundColor: identity.branding.themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
                color: identity.branding.textOnMain
              }
            ]}
            placeholder="Écris en anglais ici..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!showFeedback}
          />
        </View>

        {/* --- FEEDBACK (Phase 2) --- */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            
            {/* La Réponse Officielle */}
            <View style={styles.correctionBlock}>
              <Text style={styles.correctionLabel}>RÉPONSE CORRECTE</Text>
              <Text style={[styles.correctionText, { color: moduleColor }]}>
                {data.phrase_en}
              </Text>
            </View>

            {/* Bloc Concrètement */}
            <View style={[styles.infoCard, { backgroundColor: identity.branding.themeMode === 'dark' ? '#334155' : '#F8FAFC' }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F59E0B" />
                <Text style={styles.infoTitle}>Concrètement</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.branding.textOnMain }]}>
                {data.concretement}
              </Text>
            </View>

            {/* Bloc Build */}
            <View style={[styles.infoCard, { backgroundColor: identity.branding.themeMode === 'dark' ? '#334155' : '#F8FAFC' }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="toy-brick" size={20} color="#3B82F6" />
                <Text style={styles.infoTitle}>La Structure</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.branding.textOnMain }]}>
                {data.build}
              </Text>
            </View>

          </View>
        )}
      </ScrollView>

      {/* --- FOOTER ACTIONS --- */}
      <View style={[styles.footer, { backgroundColor: identity.branding.surface, borderTopColor: '#E2E8F0' }]}>
        {showFeedback ? (
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[styles.decisionButton, styles.retryButton]}
              onPress={() => handleResult(false)}
            >
              <MaterialCommunityIcons name="refresh" size={20} color="#64748B" />
              <Text style={styles.retryButtonText}>À revoir</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionButton, styles.successButton]}
              onPress={() => handleResult(true)}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.successButtonText}>J'ai bon !</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: moduleColor }]}
            onPress={handleCheck}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Voir la traduction</Text>
            <MaterialCommunityIcons name="eye" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  headerContainer: {
    marginBottom: 20,
  },
  instructionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phraseCard: {
    paddingVertical: 10,
  },
  phraseFr: {
    fontSize: 24,
    fontWeight: '600',
    lineHeight: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  textInput: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 16,
    fontSize: 18,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  feedbackContainer: {
    gap: 16,
  },
  correctionBlock: {
    marginBottom: 8,
  },
  correctionLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
    marginBottom: 4,
  },
  correctionText: {
    fontSize: 22,
    fontWeight: '700',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  // ... (reste des styles identiques à la version précédente)
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  infoText: { fontSize: 16, lineHeight: 24 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, borderTopWidth: 1 },
  mainButton: { flexDirection: 'row', height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  mainButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  decisionRow: { flexDirection: 'row', gap: 12 },
  decisionButton: { flex: 1, height: 56, borderRadius: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  retryButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
  retryButtonText: { color: '#64748B', fontSize: 16, fontWeight: '700' },
  successButton: { backgroundColor: '#22C55E' },
  successButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default SentenceScreen;