/**
 * Styles pour AITutorSelectionScreen
 */

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
      flex:       1,
      fontSize:   tokens.fontSize.xl,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.onPrimary,
      textAlign:  isPlayful ? 'center' : 'left',
    },
    headerEmoji: {
      fontSize: tokens.emojiSize.md,
    },
    headerSubtitle: {
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color:      withOpacity(identity.text.onPrimary, 0.7),
      textAlign:  isPlayful ? 'center' : 'left',
    },

    // --- Content ---
    content: {
      flex:              1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.lg,
    },

    // --- Config Banner ---
    configBanner: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               tokens.spacing.sm,
      padding:           tokens.spacing.md,
      borderRadius:      isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor:   withOpacity(identity.palette.accent, 0.08),
      borderWidth:       1,
      borderColor:       withOpacity(identity.palette.accent, 0.25),
      marginBottom:      tokens.spacing.lg,
    },
    configBannerText: {
      flex:       1,
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.semibold,
      color:      identity.text.primary,
    },

    // --- Mode Card ---
    modeCard: {
      padding:         tokens.spacing.lg,
      borderRadius:    isPlayful ? tokens.borderRadius.xl : tokens.borderRadius.lg,
      backgroundColor: identity.palette.surface,
      borderWidth:     1,
      borderColor:     withOpacity(identity.palette.primary, 0.15),
      marginBottom:    tokens.spacing.lg,
    },
    modeCardHeader: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           tokens.spacing.md,
      marginBottom:  tokens.spacing.sm,
    },
    modeEmojiBg: {
      width:           52,
      height:          52,
      borderRadius:    isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: withOpacity(identity.palette.primary, 0.08),
      alignItems:      'center',
      justifyContent:  'center',
    },
    modeEmoji: {
      fontSize: tokens.emojiSize.lg,
    },
    modeCardTitles: {
      flex: 1,
    },
    modeTitle: {
      fontSize:   tokens.fontSize.lg,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.primary,
    },
    modeSubtitle: {
      fontSize:      tokens.fontSize.xs,
      fontWeight:    tokens.fontWeight.semibold,
      color:         identity.palette.primary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    modeDescription: {
      fontSize:     tokens.fontSize.sm,
      fontWeight:   tokens.fontWeight.medium,
      color:        identity.text.secondary,
      lineHeight:   tokens.fontSize.sm * 1.6,
      marginBottom: tokens.spacing.md,
    },

    // --- Feature Row (in card) ---
    featureRow: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           tokens.spacing.sm,
      marginBottom:  tokens.spacing.sm,
    },
    featureCheckSmall: {
      width:           20,
      height:          20,
      borderRadius:    tokens.borderRadius.round,
      backgroundColor: withOpacity(identity.palette.primary, 0.1),
      alignItems:      'center',
      justifyContent:  'center',
    },
    featureTextSmall: {
      flex:       1,
      fontSize:   tokens.fontSize.sm,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.primary,
    },

    // --- Mode Button ---
    modeButton: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            tokens.spacing.sm,
      paddingVertical: tokens.spacing.md,
      marginTop:      tokens.spacing.md,
      borderRadius:   isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
      backgroundColor: identity.palette.primary,
    },
    modeButtonText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.bold,
      color:      identity.text.onPrimary,
    },
  });
