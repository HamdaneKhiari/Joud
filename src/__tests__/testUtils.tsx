/**
 * Test utilities — renderWithProviders
 *
 * Fournit un wrapper React avec tous les contextes mockés.
 * Usage :
 *   const { getByText } = renderWithProviders(<MonComposant />);
 *   renderWithProviders(<MonComposant />, { user: { audience: 'primary' } });
 */

import React from 'react';
import { render, RenderOptions } from '@testing-library/react-native';
import { tokens } from '@/themes/tokens';
export { tokens as mockTokens } from '@/themes/tokens';

// ============================================
// Valeurs par défaut des mocks de contextes
// ============================================

export const mockUser = {
  id: 'user_01',
  firstName: 'Test',
  audience: 'college' as const,
  isOnboarded: true,
};

export const mockIdentity = {
  id: 'college',
  themeMode: 'light' as const,
  organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful' as const, cardStyle: 'playful' as const },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: 'Tuteur IA', subtitle: 'Aide aux devoirs' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
  dashboard: { levelProgress: '#34495E' },
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school' },
  iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
    title: 'System',
  },
};

export const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 1, changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  closeAsync: jest.fn().mockResolvedValue(undefined),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
};

export const mockProgress = {};

// ============================================
// Mocks de contextes (appliqués globalement dans les tests)
// ============================================

/**
 * Configure jest.mock() pour tous les contextes avec des valeurs cohérentes.
 * À appeler UNE FOIS en haut du fichier de test.
 *
 * @example
 * mockAllContexts();
 * // ou avec override :
 * mockAllContexts({ userOverride: { audience: 'primary' } });
 */
export function mockAllContexts(overrides: {
  userOverride?: Partial<typeof mockUser>;
  identityOverride?: Partial<typeof mockIdentity>;
} = {}) {
  const user = { ...mockUser, ...overrides.userOverride };
  const identity = { ...mockIdentity, ...overrides.identityOverride };

  jest.mock('@/contexts/UserContext', () => ({
    useUser: jest.fn().mockReturnValue({
      db: mockDb,
      user,
      loading: false,
      isOnboarded: true,
      updateAudience: jest.fn(),
      updateUser: jest.fn(),
    }),
  }));

  jest.mock('@/themes/ThemeContext', () => ({
    useTheme: jest.fn().mockReturnValue({ identity, tokens }),
  }));

  jest.mock('@/contexts/ProgressContext', () => ({
    useProgress: jest.fn().mockReturnValue({
      progress: mockProgress,
      getLevelProgress: jest.fn().mockReturnValue(0),
      refreshProgress: jest.fn(),
      saveProgressNow: jest.fn().mockResolvedValue(undefined),
      trackItem: jest.fn(),
      getRevisionFamilies: jest.fn().mockReturnValue([]),
      resetProgress: jest.fn(),
    }),
  }));

  jest.mock('@/contexts/CurrentLevelContext', () => ({
    useCurrentLevel: jest.fn().mockReturnValue({
      currentLevel: 1,
      setCurrentLevel: jest.fn(),
    }),
  }));

  jest.mock('@/contexts/AIContext', () => ({
    useAI: jest.fn().mockReturnValue({
      messages: [],
      isTyping: false,
      sendMessage: jest.fn(),
      clearMessages: jest.fn(),
    }),
  }));
}

// ============================================
// renderWithProviders
// ============================================

/**
 * Wrapper léger — les contextes étant mockés via jest.mock(),
 * aucun Provider réel n'est nécessaire ici.
 * Ce wrapper reste utile pour les options RNTL (accessibilité, etc.)
 */
export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, options);
}
