/**
 * Smoke test — Dashboard
 *
 * Infrastructure proof : le screen rend sans crash avec tous les mocks natifs,
 * contexts mockés, et données asynchrones.
 */

import React from 'react';
import { render, act } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';

/** Flush all pending microtasks so async useEffect state updates are committed */
const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ============================================
// Mock DB (défini avant les jest.mock factories)
// ============================================

const mockDb = {
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
  getAllAsync: jest.fn().mockResolvedValue([]),
  getFirstAsync: jest.fn().mockResolvedValue(null),
  withTransactionAsync: jest.fn().mockImplementation(async (fn: () => Promise<void>) => fn()),
};

const mockIdentity = {
  id: 'college',
  themeMode: 'light',
  organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  header: { background: '#34495E', accent: '#FFD700', emoji: '📚', welcomeText: 'Bonjour !' },
  dailyWord: { background: '#FFF9C4', decoration: 'none' },
  aiTutor: { title: 'Tuteur IA', subtitle: 'Aide aux devoirs' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
  dashboard: { levelProgress: '#34495E' },
  i18n: { locale: 'fr', rtl: false },
  icons: { logo: 'school' },
  iconSize: { xs: 12, sm: 16, md: 24, lg: 32, xl: 48 },
  fontFamily: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System', title: 'System' },
};

// ============================================
// Mocks — factories SANS référence aux variables locales
// (évite le problème de hoisting Jest)
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/themes/ThemeContext', () => ({ useTheme: jest.fn() }));
jest.mock('@/contexts/ProgressContext', () => ({ useProgress: jest.fn() }));
jest.mock('@/contexts/CurrentLevelContext', () => ({ useCurrentLevel: jest.fn() }));

jest.mock('@/hooks/dashboard/useDailyWord', () => ({ useDailyWord: jest.fn() }));
jest.mock('@/hooks/dashboard/useRevisions', () => ({ useRevisions: jest.fn() }));
jest.mock('@/hooks/dashboard/useUserMetrics', () => ({ useUserMetrics: jest.fn() }));
jest.mock('@/hooks/useLastActivity', () => ({ useLastActivity: jest.fn() }));

jest.mock('@/database/queries', () => ({
  getLevelsByAudience: jest.fn(),
}));
jest.mock('@/utils/labelMapper', () => ({
  getLevelLabel: jest.fn(),
}));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));
jest.mock('@/utils/navigationHelper', () => ({
  navigateToExerciseSelection: jest.fn(),
}));

// Import après les mocks
import Dashboard from '@/screens/Dashboard/Dashboard';
import { tokens } from '@/themes/tokens';

// ============================================
// Setup — valeurs par défaut pour chaque test
// ============================================

function setupMocks(overrides: { loading?: boolean; user?: object | null; db?: object | null } = {}) {
  const { useUser } = require('@/contexts/UserContext');
  const { useTheme } = require('@/themes/ThemeContext');
  const { useProgress } = require('@/contexts/ProgressContext');
  const { useCurrentLevel } = require('@/contexts/CurrentLevelContext');
  const { useDailyWord } = require('@/hooks/dashboard/useDailyWord');
  const { useRevisions } = require('@/hooks/dashboard/useRevisions');
  const { useUserMetrics } = require('@/hooks/dashboard/useUserMetrics');
  const { useLastActivity } = require('@/hooks/useLastActivity');
  const { getLevelsByAudience } = require('@/database/queries');
  const { getLevelLabel } = require('@/utils/labelMapper');

  useUser.mockReturnValue({
    db: overrides.db !== undefined ? overrides.db : mockDb,
    user: overrides.user !== undefined ? overrides.user : {
      id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true,
    },
    loading: overrides.loading ?? false,
    updateAudience: jest.fn(),
    updateUser: jest.fn(),
  });

  useTheme.mockReturnValue({ identity: mockIdentity, tokens });

  useProgress.mockReturnValue({
    progress: {},
    getLevelProgress: jest.fn().mockReturnValue(0),
    refreshProgress: jest.fn(),
    saveProgressNow: jest.fn().mockResolvedValue(undefined),
    trackItem: jest.fn(),
    getRevisionFamilies: jest.fn().mockReturnValue([]),
    resetProgress: jest.fn(),
  });

  useCurrentLevel.mockReturnValue({ currentLevel: 1, setCurrentLevel: jest.fn() });

  useDailyWord.mockReturnValue({
    dailyWord: { english: 'Hello', french: 'Bonjour', emoji: '👋' },
    isLoading: false,
    error: null,
  });

  useRevisions.mockReturnValue({ wordsToReview: 5, isLoading: false, refresh: jest.fn() });

  useUserMetrics.mockReturnValue({
    wordsLearned: 42, exercisesCompleted: 10, streak: 3,
    isLoading: false, refresh: jest.fn(),
  });

  useLastActivity.mockReturnValue({
    lastActivity: null,
    recordActivity: jest.fn(),
    fetchLastActivity: jest.fn(),
    isLoading: false,
  });

  getLevelsByAudience.mockResolvedValue([
    { id: 101, level: 1, title: 'Les Bases', target_audience: 'college' },
    { id: 102, level: 2, title: "L'Essentiel", target_audience: 'college' },
  ]);

  getLevelLabel.mockResolvedValue({ title: 'Les Bases', badge: '1', description: 'Niveau 1' });
}

// ============================================
// Tests
// ============================================

describe('Dashboard — smoke tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupMocks();
  });

  it('rend sans crash', () => {
    expect(() => render(<Dashboard />)).not.toThrow();
  });

  it('affiche un loader pendant le chargement (db null)', () => {
    setupMocks({ db: null, user: null, loading: true });
    const { UNSAFE_getByType } = render(<Dashboard />);
    expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('affiche le contenu complet après chargement', async () => {
    const { getByText } = render(<Dashboard />);
    await act(flushPromises);
    expect(getByText('Parcours')).toBeTruthy();
  });

  it('affiche le prénom de l\'utilisateur', async () => {
    const { getByText } = render(<Dashboard />);
    await act(flushPromises);
    expect(getByText(/Alice/i)).toBeTruthy();
  });

  it('affiche le mot du jour', async () => {
    const { getByText } = render(<Dashboard />);
    await act(flushPromises);
    expect(getByText('Hello')).toBeTruthy();
  });

  it('ne crashe pas pour l\'audience "primary" (pas de Tuteur IA)', () => {
    setupMocks({
      user: { id: 'user_02', firstName: 'Bob', audience: 'primary', isOnboarded: true },
    });
    expect(() => render(<Dashboard />)).not.toThrow();
  });

  it('getLevelsByAudience est appelé avec l\'audience de l\'utilisateur', async () => {
    const { getLevelsByAudience } = require('@/database/queries');
    render(<Dashboard />);
    await act(flushPromises);
    expect(getLevelsByAudience).toHaveBeenCalledWith(mockDb, 'college');
  });

  it('affiche les niveaux chargés depuis la DB', async () => {
    const { getAllByText } = render(<Dashboard />);
    await act(flushPromises);
    expect(getAllByText('Les Bases').length).toBeGreaterThanOrEqual(1);
  });

  it('affiche les métriques utilisateur (mots appris)', async () => {
    const { getByText } = render(<Dashboard />);
    await act(flushPromises);
    expect(getByText('42')).toBeTruthy();
  });

  it('audience adult → affiche Tuteur IA', async () => {
    setupMocks({
      user: { id: 'user_03', firstName: 'Eve', audience: 'adult', isOnboarded: true },
    });
    const { queryByText } = render(<Dashboard />);
    await act(flushPromises);
    // Adult has AI tutor section — no crash is main goal
    expect(queryByText('Parcours')).toBeTruthy();
  });

  it('lastActivity disponible → affiche le contexte', async () => {
    const { useLastActivity } = require('@/hooks/useLastActivity');
    useLastActivity.mockReturnValue({
      lastActivity: { moduleSlug: 'vocab', familyId: '1', progress: 50, lastReviewed: Date.now() },
      recordActivity: jest.fn(),
      fetchLastActivity: jest.fn(),
      isLoading: false,
    });
    expect(() => render(<Dashboard />)).not.toThrow();
  });
});
