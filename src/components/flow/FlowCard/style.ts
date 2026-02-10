/**
 * FlowCard Styles - 4 Card Moods White Label
 * bubbly (primary) | playful (college) | minimal (lycee) | executive (adult)
 */

import { StyleSheet, ViewStyle } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { tokens } from '@/themes/tokens';

type CardStyle = Identity['ui']['cardStyle'];

// ── Per-mood dimension configs ──
const getMoodDimensions = (cardStyle: CardStyle, cardRadius: number, isHorizontal: boolean) => {
  if (isHorizontal) {
    const radiusMap: Record<CardStyle, number> = { bubbly: 36, playful: 20, minimal: 16, executive: 16 };
    return {
      cardRadius: 16, iconSize: 72, cardPadding: tokens.spacing.lg,
      iconFontSize: 40, titleFontSize: tokens.fontSize.xl, iconRadius: radiusMap[cardStyle],
    };
  }

  switch (cardStyle) {
    case 'bubbly':
      return {
        cardRadius, iconSize: 56, cardPadding: tokens.spacing.lg,
        iconFontSize: 32, titleFontSize: tokens.fontSize.lg, iconRadius: 28, // circle
      };
    case 'playful':
      return {
        cardRadius, iconSize: 50, cardPadding: 14,
        iconFontSize: 28, titleFontSize: tokens.fontSize.md, iconRadius: 14, // rounded square
      };
    case 'minimal':
      return {
        cardRadius, iconSize: 44, cardPadding: tokens.spacing.md,
        iconFontSize: 24, titleFontSize: tokens.fontSize.md, iconRadius: 10,
      };
    case 'executive':
      return {
        cardRadius, iconSize: 44, cardPadding: tokens.spacing.md,
        iconFontSize: 24, titleFontSize: tokens.fontSize.md, iconRadius: 8, // sharp
      };
  }
};

// ── Per-mood layout logic ──
const getMoodLayout = (cardStyle: CardStyle, isHorizontal: boolean) => {
  const isCentered = cardStyle === 'bubbly' || cardStyle === 'playful';
  const isGridCentered = isCentered && !isHorizontal;

  const card: ViewStyle = isHorizontal
    ? { flexDirection: 'row', alignItems: 'center', marginHorizontal: tokens.spacing.md, marginBottom: tokens.spacing.lg, minHeight: 120 }
    : {
        aspectRatio: cardStyle === 'bubbly' ? 1 : undefined,
        justifyContent: isCentered ? 'center' : 'flex-start',
      };

  const icon: ViewStyle = {
    marginLeft: isHorizontal ? tokens.spacing.sm : 0,
    alignSelf: isGridCentered ? 'center' : 'auto',
    marginBottom: isGridCentered ? tokens.spacing.md : 0,
  };

  const text: ViewStyle = isHorizontal
    ? { marginLeft: tokens.spacing.lg, justifyContent: 'center' }
    : { marginLeft: isCentered ? 0 : tokens.spacing.sm, marginTop: isCentered ? 0 : tokens.spacing.xs };

  return { card, icon, text, isGridCentered };
};

// ── Shadow/border per mood ──
const getCardElevation = (cardStyle: CardStyle, isDark: boolean, isHorizontal: boolean): ViewStyle => {
  if (cardStyle === 'executive' && !isHorizontal) {
    return {
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
    };
  }
  return {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: isHorizontal ? 4 : 2 },
    shadowOpacity: isHorizontal ? 0.15 : 0.1,
    shadowRadius: isHorizontal ? 12 : 8,
    elevation: isHorizontal ? 6 : 3,
  };
};

export const createStyles = (
  identity: Identity,
  isHorizontal: boolean,
  cardColor: string
) => {
  const { cardStyle } = identity.ui;
  const dim = getMoodDimensions(cardStyle, identity.ui.cardRadius, isHorizontal);
  const layout = getMoodLayout(cardStyle, isHorizontal);

  const isDark = identity.themeMode === 'dark';
  const cardBg = isDark ? identity.palette.surface : '#FFFFFF';
  const lockedBg = isDark ? '#374151' : '#F3F4F6';

  return StyleSheet.create({
    wrapper: {
      flex: isHorizontal ? undefined : 1,
      padding: isHorizontal ? 0 : tokens.spacing.xs,
    },
    card: {
      backgroundColor: cardBg,
      borderRadius: dim.cardRadius,
      padding: dim.cardPadding,
      position: 'relative',
      overflow: 'hidden',
      ...getCardElevation(cardStyle, isDark, isHorizontal),
      ...layout.card,
    },
    cardLocked: { opacity: 0.5, backgroundColor: lockedBg },
    colorBar: {
      position: 'absolute', left: 0, top: 0, bottom: 0,
      width: isHorizontal ? 8 : 6, backgroundColor: cardColor,
      borderTopLeftRadius: dim.cardRadius, borderBottomLeftRadius: dim.cardRadius,
    },
    iconContainer: {
      width: dim.iconSize, height: dim.iconSize, borderRadius: dim.iconRadius,
      backgroundColor: cardColor, justifyContent: 'center', alignItems: 'center',
      elevation: isHorizontal ? 4 : 2,
      ...layout.icon,
    },
    iconText: {
      fontSize: dim.iconFontSize, textShadowColor: 'rgba(0, 0, 0, 0.15)',
      textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2,
    },
    textContainer: { flex: 1, ...layout.text },
    label: {
      fontSize: tokens.fontSize.xs, fontWeight: tokens.fontWeight.bold, color: cardColor,
      textTransform: 'uppercase', letterSpacing: 1, marginBottom: tokens.spacing.xs,
    },
    title: {
      fontSize: dim.titleFontSize, fontWeight: tokens.fontWeight.black,
      color: identity.text.primary,
      marginBottom: tokens.spacing.xs,
      textAlign: layout.isGridCentered ? 'center' : 'left',
    },
    subtitle: {
      fontSize: isHorizontal ? tokens.fontSize.sm : tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color: identity.text.secondary,
      lineHeight: isHorizontal ? 20 : 16,
      textAlign: layout.isGridCentered ? 'center' : 'left',
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
