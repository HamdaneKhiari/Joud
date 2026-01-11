import { StyleSheet } from 'react-native';
import { tokens } from '@/themes/tokens';

export const styles = StyleSheet.create({
  card: {
    marginHorizontal: tokens.spacing.xl, // 20px
    marginVertical: tokens.spacing.md,
    padding: tokens.spacing.xl,
    overflow: 'hidden',
    position: 'relative',
    // Les ombres et le reste sont fixes
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: tokens.spacing.lg,
    zIndex: 2,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: tokens.spacing.md,
  },
  exerciseIcon: {
    fontSize: 40,
  },
  exerciseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  // Style pour les boîtes de mots (Daily Word)
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacing.md,
  },
  wordBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: tokens.spacing.md,
    alignItems: 'center',
    minHeight: 70,
    justifyContent: 'center',
  },
  wordText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#2C3E50',
  },
  // Bouton CTA commun
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: tokens.spacing.md,
  },
  buttonText: {
    fontWeight: '800',
    color: '#2C3E50',
  }
});