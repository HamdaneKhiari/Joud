// ============================================
// FICHIER: src/screens/exercises/AITutor/AITutorScreen.js
// ✅ VERSION FINALE - Avec vraie IA + RAG Local + Adaptation Niveau
// ============================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Contexts & Services
import { useAI } from '../../../contexts/AIContext';
import { useCurrentLevel } from '../../../contexts/CurrentLevelContext';
import aiService from '../../../services/ai/aiService';
import ragService from '../../../services/ai/ragService';
import useSafeNavigation from '../../../hooks/useSafeNavigation';

// Styles
import { styles } from './style';

const AITutorScreen = ({ navigation, route }) => {
  const router = useRouter();
  const {
    settings,
    canSendMessage,
    incrementUsage,
    addChatMessage,
    chatHistory,
  } = useAI();
  const { currentLevel } = useCurrentLevel();
  const safeGoBack = useSafeNavigation(() => navigation?.goBack?.() || router.back());

  // État local
  const [messages, setMessages] = useState([
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
  const scrollViewRef = useRef(null);

  // =================== MESSAGES D'ACCUEIL PAR NIVEAU ===================
  function getLevelWelcomeMessage(level) {
    switch (level) {
      case 1:
        return "Pose-moi des questions simples sur l'anglais, je vais t'aider ! 😊";
      case 2:
        return "Tu peux me poser des questions sur la grammaire, le vocabulaire... Je suis là pour toi ! 📚";
      case 3:
        return "N'hésite pas à me demander des explications sur des concepts plus complexes. On va progresser ensemble ! 🚀";
      case 4:
        return "Discutons en anglais ou en français, je m'adapte à ton niveau avancé. Let's chat! 🎯";
      default:
        return "Pose-moi n'importe quelle question sur l'anglais !";
    }
  }

  // =================== ADAPTATION DU TON SELON LE NIVEAU ===================
  function buildLevelAdaptedSystemPrompt(level) {
    const baseTone = {
      1: "Utilise un langage très simple et encourageant. Évite les termes complexes. Utilise des émojis pour rendre la conversation fun. Réponds en 2-3 phrases courtes maximum.",
      2: "Utilise un langage clair et pédagogique. Tu peux introduire quelques termes techniques en les expliquant. Réponds en 3-4 phrases.",
      3: "Utilise un langage précis. Tu peux utiliser des termes grammaticaux et donner des explications plus nuancées. Réponds en 4-5 phrases.",
      4: "Utilise un langage riche et précis. Tu peux discuter de concepts avancés et donner des exemples variés. N'hésite pas à mélanger français et anglais si pertinent. Réponds en 5-6 phrases.",
    };

    return aiService.buildSystemMessage(
      `Student level: ${level}/4 (${level === 1 ? 'beginner' : level === 2 ? 'intermediate' : level === 3 ? 'advanced' : 'expert'})

Tone adaptation:
${baseTone[level] || baseTone[2]}

IMPORTANT: If you detect that the question is about a grammar rule or vocabulary that exists in Joud's lesson data, mention it so the student knows it's certified content.`
    );
  }

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
        'Tu dois d\'abord configurer ton IA pour utiliser le chat.',
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

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    addChatMessage(userMessage);
    setInputText('');
    setIsLoading(true);

    try {
      // ========== ÉTAPE 1 : CHECK RAG LOCAL ==========
      const ragResult = ragService.shouldUseRAG(userMessage.content, currentLevel);

      if (ragResult.useRAG && ragResult.context) {
        // RAG Local trouvé ! Réponse locale
        ragService.trackRAGUsage(true, 100);

        const localResponse = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: ragService.formatRAGContext(ragResult.context),
          timestamp: new Date(),
          source: 'joud_academy', // ← IMPORTANT: Indicateur visuel
          ragContext: ragResult.context,
        };

        setMessages(prev => [...prev, localResponse]);
        addChatMessage(localResponse);
        setIsLoading(false);
        return;
      }

      // ========== ÉTAPE 2 : APPEL API IA ==========
      ragService.trackRAGUsage(false);

      // Construire l'historique pour l'IA (limité aux 6 derniers messages)
      const recentMessages = messages.slice(-6).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Ajouter le message système adapté au niveau
      const systemPrompt = buildLevelAdaptedSystemPrompt(currentLevel);
      const fullMessages = [systemPrompt, ...recentMessages, {
        role: 'user',
        content: userMessage.content,
      }];

      // Appel API
      const aiResponse = await aiService.sendChatMessage(
        settings.provider,
        settings.apiKey,
        fullMessages,
        { model: settings.model }
      );

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        source: 'ai_api',
        provider: settings.provider,
      };

      setMessages(prev => [...prev, aiMessage]);
      addChatMessage(aiMessage);
      incrementUsage();

    } catch (error) {
      console.error('[AITutor] Error:', error);

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'error',
        content: aiService.formatAIError(error),
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, errorMessage]);

      // Si c'est une erreur de clé API, proposer de reconfigurer
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
  const renderMessage = (message) => {
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
        {/* Avatar IA */}
        {isAI && (
          <View style={styles.aiAvatarContainer}>
            <Text style={styles.aiAvatar}>
              {message.source === 'joud_academy' ? '📚' : '🤖'}
            </Text>
          </View>
        )}

        {/* Contenu du message */}
        <View
          style={[
            styles.messageContent,
            isAI && styles.messageContentAI,
            isUser && styles.messageContentUser,
            isError && styles.messageContentError,
          ]}
        >
          {/* Badge source pour RAG */}
          {isAI && message.source === 'joud_academy' && (
            <View style={styles.ragBadge}>
              <MaterialCommunityIcons name="school" size={12} color="#667eea" />
              <Text style={styles.ragBadgeText}>Source : Joud Academy</Text>
            </View>
          )}

          {/* Texte du message */}
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

          {/* Footer avec provider si API */}
          {isAI && message.source === 'ai_api' && message.provider && (
            <Text style={styles.messageProvider}>
              via {message.provider === 'openai' ? 'OpenAI' : message.provider === 'mistral' ? 'Mistral' : 'Claude'}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" />

      {/* =================== HEADER =================== */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={safeGoBack.navigate}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
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
          <Ionicons name="settings-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* =================== MESSAGES ZONE =================== */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => renderMessage(msg))}

          {/* Loading indicator */}
          {isLoading && (
            <View style={[styles.messageBubble, styles.messageBubbleAI]}>
              <View style={styles.aiAvatarContainer}>
                <Text style={styles.aiAvatar}>🤖</Text>
              </View>
              <View style={[styles.messageContent, styles.messageContentAI]}>
                <ActivityIndicator size="small" color="#667eea" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* =================== INPUT ZONE =================== */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Pose ta question en français ou en anglais..."
            placeholderTextColor="#95A5A6"
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
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            <Ionicons
              name="arrow-forward"
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

AITutorScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
};

export default AITutorScreen;
