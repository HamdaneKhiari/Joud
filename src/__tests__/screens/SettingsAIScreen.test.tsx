/**
 * Smoke tests — SettingsAIScreen
 * Couvre : chargement, validation à l'enregistrement (clé vide, format invalide),
 * sauvegarde réussie, suppression de clé.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockBack = jest.fn();
const mockUpdateSettings = jest.fn();
const mockDeleteAPIKey = jest.fn();
const mockValidateAPIKeyFormat = jest.fn().mockReturnValue(true);
const mockMaskAPIKey = jest.fn().mockReturnValue('sk-abc...xyz');

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockImplementation(() => ({ identity: mockIdentity })),
}));

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ back: mockBack, replace: mockReplace }),
}));

const mockUseUser = jest.fn();
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUseUser(),
}));

let mockCurrentSettings: { provider: string; apiKey: string | null; isConfigured: boolean } | null = null;

jest.mock('@/hooks/useAISettings', () => ({
  useAISettings: () => ({
    settings: mockCurrentSettings,
    isLoading: false,
    updateSettings: mockUpdateSettings,
    deleteAPIKey: mockDeleteAPIKey,
    secureStorage: {
      maskAPIKey: mockMaskAPIKey,
      validateAPIKeyFormat: mockValidateAPIKeyFormat,
    },
  }),
}));

import SettingsAIScreen from '@/screens/SettingsAIScreen';

beforeEach(() => {
  jest.clearAllMocks();
  mockValidateAPIKeyFormat.mockReturnValue(true);
  mockUpdateSettings.mockResolvedValue(undefined);
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockCurrentSettings = { provider: 'openai', apiKey: null, isConfigured: false };
  mockUseUser.mockReturnValue({ user: { audience: 'college' } });
});

describe('SettingsAIScreen — public primaire', () => {
  it('audience=primary → ne rend rien et redirige vers /', () => {
    mockUseUser.mockReturnValue({ user: { audience: 'primary' } });
    const { queryByText } = render(<SettingsAIScreen />);

    expect(queryByText('Configuration IA')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});

describe('SettingsAIScreen — validation à l\'enregistrement', () => {
  it('clé vide et pas encore configuré → alerte "clé obligatoire", ne sauvegarde pas', () => {
    const { getByLabelText } = render(<SettingsAIScreen />);
    fireEvent.press(getByLabelText('Enregistrer, chiffré'));

    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'La clé API est obligatoire');
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('champ vide mais déjà configuré → ne redemande pas de clé, sauvegarde (conserve l\'existante)', async () => {
    mockCurrentSettings = { provider: 'openai', apiKey: 'sk-existing', isConfigured: true };
    const { getByLabelText } = render(<SettingsAIScreen />);

    await act(async () => { fireEvent.press(getByLabelText('Enregistrer, chiffré')); });

    expect(mockUpdateSettings).toHaveBeenCalledWith(expect.objectContaining({ provider: 'openai', isConfigured: true }));
    expect(mockUpdateSettings.mock.calls[0][0]).not.toHaveProperty('apiKey');
  });

  it('format de clé invalide → alerte format, ne sauvegarde pas', () => {
    mockValidateAPIKeyFormat.mockReturnValue(false);
    const { getByLabelText, getByPlaceholderText } = render(<SettingsAIScreen />);

    fireEvent.changeText(getByPlaceholderText('sk-...'), 'bad-key');
    fireEvent.press(getByLabelText('Enregistrer, chiffré'));

    expect(Alert.alert).toHaveBeenCalledWith(
      '⚠️ Format invalide', expect.any(String), expect.any(Array)
    );
    expect(mockUpdateSettings).not.toHaveBeenCalled();
  });

  it('clé valide → sauvegarde avec isConfigured=true et affiche le succès', async () => {
    const { getByLabelText, getByPlaceholderText } = render(<SettingsAIScreen />);

    fireEvent.changeText(getByPlaceholderText('sk-...'), 'sk-valid-key-1234567890');
    await act(async () => { fireEvent.press(getByLabelText('Enregistrer, chiffré')); });

    expect(mockUpdateSettings).toHaveBeenCalledWith({
      provider: 'openai', apiKey: 'sk-valid-key-1234567890', isConfigured: true,
    });
    expect(Alert.alert).toHaveBeenCalledWith(
      '✅ Clé API sécurisée', expect.any(String), expect.any(Array)
    );
  });

  it('erreur pendant la sauvegarde → alerte avec le message d\'erreur', async () => {
    mockUpdateSettings.mockRejectedValue(new Error('Erreur réseau'));
    const { getByLabelText, getByPlaceholderText } = render(<SettingsAIScreen />);

    fireEvent.changeText(getByPlaceholderText('sk-...'), 'sk-valid-key-1234567890');
    await act(async () => { fireEvent.press(getByLabelText('Enregistrer, chiffré')); });

    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Erreur réseau');
  });
});

describe('SettingsAIScreen — clé existante', () => {
  beforeEach(() => {
    mockCurrentSettings = { provider: 'openai', apiKey: 'sk-existing', isConfigured: true };
  });

  it('affiche la clé masquée et le bouton de suppression', () => {
    const { getByText, getByLabelText } = render(<SettingsAIScreen />);
    expect(getByText(/sk-abc\.\.\.xyz/)).toBeTruthy();
    expect(getByLabelText('Supprimer la clé API')).toBeTruthy();
  });

  it('suppression → confirme puis appelle deleteAPIKey', async () => {
    mockDeleteAPIKey.mockResolvedValue(undefined);
    const { getByLabelText } = render(<SettingsAIScreen />);

    fireEvent.press(getByLabelText('Supprimer la clé API'));

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    const confirmButton = buttons.find((b: { text: string }) => b.text === 'Supprimer');
    await act(async () => { confirmButton.onPress(); });

    expect(mockDeleteAPIKey).toHaveBeenCalled();
  });
});

describe('SettingsAIScreen — sans clé existante', () => {
  it('n\'affiche pas le bouton de suppression', () => {
    const { queryByLabelText } = render(<SettingsAIScreen />);
    expect(queryByLabelText('Supprimer la clé API')).toBeNull();
  });
});
