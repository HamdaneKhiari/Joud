/**
 * MarkdownText — Mini parser markdown pour bulles de chat IA
 * Supporte : **gras**, *italique*, `code inline`, listes (- et 1.)
 * Pas de tableaux ni images — optimisé pour du texte conversationnel.
 */

import React from 'react';
import { Text, View, Platform, StyleProp, TextStyle } from 'react-native';

interface MarkdownTextProps {
  content: string;
  textStyle?: StyleProp<TextStyle>;
}

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string };

const INLINE_REGEX = /\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`/g;
const CODE_FONT = Platform.OS === 'ios' ? 'Menlo' : 'monospace';

const parseInline = (text: string): InlineNode[] => {
  const nodes: InlineNode[] = [];
  INLINE_REGEX.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    if (match[1] !== undefined) nodes.push({ type: 'bold', value: match[1] });
    else if (match[2] !== undefined) nodes.push({ type: 'italic', value: match[2] });
    else if (match[3] !== undefined) nodes.push({ type: 'code', value: match[3] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    nodes.push({ type: 'text', value: text.slice(lastIndex) });
  }
  return nodes.length > 0 ? nodes : [{ type: 'text', value: text }];
};

const renderInline = (
  nodes: InlineNode[],
  textStyle: StyleProp<TextStyle>,
  keyPrefix: string,
): React.ReactNode =>
  nodes.map((node, i) => {
    const key = `${keyPrefix}-${i}`;
    switch (node.type) {
      case 'bold':
        return <Text key={key} style={[textStyle, { fontWeight: 'bold' }]}>{node.value}</Text>;
      case 'italic':
        return <Text key={key} style={[textStyle, { fontStyle: 'italic' }]}>{node.value}</Text>;
      case 'code':
        return <Text key={key} style={[textStyle, { fontFamily: CODE_FONT, opacity: 0.8 }]}>{node.value}</Text>;
      default:
        return <Text key={key} style={textStyle}>{node.value}</Text>;
    }
  });

export const MarkdownText: React.FC<MarkdownTextProps> = ({ content, textStyle }) => {
  const lines = content.split('\n');

  return (
    <View>
      {lines.map((line, i) => {
        if (!line.trim()) {
          return <View key={i} style={{ height: 6 }} />;
        }

        const bulletMatch = line.match(/^[ \t]*[-*•]\s+(.+)/);
        const numberedMatch = line.match(/^[ \t]*(\d+)\.\s+(.+)/);

        if (bulletMatch) {
          return (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={textStyle}>{'• '}</Text>
              <Text style={{ flex: 1 }}>
                {renderInline(parseInline(bulletMatch[1]), textStyle, `${i}`)}
              </Text>
            </View>
          );
        }

        if (numberedMatch) {
          return (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 2 }}>
              <Text style={textStyle}>{`${numberedMatch[1]}. `}</Text>
              <Text style={{ flex: 1 }}>
                {renderInline(parseInline(numberedMatch[2]), textStyle, `${i}`)}
              </Text>
            </View>
          );
        }

        return (
          <Text key={i} style={[textStyle, i > 0 ? { marginTop: 2 } : undefined]}>
            {renderInline(parseInline(line), textStyle, `${i}`)}
          </Text>
        );
      })}
    </View>
  );
};
