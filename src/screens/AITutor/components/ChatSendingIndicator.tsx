import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import type { Identity } from '@/themes/ThemeContext';
import { createChatStyles } from '../chatStyles';

interface ChatSendingIndicatorProps {
  styles: ReturnType<typeof createChatStyles>;
  identity: Identity;
}

const ChatSendingIndicator: React.FC<ChatSendingIndicatorProps> = ({ styles, identity }) => (
  <View style={[styles.messageBubble, styles.messageBubbleAI]}>
    <View style={styles.aiAvatarContainer}><Text style={styles.aiAvatar}>🤖</Text></View>
    <View style={[styles.messageContent, styles.messageContentAI]}>
      <ActivityIndicator size="small" color={identity.palette.primary} />
    </View>
  </View>
);

export default ChatSendingIndicator;
