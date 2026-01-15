import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight } from '@/themes/tokens';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60, // Pour passer sous la barre de statut
    paddingBottom: spacing.xl,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'column', // ✅ Vertical layout (Apple style)
    alignItems: 'flex-start',
  },
  textSection: {
    flex: 1,
    width: '100%',
  },
  // ✅ NO-MEDIA PREMIUM: Typographie sobre et élégante
  greeting: {
    fontSize: fontSize.sm, // ✅ Petit et discret (13px)
    fontWeight: fontWeight.medium as any,
    letterSpacing: 0.5,
    opacity: 0.9, // ✅ Légèrement transparent
    marginBottom: spacing.xs, // ✅ 4px
    textTransform: 'uppercase' as any, // ✅ Petites capitales
  },
  userName: {
    fontSize: fontSize.xxxl + 4, // ✅ Grand et imposant (40px)
    fontWeight: fontWeight.black as any,
    letterSpacing: -1, // ✅ Tighter spacing (Apple style)
    lineHeight: fontSize.xxxl + 8, // ✅ 44px line height
  },
});