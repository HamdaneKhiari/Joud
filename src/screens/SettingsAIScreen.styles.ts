import { StyleSheet } from 'react-native';
import { tokens, withOpacity } from '@/themes/tokens';
import type { ThemeIdentity } from '@/themes/types';

export const createStyles = (identity: ThemeIdentity, isPlayful: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: identity.palette.background,
    },

    // --- Header ---
    header: {
      backgroundColor:   identity.palette.primary,
      paddingTop:        tokens.spacing.md,
      paddingBottom:     tokens.spacing.xl,
      paddingHorizontal: tokens.spacing.xl,
    },
    headerTopRow: {
      flexDirection: 'row',
      alignItems:    'center',
      marginBottom:  tokens.spacing.sm,
    },
    headerTitle: {
      flex:        1,
      fontSize:    tokens.fontSize.xl,
      fontWeight:  tokens.fontWeight.bold,
      color:       identity.text.onPrimary,
      textAlign:   isPlayful ? 'center' : 'left',
      marginLeft:  tokens.spacing.md,
    },
    headerSubtitle: {
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color:      withOpacity(identity.text.onPrimary, 0.8),
      textAlign:  isPlayful ? 'center' : 'left',
    },

    // --- Content ---
    content: {
      flex:              1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.lg,
    },

    // --- Section ---
    section: {
      marginBottom: tokens.spacing.xl,
    },
    sectionTitle: {
      fontSize:      tokens.fontSize.base,
      fontWeight:    tokens.fontWeight.bold,
      color:         identity.text.primary,
      marginBottom:  tokens.spacing.md,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },

    // --- Provider Chips ---
    providerChips: {
      flexDirection: 'row',
      flexWrap:      'wrap',
      gap:           tokens.spacing.sm,
    },
    providerChip: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               tokens.spacing.xs,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical:   tokens.spacing.sm,
      borderRadius:      tokens.borderRadius.round,
      backgroundColor:   identity.palette.surface,
      borderWidth:       2,
      borderColor:       withOpacity(identity.palette.primary, 0.2),
    },
    providerChipActive: {
      backgroundColor: withOpacity(identity.palette.primary, 0.1),
      borderColor:     identity.palette.primary,
    },
    providerChipText: {
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      color:      identity.text.secondary,
    },
    providerChipTextActive: {
      color: identity.palette.primary,
    },

    // --- Input ---
    label: {
      fontSize:     tokens.fontSize.sm,
      fontWeight:   tokens.fontWeight.semibold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.xs,
    },
    input: {
      paddingHorizontal: tokens.spacing.md,
      paddingVertical:   tokens.spacing.md,
      borderRadius:      tokens.borderRadius.md,
      borderWidth:       1,
      borderColor:       withOpacity(identity.palette.primary, 0.3),
      backgroundColor:   identity.palette.surface,
      fontSize:          tokens.fontSize.base,
      color:             identity.text.primary,
    },
    inputSecure: {
      fontFamily:    'monospace',
      letterSpacing: 2,
    },

    // --- Info Box ---
    infoBox: {
      flexDirection: 'row',
      gap:           tokens.spacing.sm,
      padding:       tokens.spacing.md,
      borderRadius:  tokens.borderRadius.md,
      borderWidth:   1,
      marginTop:     tokens.spacing.sm,
    },
    infoText: {
      flex:       1,
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.fontSize.xs * 1.6,
    },

    // --- Save Button ---
    saveButton: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            tokens.spacing.sm,
      paddingVertical: tokens.spacing.md,
      borderRadius:   isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: identity.palette.primary,
      marginTop:      tokens.spacing.lg,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.onPrimary,
    },

    // --- Loading ---
    loadingContainer: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
    },
  });
