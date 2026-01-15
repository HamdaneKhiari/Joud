/**
 * ============================================
 * RevisionScreen - Écran de révision
 * Placeholder pour révisions espacées (spaced repetition)
 * ============================================
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

const RevisionScreen = () => {
  const router = useRouter();
  const { identity } = useTheme();

  return (
    <View style={{
      flex: 1,
      backgroundColor: identity.branding.surface || '#FFFFFF',
      justifyContent: 'center',
      alignItems: 'center',
      padding: tokens.spacing.xl
    }}>
      <Text style={{
        fontSize: tokens.fontSize.xxl,
        fontWeight: tokens.fontWeight.bold,
        color: identity.text.primary,
        marginBottom: tokens.spacing.md
      }}>
        Révisions
      </Text>
      <Text style={{
        fontSize: tokens.fontSize.base,
        color: identity.text.secondary,
        textAlign: 'center',
        marginBottom: tokens.spacing.xl
      }}>
        Système de révision espacée à venir
      </Text>
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          backgroundColor: identity.branding.main,
          paddingHorizontal: tokens.spacing.xl,
          paddingVertical: tokens.spacing.md,
          borderRadius: tokens.borderRadius.md
        }}
      >
        <Text style={{
          color: identity.text.onMain,
          fontWeight: tokens.fontWeight.bold
        }}>
          Retour
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RevisionScreen;
