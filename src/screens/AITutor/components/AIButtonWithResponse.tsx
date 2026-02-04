import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useTheme } from '@/themes/ThemeContext';
import { tokens, withOpacity } from '@/themes/tokens';

interface AIButtonWithResponseProps {
  buttonLabel: string;
  badgeLabel:  string;
  isLoading:   boolean;
  response:    string | null;
  onPress:     () => void;
}

const AIButtonWithResponse: React.FC<AIButtonWithResponseProps> = ({
  buttonLabel,
  badgeLabel,
  isLoading,
  response,
  onPress,
}) => {
  const { identity } = useTheme();
  const isPlayful = identity.ui.mood === 'playful';

  const styles = useMemo(() => StyleSheet.create({
    button: {
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             tokens.spacing.sm,
      paddingVertical: tokens.spacing.md,
      borderRadius:    isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: identity.palette.primary,
    },
    buttonText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.onPrimary,
    },
    responseCard: {
      padding:         tokens.spacing.lg,
      borderRadius:    isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      backgroundColor: withOpacity(identity.palette.primary, 0.05),
      borderWidth:     1,
      borderColor:     withOpacity(identity.palette.primary, 0.2),
      marginTop:       tokens.spacing.md,
    },
    responseBadge: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           tokens.spacing.xs,
      marginBottom:  tokens.spacing.sm,
    },
    responseBadgeText: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.palette.primary,
    },
    responseText: {
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.primary,
      lineHeight: tokens.fontSize.sm * 1.6,
    },
  }), [identity, isPlayful]);

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        disabled={isLoading}
        activeOpacity={0.8}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={identity.text.onPrimary} />
        ) : (
          <>
            <Text style={{ fontSize: 18 }}>🤖</Text>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </>
        )}
      </TouchableOpacity>

      {response && (
        <View style={styles.responseCard}>
          <View style={styles.responseBadge}>
            <Text>🤖</Text>
            <Text style={styles.responseBadgeText}>{badgeLabel}</Text>
          </View>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </>
  );
};

export default AIButtonWithResponse;
