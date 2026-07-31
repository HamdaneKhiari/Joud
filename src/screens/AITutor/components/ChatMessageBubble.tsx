import React from 'react';
import { View, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { Identity } from '@/themes/ThemeContext';
import { MarkdownText } from '@/components/ui/MarkdownText';
import { createChatStyles } from '../chatStyles';
import type { ChatUIMessage } from '../helpers';

interface ChatMessageBubbleProps {
  message: ChatUIMessage;
  styles: ReturnType<typeof createChatStyles>;
  identity: Identity;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({ message, styles, identity }) => {
  const isAI = message.type === 'ai';
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const isRAG = isAI && message.source === 'joud_academy';

  return (
    <View style={[styles.messageBubble, isAI && styles.messageBubbleAI, isUser && styles.messageBubbleUser]}>
      {isAI && (
        <View style={styles.aiAvatarContainer}>
          <Text style={styles.aiAvatar}>{isRAG ? '📚' : '🤖'}</Text>
        </View>
      )}
      <View style={[styles.messageContent, isAI && styles.messageContentAI, isUser && styles.messageContentUser, isError && styles.messageContentError]}>
        {isRAG && (
          <View style={styles.ragBadge}>
            <MaterialCommunityIcons name="school" size={12} color={identity.palette.accent} />
            <Text style={styles.ragBadgeText}>Source : Joud Academy</Text>
          </View>
        )}
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
};

export default ChatMessageBubble;
