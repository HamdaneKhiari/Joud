/**
 * Tests de composants — AI Tutor (présentationnels)
 * ChatInputBar, ChatMessageBubble, ChatSendingIndicator, DomainCard, GuidedHeader, ModeCard,
 * APIKeyInput, ProviderSelector.
 * Objectif : rendu sans crash + interactions clés, avec identity/styles mockés.
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { createChatStyles } from '@/screens/AITutor/chatStyles';

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
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
  fontFamily: { regular: 'System', medium: 'System', semibold: 'System', bold: 'System', title: 'System', extrabold: 'System' },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockImplementation(() => ({ identity: mockIdentity })),
}));

import ChatInputBar from '@/screens/AITutor/components/ChatInputBar';
import ChatMessageBubble from '@/screens/AITutor/components/ChatMessageBubble';
import ChatSendingIndicator from '@/screens/AITutor/components/ChatSendingIndicator';
import DomainCard from '@/screens/AITutor/components/DomainCard';
import GuidedHeader from '@/screens/AITutor/components/GuidedHeader';
import { ModeCard } from '@/screens/AITutor/components/ModeCard';
import { APIKeyInput } from '@/screens/components/APIKeyInput';
import { ProviderSelector } from '@/screens/components/ProviderSelector';
import type { ChatUIMessage } from '@/screens/AITutor/helpers';
import type { DomainSummary } from '@/screens/AITutor/hooks/useGuidedDomainSummaries';

const chatStyles = createChatStyles(mockIdentity as never, false);

const genericStyles: Record<string, object> = new Proxy({}, { get: () => ({}) });

// ============================================
// ChatInputBar
// ============================================

describe('ChatInputBar', () => {
  it('appelle onChangeText à la saisie', () => {
    const onChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <ChatInputBar
        styles={chatStyles} identity={mockIdentity as never}
        inputText="" onChangeText={onChangeText} onSend={jest.fn()}
        isSending={false} placeholder="Pose ta question..."
      />
    );

    fireEvent.changeText(getByPlaceholderText('Pose ta question...'), 'Hello');
    expect(onChangeText).toHaveBeenCalledWith('Hello');
  });

  it('bouton envoyer désactivé si le texte est vide', () => {
    const { getByLabelText } = render(
      <ChatInputBar
        styles={chatStyles} identity={mockIdentity as never}
        inputText="" onChangeText={jest.fn()} onSend={jest.fn()}
        isSending={false} placeholder="..."
      />
    );

    expect(getByLabelText('Envoyer').props.accessibilityState.disabled).toBe(true);
  });

  it('bouton envoyer actif appelle onSend', () => {
    const onSend = jest.fn();
    const { getByLabelText } = render(
      <ChatInputBar
        styles={chatStyles} identity={mockIdentity as never}
        inputText="Hello" onChangeText={jest.fn()} onSend={onSend}
        isSending={false} placeholder="..."
      />
    );

    fireEvent.press(getByLabelText('Envoyer'));
    expect(onSend).toHaveBeenCalled();
  });

  it('désactivé pendant l\'envoi même avec du texte', () => {
    const { getByLabelText } = render(
      <ChatInputBar
        styles={chatStyles} identity={mockIdentity as never}
        inputText="Hello" onChangeText={jest.fn()} onSend={jest.fn()}
        isSending={true} placeholder="..."
      />
    );

    expect(getByLabelText('Envoyer').props.accessibilityState.disabled).toBe(true);
  });
});

// ============================================
// ChatMessageBubble
// ============================================

describe('ChatMessageBubble', () => {
  const baseMsg: ChatUIMessage = { id: '1', type: 'user', content: 'Salut', timestamp: new Date() };

  it('rend le contenu d\'un message utilisateur', () => {
    const { getByText } = render(<ChatMessageBubble message={baseMsg} styles={chatStyles} identity={mockIdentity as never} />);
    expect(getByText('Salut')).toBeTruthy();
  });

  it('rend le contenu d\'un message IA via MarkdownText', () => {
    const msg: ChatUIMessage = { ...baseMsg, type: 'ai', content: 'Bonjour !' };
    const { getByText } = render(<ChatMessageBubble message={msg} styles={chatStyles} identity={mockIdentity as never} />);
    expect(getByText('Bonjour !')).toBeTruthy();
  });

  it('affiche le badge Joud Academy pour une réponse RAG', () => {
    const msg: ChatUIMessage = { ...baseMsg, type: 'ai', content: 'Réponse', source: 'joud_academy' };
    const { getByText } = render(<ChatMessageBubble message={msg} styles={chatStyles} identity={mockIdentity as never} />);
    expect(getByText('Source : Joud Academy')).toBeTruthy();
  });

  it('affiche le nom du provider pour une réponse ai_api', () => {
    const msg: ChatUIMessage = { ...baseMsg, type: 'ai', content: 'Réponse', source: 'ai_api', provider: 'mistral' };
    const { getByText } = render(<ChatMessageBubble message={msg} styles={chatStyles} identity={mockIdentity as never} />);
    expect(getByText('via Mistral')).toBeTruthy();
  });

  it('rend un message d\'erreur', () => {
    const msg: ChatUIMessage = { ...baseMsg, type: 'error', content: 'Oups' };
    const { getByText } = render(<ChatMessageBubble message={msg} styles={chatStyles} identity={mockIdentity as never} />);
    expect(getByText('Oups')).toBeTruthy();
  });
});

// ============================================
// ChatSendingIndicator
// ============================================

describe('ChatSendingIndicator', () => {
  it('rend sans crash', () => {
    const { UNSAFE_root } = render(<ChatSendingIndicator styles={chatStyles} identity={mockIdentity as never} />);
    expect(UNSAFE_root).toBeTruthy();
  });
});

// ============================================
// DomainCard
// ============================================

describe('DomainCard', () => {
  const domain: DomainSummary = {
    domain: 'vocab', label: 'Vocabulaire', emoji: '📝', subtitle: '5 mots vus',
    hasActivity: true, stats: { errorCount: 0, errorExamples: [], familiesWorked: 0, completedCount: 0 },
  };

  it('affiche le label et le sous-titre du domaine', () => {
    const { getByText } = render(<DomainCard domain={domain} onPress={jest.fn()} />);
    expect(getByText('Vocabulaire')).toBeTruthy();
    expect(getByText('5 mots vus')).toBeTruthy();
  });

  it('appelle onPress au tap', () => {
    const onPress = jest.fn();
    const { getByLabelText } = render(<DomainCard domain={domain} onPress={onPress} />);
    fireEvent.press(getByLabelText('Vocabulaire, 5 mots vus'));
    expect(onPress).toHaveBeenCalled();
  });
});

// ============================================
// GuidedHeader
// ============================================

describe('GuidedHeader', () => {
  it('appelle onBack au tap sur le bouton retour', () => {
    const onBack = jest.fn();
    const { getByLabelText } = render(<GuidedHeader onBack={onBack} />);
    fireEvent.press(getByLabelText('Retour'));
    expect(onBack).toHaveBeenCalled();
  });

  it('affiche le sous-titre fourni au lieu de la pastille erreurs', () => {
    const { getByText, queryByText } = render(<GuidedHeader onBack={jest.fn()} subtitle="Choisis un domaine" totalErrors={5} />);
    expect(getByText('Choisis un domaine')).toBeTruthy();
    expect(queryByText('Erreurs')).toBeNull();
  });

  it('sans sous-titre et avec des erreurs → affiche la pastille erreurs/modules', () => {
    const { getByText } = render(<GuidedHeader onBack={jest.fn()} totalErrors={3} moduleCount={2} />);
    expect(getByText('3')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('Erreurs')).toBeTruthy();
  });

  it('sans sous-titre ni erreurs → aucune pastille', () => {
    const { queryByText } = render(<GuidedHeader onBack={jest.fn()} />);
    expect(queryByText('Erreurs')).toBeNull();
  });
});

// ============================================
// ModeCard
// ============================================

describe('ModeCard', () => {
  it('affiche titre, description et features, déclenche onPress', () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = render(
      <ModeCard
        emoji="💬" title="Chat libre" subtitle="Mode libre" description="Description"
        features={['Feature A', 'Feature B']} onPress={onPress}
        styles={genericStyles} identity={mockIdentity as never}
      />
    );

    expect(getByText('Chat libre')).toBeTruthy();
    expect(getByText('Feature A')).toBeTruthy();
    expect(getByText('Feature B')).toBeTruthy();

    fireEvent.press(getByLabelText('Démarrer, Chat libre'));
    expect(onPress).toHaveBeenCalled();
  });
});

// ============================================
// ProviderSelector
// ============================================

describe('ProviderSelector', () => {
  const providers = [
    { id: 'openai' as const, name: 'OpenAI', icon: '🤖' },
    { id: 'mistral' as const, name: 'Mistral', icon: '🌬️' },
  ];

  it('affiche tous les providers, sélectionne au tap', () => {
    const onSelect = jest.fn();
    const { getByLabelText } = render(
      <ProviderSelector providers={providers} selectedProvider="openai" onSelectProvider={onSelect} styles={genericStyles} />
    );

    fireEvent.press(getByLabelText('Mistral'));
    expect(onSelect).toHaveBeenCalledWith('mistral');
  });

  it('marque le provider sélectionné via accessibilityState', () => {
    const { getByLabelText } = render(
      <ProviderSelector providers={providers} selectedProvider="mistral" onSelectProvider={jest.fn()} styles={genericStyles} />
    );

    expect(getByLabelText('Mistral').props.accessibilityState.selected).toBe(true);
    expect(getByLabelText('OpenAI').props.accessibilityState.selected).toBe(false);
  });
});

// ============================================
// APIKeyInput
// ============================================

describe('APIKeyInput', () => {
  it('appelle onChangeApiKey à la saisie', () => {
    const onChange = jest.fn();
    const { getByPlaceholderText } = render(
      <APIKeyInput
        provider="openai" providerName="OpenAI" apiKey="" onChangeApiKey={onChange}
        styles={genericStyles} identity={mockIdentity as never}
      />
    );

    fireEvent.changeText(getByPlaceholderText('sk-...'), 'sk-new-key');
    expect(onChange).toHaveBeenCalledWith('sk-new-key');
  });

  it('affiche la clé masquée existante et adapte le placeholder', () => {
    const { getByText, getByPlaceholderText } = render(
      <APIKeyInput
        provider="openai" providerName="OpenAI" apiKey="" onChangeApiKey={jest.fn()}
        existingMaskedKey="sk-abc...xyz" styles={genericStyles} identity={mockIdentity as never}
      />
    );

    expect(getByText(/sk-abc\.\.\.xyz/)).toBeTruthy();
    expect(getByPlaceholderText('Nouvelle clé (optionnel)')).toBeTruthy();
  });

  it('sans clé existante → placeholder "sk-..."', () => {
    const { getByPlaceholderText } = render(
      <APIKeyInput
        provider="openai" providerName="OpenAI" apiKey="" onChangeApiKey={jest.fn()}
        styles={genericStyles} identity={mockIdentity as never}
      />
    );

    expect(getByPlaceholderText('sk-...')).toBeTruthy();
  });
});
