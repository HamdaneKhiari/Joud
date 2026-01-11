// ============================================
// FICHIER: src/screens/Dashboard/components/NamePromptModal.js
// ✅ VERSION 1.0 - Modal de saisie de prénom au premier lancement
// ============================================

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import { collegePalette } from '../../../themes/collegeTheme';
import {
  spacing,
  fontSize,
  fontWeight,
  collegeBorderRadius,
  borderWidth as borderWidths,
  collegeShadows
} from '../../../themes/tokens';

const NamePromptModal = ({ visible, onSave }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmedName = name.trim();
    if (trimmedName.length > 0) {
      onSave(trimmedName);
      setName(''); // Reset pour la prochaine fois
    }
  };

  const isButtonDisabled = name.trim().length === 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <Pressable style={styles.overlayPressable} onPress={() => {}}>
          <View style={styles.modalContainer}>
            {/* Emoji */}
            <Text style={styles.emoji}>🚀</Text>

            {/* Titre */}
            <Text style={styles.title}>Ready for a mission?</Text>

            {/* Sous-titre */}
            <Text style={styles.subtitle}>Comment doit-on t'appeler ?</Text>

            {/* Input */}
            <TextInput
              style={styles.input}
              placeholder="Ton prénom..."
              placeholderTextColor={collegePalette.textTertiary}
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleSave}
            />

            {/* Bouton */}
            <TouchableOpacity
              style={[
                styles.button,
                isButtonDisabled && styles.buttonDisabled,
              ]}
              onPress={handleSave}
              disabled={isButtonDisabled}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>C'est parti !</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

NamePromptModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onSave: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44, 62, 80, 0.85)', // Bleu nuit transparent
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayPressable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  modalContainer: {
    backgroundColor: collegePalette.surface,
    borderRadius: collegeBorderRadius.xl,
    padding: spacing.xxxl,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    ...collegeShadows.elevated,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: collegePalette.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.regular,
    color: collegePalette.textSecondary,
    marginBottom: spacing.xxl,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: collegePalette.backgroundDark,
    borderRadius: collegeBorderRadius.md,
    borderWidth: borderWidths.thin,
    borderColor: collegePalette.borderLight,
    paddingHorizontal: spacing.lg,
    fontSize: fontSize.base,
    color: collegePalette.textPrimary,
    marginBottom: spacing.xl,
  },
  button: {
    width: '100%',
    height: 52,
    backgroundColor: collegePalette.accent,
    borderRadius: collegeBorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...collegeShadows.button,
  },
  buttonDisabled: {
    backgroundColor: collegePalette.textTertiary,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: collegePalette.textWhite,
  },
});

export default NamePromptModal;
