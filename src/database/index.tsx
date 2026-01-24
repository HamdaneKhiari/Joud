import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard
} from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { useUser } from '@/contexts/UserContext';
import { tokens, withOpacity } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

// --- TYPES ---
interface SentenceData {
  phrase_fr: string;
  phrase_en: string;
  concretement: string;
  build: string;
  audio?: string;
}

const SentenceScreen: React.FC = () => {
  const { identity } = useTheme();
  const { db, user } = useUser();
  const route = useRoute();
  const navigation = useNavigation();
  
  const params = route.params as any || {};
  const familyId = params.familyId;
  const levelId = params.levelId || 1;
  const moduleColor = params.moduleColor || identity.branding.main;
  
  const [loading, setLoading] = useState(true);
  const [sentences, setSentences] = useState<SentenceData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputText, setInputText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  // --- CONFIG WHITE LABEL ---
  const uiConfig = useMemo(() => ({
    cardRadius: identity.ui.cardRadius || tokens.borderRadius.lg,
    buttonRadius: tokens.borderRadius.round, // Standardisé via tokens
    borderWidth: 2, // Standardisé
    successColor: baseColors.green500, // Standardisé via baseColors
    errorColor: identity.ai.error,
    warningColor: baseColors.orange500,
    infoColor: baseColors.blue500,
  }), [identity]);

  const i18n = {
    loading: identity.i18n?.loadingLabel || "Chargement...",
    empty: identity.i18n?.emptySentences || "Aucune phrase trouvée.",
    instruction: identity.i18n?.translateInstruction || "TRADUIS CETTE PHRASE",
    placeholder: identity.i18n?.translatePlaceholder || "Écris en anglais ici...",
    correctAnswer: identity.i18n?.correctAnswerLabel || "RÉPONSE CORRECTE",
    concretely: identity.i18n?.concretelyLabel || "Concrètement",
    structure: identity.i18n?.structureLabel || "La Structure",
    showTranslation: identity.i18n?.showTranslationBtn || "Voir la traduction",
    toReview: identity.i18n?.toReviewBtn || "À revoir",
    gotIt: identity.i18n?.gotItBtn || "J'ai bon !",
  };

  // --- LOGIQUE DB ---
  useEffect(() => {
    const loadContent = async () => {
      if (!db || !familyId) return;
      try {
        setLoading(true);
        const result = await db.getAllAsync<{data: string}>(
          `SELECT data FROM content WHERE family_id = ?`,
          [familyId]
        );
        if (result && result.length > 0) {
          const parsed = result.map(item => JSON.parse(item.data));
          setSentences(parsed);
        }
      } catch (error) {
        console.error("Sentence load error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadContent();
  }, [db, familyId]);

  const data = sentences[currentIndex];

  const handleCheck = () => {
    Keyboard.dismiss();
    setShowFeedback(true);
  };

  const handleResult = (success: boolean) => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setInputText('');
      setShowFeedback(false);
    } else {
      if (db && familyId && user) {
        db.runAsync(
          `INSERT OR REPLACE INTO progress (user_id, family_id, level, completed, score, last_accessed) 
           VALUES (?, ?, ?, 1, 100, ?)`,
          [user.id, familyId, levelId, new Date().toISOString()]
        ).catch(console.error);
      }
      navigation.goBack();
    }
  };

  if (loading) return (
    <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
      <ActivityIndicator size="large" color={moduleColor} />
      <Text style={{ color: identity.text.secondary, marginTop: 10 }}>{i18n.loading}</Text>
    </View>
  );

  if (!data) return (
    <View style={[styles.loadingContainer, { backgroundColor: identity.branding.surface }]}>
      <Text style={{ color: identity.text.primary }}>{i18n.empty}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: identity.branding.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        
        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={[styles.instructionLabel, { color: identity.text.secondary }]}>
            {i18n.instruction} ({currentIndex + 1}/{sentences.length})
          </Text>
          <Text style={[
            styles.phraseFr, 
            { 
              color: identity.text.primary, 
              lineHeight: tokens.fontSize.xxl * 1.3 
            }
          ]}>
            {data.phrase_fr}
          </Text>
        </View>

        {/* INPUT AREA */}
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.textInput,
              { 
                borderColor: showFeedback 
                  ? (inputText.toLowerCase().trim() === data.phrase_en.toLowerCase().trim() ? uiConfig.successColor : moduleColor) 
                  : withOpacity(identity.text.tertiary, 0.2),
                backgroundColor: identity.branding.surface,
                color: identity.text.primary,
                borderRadius: uiConfig.cardRadius,
                borderWidth: uiConfig.borderWidth,
              }
            ]}
            placeholder={i18n.placeholder}
            placeholderTextColor={identity.text.tertiary}
            multiline
            value={inputText}
            onChangeText={setInputText}
            editable={!showFeedback}
          />
        </View>

        {/* FEEDBACK SECTION */}
        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <View style={styles.correctionBlock}>
              <Text style={[styles.correctionLabel, { color: identity.text.secondary }]}>{i18n.correctAnswer}</Text>
              <Text style={[styles.correctionText, { color: moduleColor }]}>
                {data.phrase_en}
              </Text>
            </View>

            {/* Info Cards */}
            <View style={[styles.infoCard, { backgroundColor: withOpacity(moduleColor, 0.05), borderRadius: uiConfig.cardRadius }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color={uiConfig.warningColor} />
                <Text style={[styles.infoTitle, { color: identity.text.secondary }]}>{i18n.concretely}</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.text.primary, lineHeight: 24 }]}>{data.concretement}</Text>
            </View>

            <View style={[styles.infoCard, { backgroundColor: withOpacity(moduleColor, 0.05), borderRadius: uiConfig.cardRadius }]}>
              <View style={styles.infoHeader}>
                <MaterialCommunityIcons name="toy-brick" size={20} color={uiConfig.infoColor} />
                <Text style={[styles.infoTitle, { color: identity.text.secondary }]}>{i18n.structure}</Text>
              </View>
              <Text style={[styles.infoText, { color: identity.text.primary, lineHeight: 24 }]}>{data.build}</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* FOOTER ACTIONS */}
      <View style={[styles.footer, { 
        backgroundColor: identity.branding.surface, 
        borderTopColor: withOpacity(identity.text.tertiary, 0.1),
        paddingBottom: Platform.OS === 'ios' ? 40 : 20
      }]}>
        {!showFeedback ? (
          <TouchableOpacity
            style={[styles.mainButton, { backgroundColor: moduleColor, borderRadius: uiConfig.buttonRadius }]}
            onPress={handleCheck}
          >
            <Text style={styles.mainButtonText}>{i18n.showTranslation}</Text>
            <MaterialCommunityIcons name="eye" size={20} color="#FFF" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
        ) : (
          <View style={styles.decisionRow}>
            <TouchableOpacity
              style={[
                styles.decisionButton, 
                { borderRadius: uiConfig.buttonRadius, backgroundColor: withOpacity(identity.text.tertiary, 0.1), borderWidth: 1, borderColor: withOpacity(identity.text.tertiary, 0.2) }
              ]}
              onPress={() => handleResult(false)}
            >
              <MaterialCommunityIcons name="refresh" size={20} color={identity.text.secondary} />
              <Text style={[styles.retryButtonText, { color: identity.text.secondary }]}>{i18n.toReview}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.decisionButton, { backgroundColor: uiConfig.successColor, borderRadius: uiConfig.buttonRadius }]}
              onPress={() => handleResult(true)}
            >
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.successButtonText}>{i18n.gotIt}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: tokens.layout.screenPadding, paddingBottom: 150 },
  headerContainer: { marginBottom: tokens.layout.sectionGap },
  instructionLabel: { fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.bold, marginBottom: tokens.spacing.sm, letterSpacing: 1, textTransform: 'uppercase' },
  phraseFr: { fontSize: tokens.fontSize.xxl, fontWeight: tokens.fontWeight.semibold },
  inputContainer: { marginBottom: tokens.layout.sectionGap },
  textInput: { padding: tokens.spacing.md, fontSize: tokens.fontSize.lg, minHeight: 120, textAlignVertical: 'top' },
  feedbackContainer: { gap: tokens.spacing.md },
  correctionBlock: { marginBottom: tokens.spacing.sm },
  correctionLabel: { fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.bold, marginBottom: tokens.spacing.xs },
  correctionText: { fontSize: tokens.fontSize.xl, fontWeight: tokens.fontWeight.bold },
  infoCard: { padding: tokens.spacing.md, gap: tokens.spacing.sm },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: tokens.spacing.sm },
  infoTitle: { fontSize: tokens.fontSize.sm, fontWeight: tokens.fontWeight.bold },
  infoText: { fontSize: tokens.fontSize.md },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: tokens.layout.screenPadding, borderTopWidth: 1 },
  mainButton: { flexDirection: 'row', height: 56, alignItems: 'center', justifyContent: 'center', ...tokens.shadows.md },
  mainButtonText: { color: '#FFF', fontSize: tokens.fontSize.lg, fontWeight: tokens.fontWeight.bold },
  decisionRow: { flexDirection: 'row', gap: tokens.spacing.md },
  decisionButton: { flex: 1, height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: tokens.spacing.sm },
  retryButtonText: { fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.bold },
  successButtonText: { color: '#FFF', fontSize: tokens.fontSize.md, fontWeight: tokens.fontWeight.bold },
});

export default SentenceScreen;