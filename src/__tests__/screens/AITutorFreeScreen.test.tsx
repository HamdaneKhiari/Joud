/**
 * Smoke tests — AITutorFreeScreen
 * Couvre : chargement, message de bienvenue vs historique, envoi (happy path, RAG,
 * erreur avec alerte clé invalide), gate de config avant envoi.
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockImplementation(() => ({ identity: mockIdentity })),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

jest.mock('@/contexts/CurrentLevelContext', () => ({
  useCurrentLevel: jest.fn().mockReturnValue({ currentLevel: 2 }),
}));

const mockSettings = {
  provider: 'openai' as const, apiKey: 'sk-key', model: 'gpt-4', isConfigured: true,
  maxTokens: 500, temperature: 0.7, maxMessagesPerDay: 50, currentUsageCount: 0, lastResetDate: 0,
};
const mockCanSendMessage = jest.fn().mockReturnValue(true);
const mockIncrementUsage = jest.fn();

jest.mock('@/contexts/AIContext', () => ({
  useAI: jest.fn().mockImplementation(() => ({
    settings: mockSettings, canSendMessage: mockCanSendMessage, incrementUsage: mockIncrementUsage,
  })),
}));

const mockSaveMessage = jest.fn();
const mockNewConversation = jest.fn();
const mockSwitchConversation = jest.fn();
let mockConversationState = {
  conversations: [] as { id: number; title: string | null }[],
  currentConversationId: 1,
  messages: [] as { id: number; role: string; content: string; created_at: number }[],
  isLoading: false,
};

jest.mock('@/screens/AITutor/hooks/useChatConversation', () => ({
  useChatConversation: jest.fn().mockImplementation(() => ({
    ...mockConversationState,
    saveMessage: mockSaveMessage,
    newConversation: mockNewConversation,
    switchConversation: mockSwitchConversation,
  })),
}));

const mockCheckAIConfiguration = jest.fn().mockReturnValue(true);
jest.mock('@/screens/AITutor/hooks/useAIConfigCheck', () => ({
  useAIConfigCheck: jest.fn().mockImplementation(() => mockCheckAIConfiguration),
}));

jest.mock('@/services/ai/aiService', () => ({
  __esModule: true,
  default: {
    sendChatMessage: jest.fn(),
    formatAIError: jest.fn().mockImplementation((e: unknown) => (e instanceof Error ? e.message : 'erreur')),
    buildSystemMessage: jest.fn().mockImplementation((content: string) => ({ role: 'system', content })),
  },
}));

jest.mock('@/services/ai/ragService', () => ({
  __esModule: true,
  default: {
    shouldUseRAG: jest.fn().mockReturnValue({ useRAG: false }),
    trackRAGUsage: jest.fn(),
    formatRAGContext: jest.fn(),
  },
}));

import AITutorFreeScreen from '@/screens/AITutor/AITutorFreeScreen';
import aiService from '@/services/ai/aiService';
import ragService from '@/services/ai/ragService';

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  mockCanSendMessage.mockReturnValue(true);
  mockCheckAIConfiguration.mockReturnValue(true);
  (ragService.shouldUseRAG as jest.Mock).mockReturnValue({ useRAG: false });
  mockConversationState = {
    conversations: [], currentConversationId: 1, messages: [], isLoading: false,
  };
});

describe('AITutorFreeScreen — chargement', () => {
  it('affiche un indicateur de chargement tant que isDBLoading est true', () => {
    mockConversationState = { ...mockConversationState, isLoading: true };
    const { queryByLabelText } = render(<AITutorFreeScreen />);
    expect(queryByLabelText('Nouvelle conversation')).toBeNull();
  });
});

describe('AITutorFreeScreen — message de bienvenue vs historique', () => {
  it('sans historique → affiche un message de bienvenue et le sauvegarde', async () => {
    const { findByText } = render(<AITutorFreeScreen />);
    await findByText(/Salut ! Je suis ton AI Tutor/);
    await waitFor(() => expect(mockSaveMessage).toHaveBeenCalledWith('ai', expect.any(String), 'ai'));
  });

  it('avec historique → affiche les messages persistés au lieu du message de bienvenue', async () => {
    mockConversationState = {
      ...mockConversationState,
      messages: [{ id: 1, role: 'user', content: 'Salut historique', created_at: Date.now() }],
    };
    const { findByText } = render(<AITutorFreeScreen />);
    expect(await findByText('Salut historique')).toBeTruthy();
  });
});

describe('AITutorFreeScreen — envoi de message', () => {
  it('gate de config bloquante → n\'envoie rien, n\'appelle pas aiService', async () => {
    mockCheckAIConfiguration.mockReturnValue(false);
    const { getByPlaceholderText, getByLabelText } = render(<AITutorFreeScreen />);

    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Hello');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(aiService.sendChatMessage).not.toHaveBeenCalled();
  });

  it('happy path → appelle aiService avec le provider/clé/modèle, affiche la réponse, incrémente l\'usage', async () => {
    (aiService.sendChatMessage as jest.Mock).mockResolvedValue('Réponse IA');
    const { getByPlaceholderText, getByLabelText, findByText } = render(<AITutorFreeScreen />);

    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Hello');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(aiService.sendChatMessage).toHaveBeenCalledWith('openai', 'sk-key', expect.any(Array), { model: 'gpt-4' });
    expect(await findByText('Réponse IA')).toBeTruthy();
    expect(mockIncrementUsage).toHaveBeenCalled();
    expect(mockSaveMessage).toHaveBeenCalledWith('ai', 'Réponse IA', 'ai_api', 'openai');
  });

  it('RAG disponible → répond depuis le contenu Joud Academy sans appeler aiService', async () => {
    (ragService.shouldUseRAG as jest.Mock).mockReturnValue({ useRAG: true, context: 'contexte pédagogique' });
    (ragService.formatRAGContext as jest.Mock).mockReturnValue('Réponse formatée RAG');

    const { getByPlaceholderText, getByLabelText, findByText } = render(<AITutorFreeScreen />);
    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Comment dire bonjour ?');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(await findByText('Réponse formatée RAG')).toBeTruthy();
    expect(aiService.sendChatMessage).not.toHaveBeenCalled();
    expect(mockSaveMessage).toHaveBeenCalledWith('ai', 'Réponse formatée RAG', 'joud_academy');
  });

  it('erreur réseau → affiche le message formaté comme erreur', async () => {
    (aiService.sendChatMessage as jest.Mock).mockRejectedValue(new Error('Connexion perdue'));
    const { getByPlaceholderText, getByLabelText, findByText } = render(<AITutorFreeScreen />);

    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Hello');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(await findByText('Connexion perdue')).toBeTruthy();
    expect(mockSaveMessage).toHaveBeenCalledWith('error', 'Connexion perdue');
  });

  it('erreur 401 → propose de reconfigurer la clé API', async () => {
    (aiService.sendChatMessage as jest.Mock).mockRejectedValue(new Error('401 Unauthorized'));
    const { getByPlaceholderText, getByLabelText } = render(<AITutorFreeScreen />);

    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Hello');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(Alert.alert).toHaveBeenCalledWith(
      'Problème de clé API', expect.any(String), expect.any(Array)
    );
  });
});

describe('AITutorFreeScreen — nouvelle conversation', () => {
  it('bouton "+" appelle newConversation', () => {
    const { getByLabelText } = render(<AITutorFreeScreen />);
    fireEvent.press(getByLabelText('Nouvelle conversation'));
    expect(mockNewConversation).toHaveBeenCalled();
  });
});
