import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Identity } from '@/themes/ThemeContext';
import { createChatStyles } from '../chatStyles';

interface ChatInputBarProps {
  styles: ReturnType<typeof createChatStyles>;
  identity: Identity;
  inputText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  isSending: boolean;
  placeholder: string;
}

const ChatInputBar: React.FC<ChatInputBarProps> = ({
  styles, identity, inputText, onChangeText, onSend, isSending, placeholder,
}) => (
  <View style={styles.inputContainer}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={identity.text.tertiary}
      value={inputText}
      onChangeText={onChangeText}
      multiline
      maxLength={500}
      editable={!isSending}
      returnKeyType="send"
      blurOnSubmit={false}
      onSubmitEditing={onSend}
      textAlignVertical="center"
    />
    <TouchableOpacity
      style={[styles.sendButton, (!inputText.trim() || isSending) && styles.sendButtonDisabled]}
      onPress={onSend}
      disabled={!inputText.trim() || isSending}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Envoyer"
      accessibilityState={{ disabled: !inputText.trim() || isSending }}
    >
      <Ionicons name="arrow-forward" size={20} color={identity.text.onPrimary} />
    </TouchableOpacity>
  </View>
);

export default ChatInputBar;
