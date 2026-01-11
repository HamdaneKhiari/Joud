import { StyleSheet } from 'react-native';
import { spacing, fontSize, fontWeight } from '@/themes/tokens';

export const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: 60, // Pour passer sous la barre de statut
    paddingBottom: spacing.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  textSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold as any,
    letterSpacing: -0.5,
  },
  userName: {
    fontWeight: fontWeight.black as any,
  },
});