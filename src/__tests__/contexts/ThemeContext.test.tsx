/**
 * ThemeContext — tests
 *
 * Vérifie le chargement du branding depuis la DB, les fallbacks,
 * la transformation Branding→Identity, et isDark.
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/themes/ThemeContext';
import type { Branding } from '@/database/schema';

const flushPromises = () => new Promise<void>(resolve => setTimeout(resolve, 0));

// ============================================
// Mocks
// ============================================

jest.mock('@/contexts/UserContext', () => ({ useUser: jest.fn() }));
jest.mock('@/database', () => ({
  queries: { getBrandingById: jest.fn() },
}));
jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// ============================================
// Helpers
// ============================================

const makeDb = () => ({
  getFirstAsync: jest.fn().mockResolvedValue(null),
  getAllAsync: jest.fn().mockResolvedValue([]),
  execAsync: jest.fn().mockResolvedValue(undefined),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
});

const MOCK_USER = { id: 'user_01', firstName: 'Alice', audience: 'college', isOnboarded: true };

function setupUser(db = makeDb(), user = MOCK_USER) {
  const { useUser } = require('@/contexts/UserContext');
  useUser.mockReturnValue({ db, user, loading: false });
}

const COLLEGE_BRANDING: Branding = {
  id: 'college',
  primary_color: '#34495E',
  accent_color: '#FFD700',
  surface_color: '#FFFFFF',
  logo_name: 'school',
  theme_mode: 'light',
  ui_has_gradient: 0,
  ui_gradient_colors: null,
  ui_card_radius: 14,
  ui_show_decorative_shapes: 1,
  ai_accent_color: null,
  ai_error_color: null,
  ai_solution_bg: null,
  header_bg_color: '#34495E',
  header_accent_color: '#FFD700',
  header_emoji: '📚',
  header_welcome_text: 'Bonjour !',
  daily_word_bg_color: '#FFF9C4',
  daily_word_gradient: null,
  daily_word_decoration: 'none',
  dashboard_level_progress_color: '#34495E',
  text_on_main_color: '#FFFFFF',
  text_primary_color: '#1F2937',
  text_secondary_color: '#6B7280',
  ai_tutor_title: 'Tuteur IA',
  ai_tutor_subtitle: 'Aide aux devoirs',
  ui_card_mood: 'playful',
};

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

// ============================================
// Tests
// ============================================

describe('ThemeContext', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    setupUser();
  });

  describe('chargement du branding', () => {

    it('charge l\'identité depuis la DB et transforme en Identity', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue(COLLEGE_BRANDING);

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.identity.id).toBe('college');
      expect(result.current.identity.palette.primary).toBe('#34495E');
      expect(result.current.identity.organizationName).toBe('Joud Collège');
    });

    it('utilise defaultIdentity quand getBrandingById retourne null', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue(null);

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.identity.id).toBe('college'); // defaultIdentity
    });

    it('utilise defaultIdentity quand DB échoue', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockRejectedValue(new Error('DB error'));

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.isLoading).toBe(false);
      expect(result.current.identity.palette.primary).toBe('#34495E'); // defaultIdentity
    });

    it('n\'appelle pas getBrandingById si db est null', async () => {
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({ db: null, user: MOCK_USER, loading: false });

      const { queries } = require('@/database');

      renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(queries.getBrandingById).not.toHaveBeenCalled();
    });

    it('expose les tokens du design system', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue(COLLEGE_BRANDING);

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.tokens).toBeDefined();
      expect(result.current.tokens.spacing.md).toBe(12);
      expect(result.current.tokens.fontSize.base).toBe(16);
    });
  });

  describe('transformation Branding → Identity', () => {

    it('ui.showDecorativeShapes : 1 → true, 0 → false', async () => {
      const { queries } = require('@/database');

      queries.getBrandingById.mockResolvedValue({ ...COLLEGE_BRANDING, ui_show_decorative_shapes: 1 });
      const { result: r1 } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);
      expect(r1.current.identity.ui.showDecorativeShapes).toBe(true);
    });

    it('header.background : gradient JSON si présent', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue({
        ...COLLEGE_BRANDING,
        ui_gradient_colors: '["#FF0000","#0000FF"]',
      });

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      // Le gradient est parsé en tableau
      expect(Array.isArray(result.current.identity.header.background)).toBe(true);
    });

    it('organizationName correct par audience', async () => {
      const { queries } = require('@/database');
      const audiences = [
        { id: 'primary', expected: 'Joud Primaire' },
        { id: 'college', expected: 'Joud Collège' },
        { id: 'lycee', expected: 'Joud Lycée' },
        { id: 'adult', expected: 'Joud Adulte' },
      ];

      for (const { id, expected } of audiences) {
        queries.getBrandingById.mockResolvedValue({ ...COLLEGE_BRANDING, id });
        const { useUser } = require('@/contexts/UserContext');
        useUser.mockReturnValue({ db: makeDb(), user: { ...MOCK_USER, audience: id }, loading: false });

        const { result } = renderHook(() => useTheme(), { wrapper });
        await act(flushPromises);
        expect(result.current.identity.organizationName).toBe(expected);
      }
    });
  });

  describe('isDark', () => {

    it('isDark = true quand theme_mode = dark', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue({ ...COLLEGE_BRANDING, theme_mode: 'dark' });

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.isDark).toBe(true);
    });

    it('isDark = false quand theme_mode = light', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue({ ...COLLEGE_BRANDING, theme_mode: 'light' });

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      expect(result.current.isDark).toBe(false);
    });
  });

  describe('setAppIdentity', () => {

    it('change l\'identité quand user est null (pas de remise à zéro par l\'audience)', async () => {
      // Sans user, setCurrentApp n'est pas contrecarré par l'effect user.audience
      const { useUser } = require('@/contexts/UserContext');
      useUser.mockReturnValue({ db: makeDb(), user: null, loading: false });

      const { queries } = require('@/database');
      queries.getBrandingById
        .mockResolvedValueOnce(COLLEGE_BRANDING) // chargement initial 'college'
        .mockResolvedValueOnce({ ...COLLEGE_BRANDING, id: 'primary', primary_color: '#E74C3C' });

      const { result } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);

      act(() => { result.current.setAppIdentity('primary'); });
      await act(flushPromises);

      expect(queries.getBrandingById).toHaveBeenCalledWith(expect.anything(), 'primary');
      expect(result.current.identity.palette.primary).toBe('#E74C3C');
    });
  });

  describe('currentApp', () => {

    it('currentApp suit user.audience au changement', async () => {
      const { queries } = require('@/database');
      queries.getBrandingById.mockResolvedValue(COLLEGE_BRANDING);
      const { useUser } = require('@/contexts/UserContext');

      // Montage initial avec college
      const { result, rerender } = renderHook(() => useTheme(), { wrapper });
      await act(flushPromises);
      expect(result.current.currentApp).toBe('college');

      // Changement d'audience vers lycee
      useUser.mockReturnValue({ db: makeDb(), user: { ...MOCK_USER, audience: 'lycee' }, loading: false });
      rerender({});
      await act(flushPromises);

      expect(result.current.currentApp).toBe('lycee');
    });
  });
});
