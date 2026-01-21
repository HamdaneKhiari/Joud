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
  Keyboard
} from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
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
  // Props passées via la navigation ou le parent
  content?: any; // Le contenu brut chargé depuis la DB
  onNext?: (success: boolean) => void; // Callback pour passer à la suite
  moduleColor?: string;
}

const SentenceScreen: React.FC<SentenceScreenProps> = () => {
  const { identity } = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  
  // Récupération des paramètres (simulée ici, à adapter selon ton routing)
  // Dans la vraie vie, ces données viennent de useExerciseContent
  const params = route.params as any || {};
  const moduleColor = params.moduleColor || identity.primary_color;
  
  // État local
  const [inputText, setInputText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  // Données simulées si non fournies (pour tester l'UI sans DB connectée directement)
  const data: SentenceData = params.data ? JSON.parse(params.data) : {
    phrase_fr: "Je voudrais un café, s'il vous plaît.",
    phrase_en: "I would like a coffee, please.",
    concretement: "Utilisé pour commander poliment dans un café ou un restaurant.",
    build: "I would like (Je voudrais) + a coffee (un café) + please"
  };

  const handleCheck = () => {
    Keyboard.dismiss();
    setShowFeedback(true);
  };

  const handleResult = (success: boolean) => {
    // Ici, on appellerait la logique pour passer à l'exercice suivant
    // et sauvegarder le score (+1 si success)
    console.log(success ? "Gagné" : "À revoir");
    
    // Reset pour le prochain (demo)
    setInputText('');
    setShowFeedback(false);
    
    if (params.onNext) {
      params.onNext(success);
    } else {
      // Fallback navigation
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: identity.surface_color }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- HEADER : La consigne --- */}
        <View style={styles.headerContainer}>
          <Text style={[styles.instructionLabel, { color: identity.text_on_main_color + '80' }]}>
            TRADUIS CETTE PHRASE
          </Text>
          <View style={[styles.phraseCard, { backgroundColor: identity.ui_has_gradient ? 'transparent' : '#fff' }]}>
            <Text style={[styles.phraseFr, { color: identity.text_on_main_color }]}>
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
                borderColor: showFeedback 
                  ? (inputText.toLowerCase().trim() === data.phrase_en.toLowerCase().trim() ? '#4CAF50' : moduleColor) 
                  : '#E0E0E0',
                backgroundColor: identity.theme_mode === 'dark' ? '#1E293B' : '#FFFFFF',
                color: identity.text_on_main_color
              }
            ]}
            placeholder="Écris en anglais ici..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!showFeedback} // On bloque l'édit en phase correction pour comparer
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
            <View style={[styles.infoCard, { backgroundColor: identity.theme_mode === 'dark' ? '#334155' : '#F8FAFC' }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color="#F59E0B" />
                <Text style={styles.infoTitle}>Concrètement</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.text_on_main_color }]}>
                {data.concretement}
              </Text>
            </View>

            {/* Bloc Build */}
            <View style={[styles.infoCard, { backgroundColor: identity.theme_mode === 'dark' ? '#334155' : '#F8FAFC' }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="toy-brick" size={20} color="#3B82F6" />
                <Text style={styles.infoTitle}>La Structure</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.text_on_main_color }]}>
                {data.build}
              </Text>
            </View>

          </View>
        )}
      </ScrollView>

      {/* --- FOOTER ACTIONS --- */}
      <View style={[styles.footer, { backgroundColor: identity.surface_color, borderTopColor: '#E2E8F0' }]}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: moduleColor }]}
            onPress={handleCheck}
            activeOpacity={0.8}
          >
            <Text style={styles.mainButtonText}>Voir la traduction</Text>
            <MaterialCommunityIcons name="eye" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
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
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 100, // Espace pour le footer
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
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderTopWidth: 1,
  },
  mainButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  mainButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  decisionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  decisionButton: {
    flex: 1,
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  retryButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  successButton: {
    backgroundColor: '#22C55E', // Green standard
  },
  successButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SentenceScreen;