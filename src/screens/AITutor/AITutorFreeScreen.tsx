/**
 * ============================================
 * AI TUTOR FREE SCREEN (TypeScript + White Label + Moods)
 * Chat libre avec l'IA - Mode non guidé
 * Historique persistant (3 conversations max via useChatConversation)
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
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Contexts & Services
import { useTheme } from '@/themes/ThemeContext';
import { useAI } from '@/contexts/AIContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import aiService from '@/services/ai/aiService';
import ragService from '@/services/ai/ragService';
import { tokens, withOpacity } from '@/themes/tokens';
import { useChatConversation, ChatMessage } from './hooks/useChatConversation';

// ============================================
// TYPES
// ============================================

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  source?: 'ai' | 'joud_academy' | 'ai_api';
  provider?: string;
}

// ============================================
// HELPERS
// ============================================

function getLevelWelcomeMessage(level: number): string {
  switch (level) {
    case 1:
      return "Pose-moi des questions simples sur l'anglais, je vais t'aider !";
    case 2:
      return 'Tu peux me poser des questions sur la grammaire, le vocabulaire... Je suis là pour toi !';
    case 3:
      return "N'hésite pas à me demander des explications sur des concepts plus complexes. On va progresser ensemble !";
    case 4:
      return "Discutons en anglais ou en français, je m'adapte à ton niveau avancé. Let's chat!";
    default:
      return "Pose-moi n'importe quelle question sur l'anglais !";
  }
}

function buildLevelAdaptedSystemPrompt(level: number): { role: string; content: string } {
  const baseTone: Record<number, string> = {
    1: 'Utilise un langage très simple et encourageant. Évite les termes complexes. Réponds en 2-3 phrases courtes maximum.',
    2: 'Utilise un langage clair et pédagogique. Tu peux introduire quelques termes techniques en les expliquant. Réponds en 3-4 phrases.',
    3: 'Utilise un langage précis. Tu peux utiliser des termes grammaticaux et donner des explications plus nuancées. Réponds en 4-5 phrases.',
    4: "Utilise un langage riche et précis. Tu peux discuter de concepts avancés et donner des exemples variés. N'hésite pas à mélanger français et anglais si pertinent. Réponds en 5-6 phrases.",
  };

  return aiService.buildSystemMessage(
    `Student level: ${level}/4 (${level === 1 ? 'beginner' : level === 2 ? 'intermediate' : level === 3 ? 'advanced' : 'expert'})

Tone adaptation:
${baseTone[level] || baseTone[2]}

IMPORTANT: If you detect that the question is about a grammar rule or vocabulary that exists in Joud's lesson data, mention it so the student knows it's certified content.`
  );
}

/** Convertit un ChatMessage (DB) en Message (UI) */
function toUIMessage(msg: ChatMessage): Message {
  return {
    id: msg.id.toString(),
    type: msg.role,
    content: msg.content,
    timestamp: new Date(msg.created_at),
    source: msg.source as Message['source'],
    provider: msg.provider,
  };
}

// ============================================
// COMPOSANT
// ============================================

const AITutorFreeScreen: React.FC = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const { settings, canSendMessage, incrementUsage } = useAI();
  const { currentLevel } = useCurrentLevel();
  const {
    conversations,
    currentConversationId,
    messages: persistedMessages,
    isLoading: isDBLoading,
    saveMessage,
    newConversation,
    switchConversation,
  } = useChatConversation('free');

  const isPlayful = identity.ui.mood === 'playful';

  // État local pour le rendu (permet les mises à jour optimistiques)
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  // Évite de poster le welcome deux fois pour la même conversation
  const welcomeSavedRef = useRef<number | null>(null);

  // =================== SYNC depuis la DB ===================
  useEffect(() => {
    if (isDBLoading || !currentConversationId) return;

    if (persistedMessages.length > 0) {
      setMessages(persistedMessages.map(toUIMessage));
    } else if (welcomeSavedRef.current !== currentConversationId) {
      // Nouvelle conversation vide → poster le welcome + le persister
      welcomeSavedRef.current = currentConversationId;
      const welcomeContent = `Salut ! Je suis ton AI Tutor. ${getLevelWelcomeMessage(currentLevel)}`;
      setMessages([{
        id: 'welcome',
        type: 'ai',
        content: welcomeContent,
        timestamp: new Date(),
        source: 'ai',
      }]);
      saveMessage('ai', welcomeContent, 'ai');
    }
  }, [persistedMessages, currentConversationId, isDBLoading, currentLevel, saveMessage]);

  // =================== STYLES ===================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: identity.palette.background,
        },

        // --- Header ---
        header: {
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          backgroundColor: identity.palette.surface,
          borderBottomWidth: 2,
          borderBottomColor: identity.palette.primary,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        backButton: {
          padding: tokens.spacing.sm,
        },
        headerCenter: {
          flex: 1,
          alignItems: isPlayful ? 'center' : 'flex-start',
          marginHorizontal: tokens.spacing.md,
        },
        headerTitle: {
          fontSize: tokens.fontSize.xl,
          fontWeight: tokens.fontWeight.bold,
          color: identity.text.primary,
        },
        headerSubtitle: {
          fontSize: tokens.fontSize.sm,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.secondary,
        },
        headerActions: {
          flexDirection: 'row',
          gap: tokens.spacing.xs,
        },
        iconButton: {
          padding: tokens.spacing.sm,
        },

        // --- Barre des conversations ---
        convBar: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.sm,
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.sm,
          backgroundColor: identity.palette.background,
          borderBottomWidth: 1,
          borderBottomColor: withOpacity(identity.palette.primary, 0.1),
        },
        convChip: {
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.borderRadius.round,
          backgroundColor: identity.palette.surface,
          borderWidth: 1,
          borderColor: withOpacity(identity.palette.primary, 0.2),
        },
        convChipActive: {
          backgroundColor: identity.palette.primary,
          borderColor: identity.palette.primary,
        },
        convChipText: {
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.semibold,
          color: identity.text.secondary,
        },
        convChipTextActive: {
          color: identity.text.onPrimary,
        },

        // --- Messages ---
        keyboardView: {
          flex: 1,
        },
        messagesContainer: {
          flex: 1,
        },
        messagesContent: {
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          gap: tokens.spacing.md,
        },
        messageBubble: {
          flexDirection: 'row',
          gap: tokens.spacing.sm,
        },
        messageBubbleAI: {
          justifyContent: 'flex-start',
        },
        messageBubbleUser: {
          justifyContent: 'flex-end',
        },
        aiAvatarContainer: {
          width: 32,
          height: 32,
          borderRadius: tokens.borderRadius.round,
          backgroundColor: identity.palette.accent,
          alignItems: 'center',
          justifyContent: 'center',
        },
        aiAvatar: {
          fontSize: tokens.fontSize.lg,
        },
        messageContent: {
          maxWidth: '75%',
          padding: tokens.spacing.md,
          borderRadius: isPlayful ? tokens.borderRadius.lg : tokens.borderRadius.md,
        },
        messageContentAI: {
          backgroundColor: identity.palette.surface,
          borderWidth: 1,
          borderColor: withOpacity(identity.palette.primary, 0.2),
        },
        messageContentUser: {
          backgroundColor: identity.palette.primary,
        },
        messageContentError: {
          backgroundColor: withOpacity(identity.aiDiagnostic.error, 0.1),
          borderWidth: 1,
          borderColor: withOpacity(identity.aiDiagnostic.error, 0.3),
        },
        ragBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.xs,
          marginBottom: tokens.spacing.xs,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: withOpacity(identity.palette.accent, 0.15),
        },
        ragBadgeText: {
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.semibold,
          color: identity.palette.accent,
        },
        messageText: {
          fontSize: tokens.fontSize.base,
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
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.tertiary,
          marginTop: tokens.spacing.xs,
          fontStyle: 'italic',
        },

        // --- Input ---
        inputContainer: {
          flexDirection: 'row',
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          backgroundColor: identity.palette.surface,
          borderTopWidth: 1,
          borderTopColor: withOpacity(identity.palette.primary, 0.2),
          gap: tokens.spacing.sm,
        },
        input: {
          flex: 1,
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
          borderRadius: tokens.borderRadius.md,
          borderWidth: 1,
          borderColor: withOpacity(identity.palette.primary, 0.3),
          backgroundColor: identity.palette.background,
          fontSize: tokens.fontSize.base,
          color: identity.text.primary,
          maxHeight: 100,
        },
        sendButton: {
          width: 44,
          height: 44,
          borderRadius: tokens.borderRadius.round,
          backgroundColor: identity.palette.primary,
          alignItems: 'center',
          justifyContent: 'center',
        },
        sendButtonDisabled: {
          opacity: 0.5,
        },

        // --- Loading full screen ---
        loadingContainer: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        },
      }),
    [identity, isPlayful]
  );

  // =================== SCROLL TO BOTTOM ===================
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  // =================== CHECK CONFIGURATION ===================
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

  // =================== SEND MESSAGE ===================
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending) return;
    if (!checkAIConfiguration()) return;

    const userContent = inputText.trim();

    // Optimiste : ajouter le message utilisateur immédiatement
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      type: 'user',
      content: userContent,
      timestamp: new Date(),
    }]);
    setInputText('');
    setIsSending(true);

    // Persister le message utilisateur
    saveMessage('user', userContent);

    try {
      // ========== ÉTAPE 1 : CHECK RAG LOCAL ==========
      const ragResult = ragService.shouldUseRAG(userContent, currentLevel);

      if (ragResult.useRAG && ragResult.context) {
        ragService.trackRAGUsage(true, 100);

        const ragContent = ragService.formatRAGContext(ragResult.context);
        setMessages((prev) => [...prev, {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: ragContent,
          timestamp: new Date(),
          source: 'joud_academy',
        }]);
        saveMessage('ai', ragContent, 'joud_academy');
        setIsSending(false);
        return;
      }

      // ========== ÉTAPE 2 : APPEL API IA ==========
      ragService.trackRAGUsage(false);

      const recentMessages = messages.slice(-6).map((msg) => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      const systemPrompt = buildLevelAdaptedSystemPrompt(currentLevel);
      const fullMessages = [
        systemPrompt,
        ...recentMessages,
        { role: 'user', content: userContent },
      ];

      const aiResponse = await aiService.sendChatMessage(
        settings.provider as 'openai' | 'mistral' | 'claude',
        settings.apiKey || '',
        fullMessages,
        { model: settings.model }
      );

      setMessages((prev) => [...prev, {
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
      console.error('[AITutor] Error:', error);

      const errorContent = aiService.formatAIError(error);
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: errorContent,
        timestamp: new Date(),
      }]);
      saveMessage('error', errorContent);

      if (error.message?.includes('api key') || error.message?.includes('401')) {
        Alert.alert(
          'Problème de clé API',
          'Ta clé API semble invalide. Veux-tu la reconfigurer ?',
          [
            { text: 'Reconfigurer', onPress: () => router.push('/settings/ai') },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
      }
    } finally {
      setIsSending(false);
    }
  }, [
    inputText, isSending, checkAIConfiguration, messages,
    currentLevel, settings, saveMessage, incrementUsage, router,
  ]);

  // =================== RENDER MESSAGE ===================
  const renderMessage = (message: Message) => {
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
            <Text style={styles.aiAvatar}>
              {message.source === 'joud_academy' ? '📚' : '🤖'}
            </Text>
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
          {isAI && message.source === 'joud_academy' && (
            <View style={styles.ragBadge}>
              <MaterialCommunityIcons name="school" size={12} color={identity.palette.accent} />
              <Text style={styles.ragBadgeText}>Source : Joud Academy</Text>
            </View>
          )}

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
  };

  // =================== LOADING ===================
  if (isDBLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // =================== RENDER ===================
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={identity.palette.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSubtitle}>
            Niveau {currentLevel} • {settings.isConfigured ? 'Connecté' : 'Non configuré'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={newConversation} activeOpacity={0.7}>
            <Ionicons name="add-circle-outline" size={24} color={identity.palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/settings/ai')} activeOpacity={0.7}>
            <Ionicons name="settings-outline" size={24} color={identity.palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Barre des conversations (affichée si > 1 conversation) */}
      {conversations.length > 1 && (
        <View style={styles.convBar}>
          {conversations.map((conv) => {
            const isActive = conv.id === currentConversationId;
            return (
              <TouchableOpacity
                key={conv.id}
                style={[styles.convChip, isActive && styles.convChipActive]}
                onPress={() => switchConversation(conv.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.convChipText, isActive && styles.convChipTextActive]}>
                  {conv.title || 'Nouvelle'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Messages Zone */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => renderMessage(msg))}

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

        {/* Input Zone */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question..."
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
};

export default AITutorFreeScreen;
