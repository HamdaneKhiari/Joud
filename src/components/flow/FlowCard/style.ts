/**
 * FlowCard Styles - Machine de guerre White Label
 * Correction FINALE SonarLint : Complexité < 15
 */

import { StyleSheet, ViewStyle } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

// 1. CONFIGURATION DES DIMENSIONS
const getDimensions = (isPlayful: boolean, isHorizontal: boolean) => {
  if (isHorizontal) {
    return {
      cardRadius: 16, iconSize: 72, cardPadding: tokens.spacing.lg,
      iconFontSize: 40, titleFontSize: tokens.fontSize.xl, iconRadius: isPlayful ? 36 : 16,
    };
  }
  const size = isPlayful ? 56 : 48;
  return {
    cardRadius: isPlayful ? 24 : 12, iconSize: size,
    cardPadding: isPlayful ? tokens.spacing.lg : tokens.spacing.md,
    iconFontSize: isPlayful ? 32 : 28, titleFontSize: isPlayful ? tokens.fontSize.lg : tokens.fontSize.md,
    iconRadius: isPlayful ? size / 2 : 12,
  };
};

// 2. EXTRACTION DES BLOCS DE STYLE POUR StyleSheet
const getComponentStyles = (isHorizontal: boolean, isPlayful: boolean, dim: any) => {
  const isGridPlayful = isPlayful && !isHorizontal;

  const card: ViewStyle = isHorizontal 
    ? { flexDirection: 'row', alignItems: 'center', marginHorizontal: tokens.spacing.md, marginBottom: tokens.spacing.lg, minHeight: 120 }
    : { aspectRatio: isPlayful ? 1 : undefined, justifyContent: isPlayful ? 'center' : 'flex-start' };

  const icon: ViewStyle = {
    marginLeft: isHorizontal ? tokens.spacing.sm : 0,
    alignSelf: isGridPlayful ? 'center' : 'auto',
    marginBottom: isGridPlayful ? tokens.spacing.md : 0,
  };

  const text: ViewStyle = isHorizontal
    ? { marginLeft: tokens.spacing.lg, justifyContent: 'center' }
    : { marginLeft: isPlayful ? 0 : tokens.spacing.sm, marginTop: isPlayful ? 0 : tokens.spacing.xs };

  return { card, icon, text, isGridPlayful };
};

export const createStyles = (
  identity: Identity,
  isPlayful: boolean,
  isHorizontal: boolean,
  cardColor: string
) => {
  const dim = getDimensions(isPlayful, isHorizontal);
  const comp = getComponentStyles(isHorizontal, isPlayful, dim);

  return StyleSheet.create({
    wrapper: {
      flex: isHorizontal ? undefined : 1,
      padding: isHorizontal ? 0 : tokens.spacing.xs,
    },
    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: dim.cardRadius,
      padding: dim.cardPadding,
      position: 'relative',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: isHorizontal ? 4 : 2 },
      shadowOpacity: isHorizontal ? 0.15 : 0.1,
      shadowRadius: isHorizontal ? 12 : 8,
      elevation: isHorizontal ? 6 : 3,
      ...comp.card,
    },
    cardLocked: { opacity: 0.5, backgroundColor: '#F3F4F6' },
    colorBar: {
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: isHorizontal ? 8 : 6, backgroundColor: cardColor,
      borderTopLeftRadius: dim.cardRadius, borderBottomLeftRadius: dim.cardRadius,
    },
    iconContainer: {
      width: dim.iconSize, height: dim.iconSize, borderRadius: dim.iconRadius,
      backgroundColor: cardColor, justifyContent: 'center', alignItems: 'center',
      elevation: isHorizontal ? 4 : 2,
      ...comp.icon,
    },
    iconText: {
      fontSize: dim.iconFontSize, textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    },
    textContainer: { flex: 1, ...comp.text },
    label: {
      fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.bold, color: cardColor,
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: tokens.spacing.xs,
    },
    title: {
      fontSize: dim.titleFontSize, fontWeight: tokens.fontWeight.black, color: '#1F2937',
      marginBottom: tokens.spacing.xs, textAlign: comp.isGridPlayful ? 'center' : 'left',
    },
    subtitle: {
      fontSize: isHorizontal ? tokens.fontSize.sm : tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium, color: '#6B7280', lineHeight: isHorizontal ? 20 : 16,
      textAlign: comp.isGridPlayful ? 'center' : 'left',
      marginBottom: isHorizontal ? tokens.spacing.sm : 0,
    },
    badge: {
      position: 'absolute', top: tokens.spacing.sm, right: tokens.spacing.sm,
      paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, zIndex: 10, elevation: 4,
    },
    badgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
    percentageBadge: {
      position: 'absolute', bottom: tokens.spacing.sm, right: tokens.spacing.sm,
      paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, borderWidth: 0.5, borderColor: 'rgba(0,0,0,0.05)',
    },
    percentageText: { fontSize: 10, fontWeight: '900', textAlign: 'center' },
    chevron: { marginLeft: tokens.spacing.sm, opacity: 0.6 },
  });
};