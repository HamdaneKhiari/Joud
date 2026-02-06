/**
 * Composant OnboardingView - Vue d'onboarding quand IA non configurée
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { tokens } from '@/themes/tokens';
import { ONBOARDING_FEATURES } from '../AITutorSelectionScreen.config';
import { FeatureItem } from './FeatureItem';

interface OnboardingViewProps {
  styles: any;
  identity: any;
  onConfigure: () => void;
  onSkip: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  styles,
  identity,
  onConfigure,
  onSkip,
}) => {
  return (
    <View style={styles.onboardingContainer}>
      <Text style={styles.onboardingEmoji}>🤖✨</Text>

      {/* Badge Optionnel */}
      <View style={styles.optionalBadge}>
        <Ionicons name="sparkles" size={14} color={identity.palette.accent} />
        <Text style={styles.optionalBadgeText}>Fonctionnalité Optionnelle</Text>
      </View>

      <Text style={styles.onboardingTitle}>Coach IA Personnel</Text>
      <Text style={styles.onboardingSubtitle}>
        Débloque un coach IA qui analyse tes erreurs et te donne des conseils personnalisés.{'\n'}
        <Text style={{ fontWeight: tokens.fontWeight.bold }}>
          Tu peux utiliser toute l'app sans cette fonctionnalité !
        </Text>
      </Text>

      {/* Features */}
      <View style={styles.featuresList}>
        {ONBOARDING_FEATURES.map((feature, index) => (
          <FeatureItem
            key={index}
            text={feature}
            containerStyle={styles.featureItem}
            checkStyle={styles.featureCheck}
            textStyle={styles.featureText}
            checkColor={identity.palette.primary}
          />
        ))}
      </View>

      {/* CTA Primary */}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onConfigure}
        activeOpacity={0.8}
      >
        <Ionicons name="settings" size={20} color={identity.text.onPrimary} />
        <Text style={styles.primaryButtonText}>Configurer mon IA</Text>
      </TouchableOpacity>

      {/* CTA Secondary */}
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={onSkip}
        activeOpacity={0.7}
      >
        <Text style={styles.secondaryButtonText}>Peut-être plus tard</Text>
      </TouchableOpacity>
    </View>
  );
};
