/**
 * ============================================
 * AI TUTOR GUIDED SCREEN
 * Coach IA interactif par domaine
 * Phase 1 : Sélection du domaine (cartes SQLite)
 * Phase 2 : Chat coaching avec message d'ouverture personnalisé
 * ============================================
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';

import { useTheme } from '@/themes/ThemeContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { useAI } from '@/contexts/AIContext';
import { tokens, withOpacity } from '@/themes/tokens';
import aiService from '@/services/ai/aiService';

import GuidedHeader from './components/GuidedHeader';
import DomainCard from './components/DomainCard';
import { useGuidedDomainSummaries, DomainSummary } from './hooks/useGuidedDomainSummaries';
import { useChatConversation, ChatMessage } from './hooks/useChatConversation';

// ============================================
// TYPES
// ============================================

type Phase = 'selection' | 'chat';

interface UIMessage {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  source?: 'ai' | 'ai_api';
  provider?: string;
}

// ============================================
// HELPERS
// ============================================

function toUIMessage(msg: ChatMessage): UIMessage {
  return {
    id: msg.id.toString(),
    type: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    source: msg.source as UIMessage['source'],
    provider: msg.provider,
  };
}

/** Construit le message d'ouverture personnalisé (local, pas d'appel API) */
function buildOpeningMessage(domain: DomainSummary): string {
  const { stats } = domain;
  const errPart = stats.errorCount > 0
    ? `Tu t'es trompé ${stats.errorCount} fois récemment. `
    : '';

  switch (domain.domain) {
    case 'vocab': {
      const words = stats.recentWords?.slice(0, 3).map(w => w.word).join(', ') || '';
      if (words) {
        return `Salut ! Tu as vu récemment : *${words}*. ${errPart}On les travaille ensemble ? Envoie-moi un message pour commencer !`;
      }
      return `Salut ! ${errPart}On travaille ton vocabulaire ? Envoie-moi un message !`;
    }
    case 'grammar': {
      const families = stats.familiesWorked;
      return `Salut ! Tu as travaillé ${families} règle${families > 1 ? 's' : ''} de grammaire. ${errPart}On reprend ensemble ? Dis-moi ce que tu veux revoir !`;
    }
    case 'dialogues': {
      const families = stats.familiesWorked;
      return `Salut ! Tu as fait ${families} dialogue${families > 1 ? 's' : ''}. ${errPart}On peut approfondir un thème ou en pratiquer un nouveau. Qu'est-ce qui t'intéresse ?`;
    }
    case 'reading': {
      const families = stats.familiesWorked;
      return `Salut ! Tu as lu ${families} texte${families > 1 ? 's' : ''}. ${errPart}On peut travailler la compréhension ou découvrir un nouveau texte. Que préfères-tu ?`;
    }
    case 'phrase_types': {
      const completed = stats.completedCount;
      return `Salut ! Tu as construit ${completed} phrase${completed > 1 ? 's' : ''}. ${errPart}On continue à s'entraîner ? Envoie-moi un message !`;
    }
    default:
      return `Salut ! On travaille ensemble sur ce domaine ? Envoie-moi un message pour commencer !`;
  }
}

/** Construit le system prompt adapté au domaine */
function buildDomainSystemPrompt(domain: DomainSummary, level: number): { role: 'system' | 'user' | 'assistant'; content: string } {
  const errorContext = domain.stats.errorExamples.length > 0
    ? `\nErreurs récentes : ${domain.stats.errorExamples.slice(0, 3).map(e => `"${e.question}" (réponse: "${e.userAnswer}", correct: "${e.correctAnswer}")`).join('; ')}`
    : '';

  return aiService.buildSystemMessage(
    `Tu es un coach d'anglais bienveillant et concis. L'élève est niveau ${level}/4.\n` +
    `Domaine : ${domain.label}.${errorContext}\n` +
    `Réponds en français. Sois concis (max 100 mots). Propose des exercices interactifs adaptés au domaine.`
  );
}

// ============================================
// COMPOSANT
// ============================================

const AITutorGuidedScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { identity } = useTheme();
  const { currentLevel } = useCurrentLevel();
  const { settings, canSendMessage, incrementUsage } = useAI();
  const isPlayful = identity.ui.mood === 'playful';

  // Data hooks
  const { domains, isLoading: isDomainsLoading } = useGuidedDomainSummaries();
  const {
    messages: persistedMessages,
    isLoading: isDBLoading,
    saveMessage,
    newConversation,
  } = useChatConversation('guided');

  // State machine
  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedDomain, setSelectedDomain] = useState<DomainSummary | null>(null);

  // Chat state
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const openingSavedRef = useRef<boolean>(false);

  // =================== STYLES ===================

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex:            1,
      backgroundColor: identity.palette.background,
    },
    content: {
      flex:              1,
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.lg,
    },
    sectionTitle: {
      fontSize:     tokens.fontSize.lg,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      marginBottom: tokens.spacing.md,
    },
    emptyContainer: {
      flex:              1,
      alignItems:        'center',
      justifyContent:    'center',
      paddingHorizontal: tokens.spacing.xl,
      paddingTop:        tokens.spacing.xxxl,
    },
    emptyEmoji: {
      fontSize:     tokens.emojiSize.huge,
      marginBottom: tokens.spacing.lg,
    },
    emptyTitle: {
      fontSize:     tokens.fontSize.xl,
      fontWeight:   tokens.fontWeight.bold,
      color:        identity.text.primary,
      textAlign:    'center',
      marginBottom: tokens.spacing.sm,
    },
    emptyText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.secondary,
      textAlign:  'center',
      lineHeight: tokens.fontSize.base * 1.6,
    },
    loadingContainer: {
      flex:           1,
      alignItems:     'center',
      justifyContent: 'center',
    },

    // --- Chat styles ---
    keyboardView: {
      flex: 1,
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical:   tokens.spacing.md,
      gap:               tokens.spacing.md,
    },
    messageBubble: {
      flexDirection: 'row',
      gap:           tokens.spacing.sm,
    },
    messageBubbleAI: {
      justifyContent: 'flex-start',
    },
    messageBubbleUser: {
      justifyContent: 'flex-end',
    },
    aiAvatarContainer: {
      width:          32,
      height:         32,
      borderRadius:   tokens.borderRadius.round,
      backgroundColor: identity.palette.accent,
      alignItems:     'center',
      justifyContent: 'center',
    },
    aiAvatar: {
      fontSize: tokens.fontSize.lg,
    },
    messageContent: {
      maxWidth:     '75%',
      padding:      tokens.spacing.md,
      borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
    },
    messageContentAI: {
      backgroundColor: identity.palette.surface,
      borderWidth:     1,
      borderColor:     withOpacity(identity.palette.primary, 0.2),
    },
    messageContentUser: {
      backgroundColor: identity.palette.primary,
    },
    messageContentError: {
      backgroundColor: withOpacity(identity.aiDiagnostic.error, 0.1),
      borderWidth:     1,
      borderColor:     withOpacity(identity.aiDiagnostic.error, 0.3),
    },
    messageText: {
      fontSize:   tokens.fontSize.base,
      fontWeight: tokens.fontWeight.medium,
      lineHeight: tokens.fontSize.base * 1.5,
    },
    messageTextAI: {
      color: identity.text.primary,
    },
    messageTextUser: {
      color: identity.text.onPrimary,
    },
    messageTextError: {
      color: identity.aiDiagnostic.error,
    },
    messageProvider: {
      fontSize:   tokens.fontSize.xs,
      fontWeight: tokens.fontWeight.medium,
      color:      identity.text.tertiary,
      marginTop:  tokens.spacing.xs,
      fontStyle:  'italic',
    },
    inputContainer: {
      flexDirection:     'row',
      paddingHorizontal: tokens.spacing.lg,
      paddingVertical:   tokens.spacing.md,
      backgroundColor:   identity.palette.surface,
      borderTopWidth:    1,
      borderTopColor:    withOpacity(identity.palette.primary, 0.2),
      gap:               tokens.spacing.sm,
    },
    input: {
      flex:              1,
      paddingHorizontal: tokens.spacing.md,
      paddingVertical:   tokens.spacing.sm,
      borderRadius:      tokens.borderRadius.md,
      borderWidth:       1,
      borderColor:       withOpacity(identity.palette.primary, 0.3),
      backgroundColor:   identity.palette.background,
      fontSize:          tokens.fontSize.base,
      color:             identity.text.primary,
      maxHeight:         100,
    },
    sendButton: {
      width:           44,
      height:          44,
      borderRadius:    tokens.borderRadius.round,
      backgroundColor: identity.palette.primary,
      alignItems:      'center',
      justifyContent:  'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  }), [identity, isPlayful]);

  // =================== SYNC MESSAGES FROM DB ===================

  useEffect(() => {
    if (phase !== 'chat' || isDBLoading) return;

    if (persistedMessages.length > 0) {
      setMessages(persistedMessages.map(toUIMessage));
    }
  }, [persistedMessages, isDBLoading, phase]);

  // =================== SCROLL TO BOTTOM ===================

  useEffect(() => {
    if (phase !== 'chat') return;
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, phase]);

  // =================== HANDLERS ===================

  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [navigation, router]);

  const handleGoBack = useCallback(() => {
    if (phase === 'chat') {
      setPhase('selection');
      setSelectedDomain(null);
      setMessages([]);
      setInputText('');
      openingSavedRef.current = false;
    } else {
      safeGoBack();
    }
  }, [phase, safeGoBack]);

  const handleSelectDomain = useCallback(async (domain: DomainSummary) => {
    setSelectedDomain(domain);
    setPhase('chat');
    openingSavedRef.current = false;

    // Créer une nouvelle conversation guidée et poster le message d'ouverture
    const convId = await newConversation();
    if (convId) {
      const openingContent = buildOpeningMessage(domain);
      const openingMsg: UIMessage = {
        id: 'opening',
        type: 'ai',
        content: openingContent,
        timestamp: new Date(),
        source: 'ai',
      };
      setMessages([openingMsg]);
      openingSavedRef.current = true;
      saveMessage('ai', openingContent, 'ai');
    }
  }, [newConversation, saveMessage]);

  const checkAIConfiguration = useCallback(() => {
    if (!settings.isConfigured) {
      Alert.alert(
        'Configuration requise',
        "Tu dois d'abord configurer ton IA pour utiliser le chat.",
        [
          { text: 'Configurer maintenant', onPress: () => router.push('/settings/ai') },
          { text: 'Plus tard', style: 'cancel' },
        ]
      );
      return false;
    }

    if (!canSendMessage()) {
      Alert.alert(
        'Limite atteinte',
        `Tu as atteint ta limite quotidienne de ${settings.maxMessagesPerDay} messages. Reviens demain !`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return false;
    }

    return true;
  }, [settings, canSendMessage, router]);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending || !selectedDomain) return;
    if (!checkAIConfiguration()) return;

    const userContent = inputText.trim();

    // Optimistic update
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userContent,
      timestamp: new Date(),
    }]);
    setInputText('');
    setIsSending(true);

    saveMessage('user', userContent);

    try {
      const recentMsgs = messages.slice(-6).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));

      const systemPrompt = buildDomainSystemPrompt(selectedDomain, currentLevel);
      const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        systemPrompt,
        ...recentMsgs,
        { role: 'user' as const, content: userContent },
      ];

      const aiResponse = await aiService.sendChatMessage(
        settings.provider as 'openai' | 'mistral' | 'claude',
        settings.apiKey || '',
        fullMessages,
        { model: settings.model }
      );

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        source: 'ai_api',
        provider: settings.provider,
      }]);
      saveMessage('ai', aiResponse, 'ai_api', settings.provider);
      incrementUsage();
    } catch (error: any) {
      console.error('[AITutorGuided] Error:', error);
      const errorContent = aiService.formatAIError(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: errorContent,
        timestamp: new Date(),
      }]);
      saveMessage('error', errorContent);
    } finally {
      setIsSending(false);
    }
  }, [
    inputText, isSending, selectedDomain, checkAIConfiguration,
    messages, currentLevel, settings, saveMessage, incrementUsage,
  ]);

  // =================== RENDER MESSAGE ===================

  const renderMessage = useCallback((message: UIMessage) => {
    const isAI = message.type === 'ai';
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <View
        key={message.id}
        style={[
          styles.messageBubble,
          isAI && styles.messageBubbleAI,
          isUser && styles.messageBubbleUser,
        ]}
      >
        {isAI && (
          <View style={styles.aiAvatarContainer}>
            <Text style={styles.aiAvatar}>🤖</Text>
          </View>
        )}

        <View
          style={[
            styles.messageContent,
            isAI && styles.messageContentAI,
            isUser && styles.messageContentUser,
            isError && styles.messageContentError,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isAI && styles.messageTextAI,
              isUser && styles.messageTextUser,
              isError && styles.messageTextError,
            ]}
          >
            {message.content}
          </Text>

          {isAI && message.source === 'ai_api' && message.provider && (
            <Text style={styles.messageProvider}>
              via {message.provider === 'openai' ? 'OpenAI' : message.provider === 'mistral' ? 'Mistral' : 'Claude'}
            </Text>
          )}
        </View>
      </View>
    );
  }, [styles]);

  // =================== LOADING ===================

  if (isDomainsLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader onBack={safeGoBack} subtitle="Chargement..." />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // =================== PHASE CHAT ===================

  if (phase === 'chat' && selectedDomain) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader
          onBack={handleGoBack}
          subtitle={`${selectedDomain.emoji} ${selectedDomain.label}`}
        />

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(msg => renderMessage(msg))}

            {isSending && (
              <View style={[styles.messageBubble, styles.messageBubbleAI]}>
                <View style={styles.aiAvatarContainer}>
                  <Text style={styles.aiAvatar}>🤖</Text>
                </View>
                <View style={[styles.messageContent, styles.messageContentAI]}>
                  <ActivityIndicator size="small" color={identity.palette.primary} />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Écris ton message..."
              placeholderTextColor={identity.text.tertiary}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              editable={!isSending}
              returnKeyType="send"
              blurOnSubmit={false}
              onSubmitEditing={handleSend}
              textAlignVertical="center"
            />
            <TouchableOpacity
              style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isSending}
              activeOpacity={0.8}
            >
              <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // =================== PHASE SELECTION ===================

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <GuidedHeader
        onBack={safeGoBack}
        subtitle="Choisis un domaine"
      />

      {domains.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📚</Text>
          <Text style={styles.emptyTitle}>Pas encore d'activité</Text>
          <Text style={styles.emptyText}>
            Fais quelques exercices d'abord !{'\n'}
            Le Coach IA analysera tes résultats et t'aidera à progresser.
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Sur quoi veux-tu travailler ?</Text>
          {domains.map(domain => (
            <DomainCard
              key={domain.domain}
              domain={domain}
              onPress={() => handleSelectDomain(domain)}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AITutorGuidedScreen;
