/**
 * ============================================
 * AI TUTOR FREE SCREEN (TypeScript + White Label + Moods)
 * Chat libre avec l'IA - Mode non guidé
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
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Contexts & Services
import { useTheme } from '@/themes/ThemeContext';
import { useAI } from '@/contexts/AIContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import aiService from '@/services/ai/aiService';
import ragService from '@/services/ai/ragService';
import useSafeNavigation from '@/hooks/useSafeNavigation';
import { tokens } from '@/themes/tokens';
import { baseColors } from '@/themes/colors';

// ============================================
// TYPES
// ============================================

type RootStackParamList = {
  AITutorFree: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'AITutorFree'>;

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  source?: 'ai' | 'joud_academy' | 'ai_api';
  ragContext?: any;
  provider?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getLevelWelcomeMessage(level: number): string {
  switch (level) {
    case 1:
      return "Pose-moi des questions simples sur l'anglais, je vais t'aider ! 😊";
    case 2:
      return 'Tu peux me poser des questions sur la grammaire, le vocabulaire... Je suis là pour toi ! 📚';
    case 3:
      return "N'hésite pas à me demander des explications sur des concepts plus complexes. On va progresser ensemble ! 🚀";
    case 4:
      return "Discutons en anglais ou en français, je m'adapte à ton niveau avancé. Let's chat! 🎯";
    default:
      return "Pose-moi n'importe quelle question sur l'anglais !";
  }
}

function buildLevelAdaptedSystemPrompt(level: number): { role: string; content: string } {
  const baseTone: Record<number, string> = {
    1: 'Utilise un langage très simple et encourageant. Évite les termes complexes. Utilise des émojis pour rendre la conversation fun. Réponds en 2-3 phrases courtes maximum.',
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

// ============================================
// COMPOSANT
// ============================================

const AITutorFreeScreen: React.FC<Props> = ({ navigation }) => {
  const router = useRouter();
  const { identity } = useTheme();
  const { settings, canSendMessage, incrementUsage, addChatMessage } = useAI();
  const { currentLevel } = useCurrentLevel();
  const safeGoBack = useSafeNavigation(
    useCallback(() => navigation?.goBack?.() || router.back(), [navigation, router])
  );

  const isPlayful = identity.ui.mood === 'playful';

  // État local
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: `Salut ! Je suis ton AI Tutor. ${getLevelWelcomeMessage(currentLevel)}`,
      timestamp: new Date(),
      source: 'ai',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // =================== STYLES ===================

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: identity.palette.background,
        },
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
        settingsButton: {
          padding: tokens.spacing.sm,
        },
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
          borderColor: identity.palette.primary,
        },
        messageContentUser: {
          backgroundColor: identity.palette.primary,
        },
        messageContentError: {
          backgroundColor: baseColors.red100,
          borderWidth: 1,
          borderColor: baseColors.red300,
        },
        ragBadge: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: tokens.spacing.xs,
          marginBottom: tokens.spacing.xs,
          paddingHorizontal: tokens.spacing.sm,
          paddingVertical: tokens.spacing.xs,
          borderRadius: tokens.borderRadius.sm,
          backgroundColor: baseColors.blue100,
        },
        ragBadgeText: {
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.semibold,
          color: baseColors.blue800,
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
          color: baseColors.red800,
        },
        messageProvider: {
          fontSize: tokens.fontSize.xs,
          fontWeight: tokens.fontWeight.medium,
          color: identity.text.tertiary,
          marginTop: tokens.spacing.xs,
          fontStyle: 'italic',
        },
        inputContainer: {
          flexDirection: 'row',
          paddingHorizontal: tokens.spacing.lg,
          paddingVertical: tokens.spacing.md,
          backgroundColor: identity.palette.surface,
          borderTopWidth: 1,
          borderTopColor: identity.palette.primary,
          gap: tokens.spacing.sm,
        },
        input: {
          flex: 1,
          paddingHorizontal: tokens.spacing.md,
          paddingVertical: tokens.spacing.sm,
          borderRadius: tokens.borderRadius.md,
          borderWidth: 1,
          borderColor: identity.palette.primary,
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
        '🤖 Configuration requise',
        "Tu dois d'abord configurer ton IA pour utiliser le chat.",
        [
          {
            text: 'Configurer maintenant',
            onPress: () => router.push('/settings/ai'),
          },
          { text: 'Plus tard', style: 'cancel' },
        ]
      );
      return false;
    }

    if (!canSendMessage()) {
      Alert.alert(
        '⏸️ Limite atteinte',
        `Tu as atteint ta limite quotidienne de ${settings.maxMessagesPerDay} messages. Reviens demain !`,
        [{ text: 'OK', style: 'cancel' }]
      );
      return false;
    }

    return true;
  }, [settings, canSendMessage, router]);

  // =================== SEND MESSAGE ===================
  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    if (!checkAIConfiguration()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    addChatMessage(userMessage as any);
    setInputText('');
    setIsLoading(true);

    try {
      // ========== ÉTAPE 1 : CHECK RAG LOCAL ==========
      const ragResult = ragService.shouldUseRAG(userMessage.content, currentLevel);

      if (ragResult.useRAG && ragResult.context) {
        ragService.trackRAGUsage(true, 100);

        const localResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: ragService.formatRAGContext(ragResult.context),
          timestamp: new Date(),
          source: 'joud_academy',
          ragContext: ragResult.context,
        };

        setMessages((prev) => [...prev, localResponse]);
        addChatMessage(localResponse as any);
        setIsLoading(false);
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
        {
          role: 'user',
          content: userMessage.content,
        },
      ];

      const aiResponse = await aiService.sendChatMessage(
        settings.provider,
        settings.apiKey,
        fullMessages as any,
        { model: settings.model }
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        source: 'ai_api',
        provider: settings.provider,
      };

      setMessages((prev) => [...prev, aiMessage]);
      addChatMessage(aiMessage as any);
      incrementUsage();
    } catch (error: any) {
      console.error('[AITutor] Error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: aiService.formatAIError(error),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);

      if (error.message.includes('api key') || error.message.includes('401')) {
        Alert.alert(
          '🔑 Problème de clé API',
          'Ta clé API semble invalide. Veux-tu la reconfigurer ?',
          [
            {
              text: 'Reconfigurer',
              onPress: () => router.push('/settings/ai'),
            },
            { text: 'Annuler', style: 'cancel' },
          ]
        );
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    inputText,
    isLoading,
    checkAIConfiguration,
    messages,
    currentLevel,
    settings,
    addChatMessage,
    incrementUsage,
    router,
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
              <MaterialCommunityIcons name="school" size={12} color={baseColors.blue800} />
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
              via{' '}
              {message.provider === 'openai'
                ? 'OpenAI'
                : message.provider === 'mistral'
                  ? 'Mistral'
                  : 'Claude'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={safeGoBack.navigate}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={identity.palette.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSubtitle}>
            Niveau {currentLevel} • {settings.isConfigured ? '✓ Connecté' : '⚠️ Non configuré'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => router.push('/settings/ai')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={24} color={identity.palette.primary} />
        </TouchableOpacity>
      </View>

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

          {isLoading && (
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
            placeholder="Pose ta question en français ou en anglais..."
            placeholderTextColor={baseColors.gray400}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            editable={!isLoading}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            textAlignVertical="center"
          />
          <TouchableOpacity
            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
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
