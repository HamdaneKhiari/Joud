// Chat libre avec l'IA (mode non guidé). Historique persistant (3 conversations max via useChatConversation).
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { sanitizeUserInput } from '@/utils/inputSanitizer';

import { useTheme } from '@/themes/ThemeContext';
import { useAI } from '@/contexts/AIContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import aiService from '@/services/ai/aiService';
import ragService from '@/services/ai/ragService';
import { useChatConversation } from './hooks/useChatConversation';
import { useAIConfigCheck } from './hooks/useAIConfigCheck';
import { createFreeStyles } from './AITutorFreeScreen.styles';
import { createChatStyles } from './chatStyles';
import {
  ChatUIMessage, toUIMessage,
  getLevelWelcomeMessage, buildLevelAdaptedSystemPrompt,
} from './helpers';
import ChatMessageBubble from './components/ChatMessageBubble';
import ChatSendingIndicator from './components/ChatSendingIndicator';
import ChatInputBar from './components/ChatInputBar';

const AITutorFreeScreen: React.FC = () => {
  const router = useRouter();
  const { identity } = useTheme();
  const { settings, canSendMessage, incrementUsage } = useAI();
  const { currentLevel } = useCurrentLevel();
  const {
    conversations, currentConversationId,
    messages: persistedMessages, isLoading: isDBLoading,
    saveMessage, newConversation, switchConversation,
  } = useChatConversation('free');

  const isPlayful = identity.ui.mood === 'playful';

  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const welcomeSavedRef = useRef<number | null>(null);

  const styles = useMemo(
    () => ({ ...createFreeStyles(identity, isPlayful), ...createChatStyles(identity, isPlayful) }),
    [identity, isPlayful]
  );

  useEffect(() => {
    if (isDBLoading || !currentConversationId) return;
    if (persistedMessages.length > 0) {
      setMessages(persistedMessages.map(toUIMessage));
    } else if (welcomeSavedRef.current !== currentConversationId) {
      welcomeSavedRef.current = currentConversationId;
      const welcomeContent = `Salut ! Je suis ton AI Tutor. ${getLevelWelcomeMessage(currentLevel)}`;
      setMessages([{ id: 'welcome', type: 'ai', content: welcomeContent, timestamp: new Date(), source: 'ai' }]);
      saveMessage('ai', welcomeContent, 'ai');
    }
  }, [persistedMessages, currentConversationId, isDBLoading, currentLevel, saveMessage]);

  useEffect(() => {
    const t = setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);
    return () => clearTimeout(t);
  }, [messages]);

  const checkAIConfiguration = useAIConfigCheck(settings, canSendMessage);

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || isSending) return;
    if (!checkAIConfiguration()) return;

    const userContent = sanitizeUserInput(inputText.trim(), 500);
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: userContent, timestamp: new Date() }]);
    setInputText('');
    setIsSending(true);
    saveMessage('user', userContent);

    try {
      const ragResult = ragService.shouldUseRAG(userContent, currentLevel);
      if (ragResult.useRAG && ragResult.context) {
        ragService.trackRAGUsage(true, 100);
        const ragContent = ragService.formatRAGContext(ragResult.context);
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', content: ragContent, timestamp: new Date(), source: 'joud_academy' }]);
        saveMessage('ai', ragContent, 'joud_academy');
        setIsSending(false);
        return;
      }

      ragService.trackRAGUsage(false);
      const recentMessages = messages.slice(-6).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));
      const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        buildLevelAdaptedSystemPrompt(currentLevel),
        ...recentMessages,
        { role: 'user', content: userContent },
      ];

      const aiResponse = await aiService.sendChatMessage(
        settings.provider as 'openai' | 'mistral' | 'claude',
        settings.apiKey || '',
        fullMessages,
        { model: settings.model }
      );

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'ai', content: aiResponse, timestamp: new Date(), source: 'ai_api', provider: settings.provider }]);
      saveMessage('ai', aiResponse, 'ai_api', settings.provider);
      incrementUsage();
    } catch (error: unknown) {
      const errorContent = aiService.formatAIError(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), type: 'error', content: errorContent, timestamp: new Date() }]);
      saveMessage('error', errorContent);
      const errorMessage = error instanceof Error ? error.message : '';
      if (errorMessage.includes('api key') || errorMessage.includes('401')) {
        Alert.alert(
          'Problème de clé API',
          'Ta clé API semble invalide. Veux-tu la reconfigurer ?',
          [{ text: 'Reconfigurer', onPress: () => router.push('/settings/ai') }, { text: 'Annuler', style: 'cancel' }]
        );
      }
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, checkAIConfiguration, messages, currentLevel, settings, saveMessage, incrementUsage, router]);

  if (isDBLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={identity.palette.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <Ionicons name="arrow-back" size={24} color={identity.palette.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>AI Tutor</Text>
          <Text style={styles.headerSubtitle}>
            Niveau {currentLevel} • {settings.isConfigured ? 'Connecté' : 'Non configuré'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={newConversation}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Nouvelle conversation"
          >
            <Ionicons name="add-circle-outline" size={24} color={identity.palette.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/settings/ai')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Paramètres IA"
          >
            <Ionicons name="settings-outline" size={24} color={identity.palette.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {conversations.length > 1 && (
        <View style={styles.convBar}>
          {conversations.map(conv => {
            const isActive = conv.id === currentConversationId;
            return (
              <TouchableOpacity
                key={conv.id}
                style={[styles.convChip, isActive && styles.convChipActive]}
                onPress={() => switchConversation(conv.id)}
                activeOpacity={0.8}
                accessibilityRole="radio"
                accessibilityLabel={conv.title || 'Nouvelle'}
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[styles.convChipText, isActive && styles.convChipTextActive]}>{conv.title || 'Nouvelle'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
        <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
          {messages.map(msg => <ChatMessageBubble key={msg.id} message={msg} styles={styles} identity={identity} />)}
          {isSending && <ChatSendingIndicator styles={styles} identity={identity} />}
        </ScrollView>

        <ChatInputBar
          styles={styles}
          identity={identity}
          inputText={inputText}
          onChangeText={setInputText}
          onSend={handleSend}
          isSending={isSending}
          placeholder="Pose ta question..."
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default AITutorFreeScreen;
