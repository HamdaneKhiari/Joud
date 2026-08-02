/**
 * Smoke tests — AITutorGuidedScreen
 * Couvre : chargement, état vide (aucune activité), sélection de domaine → phase chat avec
 * message d'ouverture, envoi de message, retour depuis le chat vers la sélection.
 */

import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
const mockCanGoBack = jest.fn().mockReturnValue(true);

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
  useRouter: () => ({ push: mockPush, back: mockBack, replace: mockReplace }),
  useNavigation: () => ({ canGoBack: mockCanGoBack }),
}));

jest.mock('@/contexts/CurrentLevelContext', () => ({
  useCurrentLevel: jest.fn().mockReturnValue({ currentLevel: 2 }),
}));

const mockUseUser = jest.fn();
jest.mock('@/contexts/UserContext', () => ({
  useUser: () => mockUseUser(),
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

let mockDomainsState: { domains: unknown[]; isLoading: boolean } = { domains: [], isLoading: false };
jest.mock('@/screens/AITutor/hooks/useGuidedDomainSummaries', () => ({
  useGuidedDomainSummaries: jest.fn().mockImplementation(() => mockDomainsState),
}));

const mockSaveMessage = jest.fn();
const mockNewConversation = jest.fn().mockResolvedValue(42);
let mockConversationState = { messages: [] as unknown[], isLoading: false };

jest.mock('@/screens/AITutor/hooks/useChatConversation', () => ({
  useChatConversation: jest.fn().mockImplementation(() => ({
    ...mockConversationState,
    saveMessage: mockSaveMessage,
    newConversation: mockNewConversation,
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

import AITutorGuidedScreen from '@/screens/AITutor/AITutorGuidedScreen';
import aiService from '@/services/ai/aiService';

const DOMAIN = {
  domain: 'vocab', label: 'Vocabulaire', emoji: '📝', subtitle: '5 mots vus',
  hasActivity: true, stats: { errorCount: 0, errorExamples: [], familiesWorked: 0, completedCount: 0 },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockCanSendMessage.mockReturnValue(true);
  mockCheckAIConfiguration.mockReturnValue(true);
  mockCanGoBack.mockReturnValue(true);
  mockNewConversation.mockResolvedValue(42);
  mockDomainsState = { domains: [DOMAIN], isLoading: false };
  mockConversationState = { messages: [], isLoading: false };
  mockUseUser.mockReturnValue({ user: { audience: 'college' } });
});

describe('AITutorGuidedScreen — public primaire', () => {
  it('audience=primary → ne rend rien et redirige vers /', () => {
    mockUseUser.mockReturnValue({ user: { audience: 'primary' } });
    const { queryByText } = render(<AITutorGuidedScreen />);

    expect(queryByText('Coach IA')).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});

describe('AITutorGuidedScreen — chargement', () => {
  it('affiche "Chargement..." tant que les domaines chargent', () => {
    mockDomainsState = { domains: [], isLoading: true };
    const { getByText } = render(<AITutorGuidedScreen />);
    expect(getByText('Chargement...')).toBeTruthy();
  });
});

describe('AITutorGuidedScreen — état vide', () => {
  it('aucune activité → affiche le message d\'invitation à faire des exercices', () => {
    mockDomainsState = { domains: [], isLoading: false };
    const { getByText } = render(<AITutorGuidedScreen />);
    expect(getByText("Pas encore d'activité")).toBeTruthy();
  });
});

describe('AITutorGuidedScreen — sélection puis chat', () => {
  it('affiche les DomainCard disponibles', () => {
    const { getByText } = render(<AITutorGuidedScreen />);
    expect(getByText('Vocabulaire')).toBeTruthy();
  });

  it('sélection d\'un domaine → crée une conversation et affiche le message d\'ouverture', async () => {
    const { getByLabelText, findByText } = render(<AITutorGuidedScreen />);

    await act(async () => { fireEvent.press(getByLabelText('Vocabulaire, 5 mots vus')); });

    expect(mockNewConversation).toHaveBeenCalled();
    expect(await findByText(/On travaille ton vocabulaire/)).toBeTruthy();
    expect(mockSaveMessage).toHaveBeenCalledWith('ai', expect.any(String), 'ai');
  });

  it('envoi de message après sélection → appelle aiService et affiche la réponse', async () => {
    (aiService.sendChatMessage as jest.Mock).mockResolvedValue('Réponse du coach');
    const { getByLabelText, getByPlaceholderText, findByText } = render(<AITutorGuidedScreen />);

    await act(async () => { fireEvent.press(getByLabelText('Vocabulaire, 5 mots vus')); });
    fireEvent.changeText(getByPlaceholderText('Écris ton message...'), 'Comment dire chat en anglais ?');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(aiService.sendChatMessage).toHaveBeenCalledWith('openai', 'sk-key', expect.any(Array), { model: 'gpt-4' });
    expect(await findByText('Réponse du coach')).toBeTruthy();
    expect(mockIncrementUsage).toHaveBeenCalled();
  });

  it('gate de config bloquante → n\'envoie rien', async () => {
    const { getByLabelText, getByPlaceholderText } = render(<AITutorGuidedScreen />);
    await act(async () => { fireEvent.press(getByLabelText('Vocabulaire, 5 mots vus')); });

    mockCheckAIConfiguration.mockReturnValue(false);
    fireEvent.changeText(getByPlaceholderText('Écris ton message...'), 'Question');
    await act(async () => { fireEvent.press(getByLabelText('Envoyer')); });

    expect(aiService.sendChatMessage).not.toHaveBeenCalled();
  });

  it('retour depuis le chat → revient à la phase de sélection', async () => {
    const { getByLabelText, findByText, queryByPlaceholderText } = render(<AITutorGuidedScreen />);
    await act(async () => { fireEvent.press(getByLabelText('Vocabulaire, 5 mots vus')); });
    await findByText(/On travaille ton vocabulaire/);

    fireEvent.press(getByLabelText('Retour'));

    expect(queryByPlaceholderText('Écris ton message...')).toBeNull();
  });
});

describe('AITutorGuidedScreen — retour depuis la sélection', () => {
  it('canGoBack=true → router.back()', () => {
    mockCanGoBack.mockReturnValue(true);
    const { getByLabelText } = render(<AITutorGuidedScreen />);
    fireEvent.press(getByLabelText('Retour'));
    expect(mockBack).toHaveBeenCalled();
  });

  it('canGoBack=false → router.replace("/")', () => {
    mockCanGoBack.mockReturnValue(false);
    const { getByLabelText } = render(<AITutorGuidedScreen />);
    fireEvent.press(getByLabelText('Retour'));
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
