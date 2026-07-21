// Coach IA interactif par domaine : phase 1 = sélection du domaine, phase 2 = chat coaching
// avec message d'ouverture personnalisé.
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useNavigation } from 'expo-router';
import { sanitizeUserInput } from '@/utils/inputSanitizer';

import { useTheme } from '@/themes/ThemeContext';
import { useCurrentLevel } from '@/contexts/CurrentLevelContext';
import { useAI } from '@/contexts/AIContext';
import aiService from '@/services/ai/aiService';
import GuidedHeader from './components/GuidedHeader';
import DomainCard from './components/DomainCard';
import { useGuidedDomainSummaries, DomainSummary } from './hooks/useGuidedDomainSummaries';
import { useChatConversation } from './hooks/useChatConversation';
import { createGuidedStyles } from './AITutorGuidedScreen.styles';
import { createChatStyles } from './chatStyles';
import {
  ChatUIMessage, toUIMessage,
  buildOpeningMessage, buildDomainSystemPrompt,
} from './helpers';
import { MarkdownText } from '@/components/ui/MarkdownText';

type Phase = 'selection' | 'chat';

const AITutorGuidedScreen: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { identity } = useTheme();
  const { currentLevel } = useCurrentLevel();
  const { settings, canSendMessage, incrementUsage } = useAI();
  const isPlayful = identity.ui.mood === 'playful';

  const { domains, isLoading: isDomainsLoading } = useGuidedDomainSummaries();
  const {
    messages: persistedMessages, isLoading: isDBLoading,
    saveMessage, newConversation,
  } = useChatConversation('guided');

  const [phase, setPhase] = useState<Phase>('selection');
  const [selectedDomain, setSelectedDomain] = useState<DomainSummary | null>(null);
  const [messages, setMessages] = useState<ChatUIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const openingSavedRef = useRef<boolean>(false);

  const styles = useMemo(
    () => ({ ...createGuidedStyles(identity), ...createChatStyles(identity, isPlayful) }),
    [identity, isPlayful]
  );

  useEffect(() => {
    if (phase !== 'chat' || isDBLoading) return;
    if (persistedMessages.length > 0) setMessages(persistedMessages.map(toUIMessage));
  }, [persistedMessages, isDBLoading, phase]);

  useEffect(() => {
    if (phase !== 'chat') return;
    setTimeout(() => { scrollViewRef.current?.scrollToEnd({ animated: true }); }, 100);
  }, [messages, phase]);

  const safeGoBack = useCallback(() => {
    if (navigation.canGoBack()) router.back();
    else router.replace('/');
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
    const convId = await newConversation();
    if (convId) {
      const openingContent = buildOpeningMessage(domain);
      setMessages([{ id: 'opening', type: 'ai', content: openingContent, timestamp: new Date(), source: 'ai' }]);
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

    const userContent = sanitizeUserInput(inputText.trim(), 500);
    setMessages(prev => [...prev, { id: Date.now().toString(), type: 'user', content: userContent, timestamp: new Date() }]);
    setInputText('');
    setIsSending(true);
    saveMessage('user', userContent);

    try {
      const recentMsgs = messages.slice(-6).map(msg => ({
        role: (msg.type === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: msg.content,
      }));
      const fullMessages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
        buildDomainSystemPrompt(selectedDomain, currentLevel),
        ...recentMsgs,
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
    } finally {
      setIsSending(false);
    }
  }, [inputText, isSending, selectedDomain, checkAIConfiguration, messages, currentLevel, settings, saveMessage, incrementUsage]);

  const renderMessage = useCallback((message: ChatUIMessage) => {
    const isAI = message.type === 'ai';
    const isUser = message.type === 'user';
    const isError = message.type === 'error';
    return (
      <View key={message.id} style={[styles.messageBubble, isAI && styles.messageBubbleAI, isUser && styles.messageBubbleUser]}>
        {isAI && (
          <View style={styles.aiAvatarContainer}>
            <Text style={styles.aiAvatar}>🤖</Text>
          </View>
        )}
        <View style={[styles.messageContent, isAI && styles.messageContentAI, isUser && styles.messageContentUser, isError && styles.messageContentError]}>
          {isAI ? (
            <MarkdownText
              content={message.content}
              textStyle={[styles.messageText, styles.messageTextAI]}
            />
          ) : (
            <Text style={[styles.messageText, isUser && styles.messageTextUser, isError && styles.messageTextError]}>
              {message.content}
            </Text>
          )}
          {isAI && message.source === 'ai_api' && message.provider && (
            <Text style={styles.messageProvider}>
              via {message.provider === 'openai' ? 'OpenAI' : message.provider === 'mistral' ? 'Mistral' : 'Claude'}
            </Text>
          )}
        </View>
      </View>
    );
  }, [styles]);

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

  // Phase chat
  if (phase === 'chat' && selectedDomain) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
        <GuidedHeader onBack={handleGoBack} subtitle={`${selectedDomain.emoji} ${selectedDomain.label}`} />
        <KeyboardAvoidingView style={styles.keyboardView} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
          <ScrollView ref={scrollViewRef} style={styles.messagesContainer} contentContainerStyle={styles.messagesContent} showsVerticalScrollIndicator={false}>
            {messages.map(msg => renderMessage(msg))}
            {isSending && (
              <View style={[styles.messageBubble, styles.messageBubbleAI]}>
                <View style={styles.aiAvatarContainer}><Text style={styles.aiAvatar}>🤖</Text></View>
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
            <TouchableOpacity style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]} onPress={handleSend} disabled={!inputText.trim() || isSending} activeOpacity={0.8}>
              <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Phase sélection
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <GuidedHeader onBack={safeGoBack} subtitle="Choisis un domaine" />
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
            <DomainCard key={domain.domain} domain={domain} onPress={() => handleSelectDomain(domain)} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default AITutorGuidedScreen;
