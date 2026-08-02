/**
 * Smoke tests — AITutorSelectionScreen
 * Couvre : bannière de config manquante, navigation directe si configuré, gate Alert sinon.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockUseAISettings = jest.fn();

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockImplementation(() => ({ identity: mockIdentity })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock('@/hooks/useAISettings', () => ({
  useAISettings: () => mockUseAISettings(),
}));

import AITutorSelectionScreen from '@/screens/AITutor/AITutorSelectionScreen';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});

describe('AITutorSelectionScreen — non configuré', () => {
  beforeEach(() => {
    mockUseAISettings.mockReturnValue({ settings: { isConfigured: false, apiKey: null, provider: 'openai' }, isLoading: false });
  });

  it('affiche la bannière de configuration manquante', () => {
    const { getByText } = render(<AITutorSelectionScreen />);
    expect(getByText('Configure ta clé API pour activer le coach IA')).toBeTruthy();
  });

  it('tap sur un mode → alerte "Clé API requise" au lieu de naviguer', () => {
    const { getAllByLabelText } = render(<AITutorSelectionScreen />);
    const startButtons = getAllByLabelText(/Démarrer/);
    fireEvent.press(startButtons[0]);

    expect(Alert.alert).toHaveBeenCalledWith(
      'Clé API requise',
      expect.any(String),
      expect.any(Array)
    );
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('"Configurer" dans l\'alerte navigue vers /settings-ai', () => {
    const { getAllByLabelText } = render(<AITutorSelectionScreen />);
    fireEvent.press(getAllByLabelText(/Démarrer/)[0]);

    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2];
    buttons.find((b: { text: string }) => b.text === 'Configurer').onPress();

    expect(mockPush).toHaveBeenCalledWith('/settings-ai');
  });
});

describe('AITutorSelectionScreen — configuré', () => {
  beforeEach(() => {
    mockUseAISettings.mockReturnValue({ settings: { isConfigured: true, apiKey: 'sk-key', provider: 'openai' }, isLoading: false });
  });

  it('n\'affiche pas la bannière de configuration', () => {
    const { queryByText } = render(<AITutorSelectionScreen />);
    expect(queryByText('Configure ta clé API pour activer le coach IA')).toBeNull();
  });

  it('tap sur un mode → navigue directement sans alerte', () => {
    const { getAllByLabelText } = render(<AITutorSelectionScreen />);
    fireEvent.press(getAllByLabelText(/Démarrer/)[0]);

    expect(mockPush).toHaveBeenCalledWith('/ai-tutor/free');
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('affiche le provider connecté dans le sous-titre', () => {
    const { getByText } = render(<AITutorSelectionScreen />);
    expect(getByText(/Connecté \(openai\)/)).toBeTruthy();
  });
});
