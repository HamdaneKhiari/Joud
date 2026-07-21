// Premier lancement : prénom uniquement. L'audience par défaut est 'college', modifiable dans les paramètres.
import { log } from '@/utils/logUtils';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useUser } from '@/contexts/UserContext';
import { baseColors } from '@/themes/colors';

const OnboardingScreen: React.FC = () => {
  const router = useRouter();
  const { updateUser } = useUser();

  const [firstName, setFirstName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!firstName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updateUser({ firstName: firstName.trim() });
      setTimeout(() => {
        router.replace('/');
      }, 100);
    } catch (e) {
      log.error('[Onboarding] Error:', e);
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.stepContainer}>
            <View style={styles.emojiContainer}>
              <Text style={styles.bigEmoji}>👋</Text>
            </View>

            <Text style={styles.title}>Bienvenue sur Joud !</Text>
            <Text style={styles.subtitle}>Comment tu t'appelles ?</Text>

            <TextInput
              style={styles.nameInput}
              placeholder="Ton prénom..."
              placeholderTextColor={baseColors.gray400}
              value={firstName}
              onChangeText={setFirstName}
              autoFocus
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              autoCapitalize="words"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.primaryButton, !firstName.trim() && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={!firstName.trim() || isSubmitting}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? 'Chargement...' : "C'est parti !"}
              </Text>
              {!isSubmitting && <MaterialCommunityIcons name="rocket-launch" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
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
});

export default OnboardingScreen;
