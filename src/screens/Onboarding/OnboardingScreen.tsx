/**
 * ============================================
 * ONBOARDING SCREEN
 * Premier lancement : prenom + choix audience
 * ============================================
 */

import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { baseColors } from '@/themes/colors';

// ============================================
// TYPES
// ============================================

type Audience = 'primary' | 'college' | 'lycee' | 'adult';

interface AudienceOption {
  id: Audience;
  label: string;
  description: string;
  icon: string;
  color: string;
}

// ============================================
// CONSTANTES
// ============================================

const AUDIENCES: AudienceOption[] = [
  {
    id: 'primary',
    label: 'Primaire',
    description: 'CE1 - CM2',
    icon: 'star-face',
    color: '#FF6B6B',
  },
  {
    id: 'college',
    label: 'College',
    description: '6e - 3e',
    icon: 'school',
    color: '#34495E',
  },
  {
    id: 'lycee',
    label: 'Lycee',
    description: '2nde - Terminale',
    icon: 'book-open-variant',
    color: '#2ECC71',
  },
  {
    id: 'adult',
    label: 'Adulte',
    description: 'Formation continue',
    icon: 'briefcase',
    color: '#8E44AD',
  },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ============================================
// COMPOSANT
// ============================================

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { updateUser } = useUser();

  // State
  const [step, setStep] = useState<'name' | 'audience'>('name');
  const [firstName, setFirstName] = useState('');
  const [selectedAudience, setSelectedAudience] = useState<Audience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateTransition = (callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: -50, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      callback();
      slideAnim.setValue(50);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
      ]).start();
    });
  };

  // Handlers
  const handleNameSubmit = () => {
    if (!firstName.trim()) return;
    animateTransition(() => setStep('audience'));
  };

  const handleAudienceSelect = (audience: Audience) => {
    setSelectedAudience(audience);
  };

  const handleFinish = async () => {
    if (!selectedAudience || !firstName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateUser({
        firstName: firstName.trim(),
        audience: selectedAudience,
      });

      // Petit delay pour laisser le context se mettre a jour
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (e) {
      console.error('[Onboarding] Error:', e);
      setIsSubmitting(false);
    }
  };

  // =================== RENDER STEP 1: NAME ===================

  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.emojiContainer}>
        <Text style={styles.bigEmoji}>👋</Text>
      </View>

      <Text style={styles.title}>Bienvenue sur Joud !</Text>
      <Text style={styles.subtitle}>Comment tu t'appelles ?</Text>

      <TextInput
        style={styles.nameInput}
        placeholder="Ton prenom..."
        placeholderTextColor={baseColors.gray400}
        value={firstName}
        onChangeText={setFirstName}
        autoFocus
        maxLength={30}
        returnKeyType="next"
        onSubmitEditing={handleNameSubmit}
        autoCapitalize="words"
        autoCorrect={false}
      />

      <TouchableOpacity
        style={[styles.primaryButton, !firstName.trim() && styles.buttonDisabled]}
        onPress={handleNameSubmit}
        disabled={!firstName.trim()}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>Continuer</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

  // =================== RENDER STEP 2: AUDIENCE ===================

  const renderAudienceStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.emojiContainer}>
        <Text style={styles.bigEmoji}>🎯</Text>
      </View>

      <Text style={styles.title}>Salut {firstName} !</Text>
      <Text style={styles.subtitle}>Quel est ton niveau ?</Text>

      <View style={styles.audienceGrid}>
        {AUDIENCES.map((aud) => {
          const isSelected = selectedAudience === aud.id;

          return (
            <TouchableOpacity
              key={aud.id}
              style={[
                styles.audienceCard,
                isSelected && { borderColor: aud.color, borderWidth: 2.5, backgroundColor: aud.color + '10' },
              ]}
              onPress={() => handleAudienceSelect(aud.id)}
              activeOpacity={0.7}
            >
              <View style={[styles.audienceIcon, { backgroundColor: aud.color + '15' }]}>
                <MaterialCommunityIcons name={aud.icon as any} size={28} color={aud.color} />
              </View>
              <Text style={[styles.audienceLabel, isSelected && { color: aud.color }]}>
                {aud.label}
              </Text>
              <Text style={styles.audienceDesc}>{aud.description}</Text>

              {isSelected && (
                <View style={[styles.checkBadge, { backgroundColor: aud.color }]}>
                  <MaterialCommunityIcons name="check" size={14} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[
          styles.primaryButton,
          !selectedAudience && styles.buttonDisabled,
          selectedAudience && { backgroundColor: AUDIENCES.find(a => a.id === selectedAudience)?.color },
        ]}
        onPress={handleFinish}
        disabled={!selectedAudience || isSubmitting}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryButtonText}>
          {isSubmitting ? 'Chargement...' : "C'est parti !"}
        </Text>
        {!isSubmitting && <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />}
      </TouchableOpacity>
    </View>
  );

  // =================== RENDER ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Progress indicator */}
        <View style={styles.progressBar}>
          <View style={[styles.progressDot, step === 'name' && styles.progressDotActive]} />
          <View style={[styles.progressLine, step === 'audience' && styles.progressLineActive]} />
          <View style={[styles.progressDot, step === 'audience' && styles.progressDotActive]} />
        </View>

        <Animated.View
          style={[
            styles.content,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          {step === 'name' ? renderNameStep() : renderAudienceStep()}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  keyboardView: {
    flex: 1,
  },

  // Progress
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    gap: 4,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: baseColors.gray300,
  },
  progressDotActive: {
    backgroundColor: baseColors.blue500,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    width: 40,
    height: 3,
    backgroundColor: baseColors.gray200,
    borderRadius: 2,
  },
  progressLineActive: {
    backgroundColor: baseColors.blue500,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },

  // Emoji
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: baseColors.blue50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  bigEmoji: {
    fontSize: 40,
  },

  // Text
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: baseColors.gray800,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: '500',
    color: baseColors.gray500,
    textAlign: 'center',
    marginBottom: 32,
  },

  // Name Input
  nameInput: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: baseColors.gray200,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '500',
    color: baseColors.gray800,
    backgroundColor: '#FFF',
    marginBottom: 24,
    textAlign: 'center',
  },

  // Primary Button
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: baseColors.blue500,
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
  },

  // Audience Grid
  audienceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
    width: '100%',
  },
  audienceCard: {
    width: (SCREEN_WIDTH - 72) / 2,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: baseColors.gray200,
    position: 'relative',
  },
  audienceIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  audienceLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: baseColors.gray800,
    marginBottom: 4,
  },
  audienceDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: baseColors.gray400,
  },
  checkBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default OnboardingScreen;
