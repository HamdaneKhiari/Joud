/**
 * Configuration pour SettingsAIScreen
 */

import type { AISettings } from '@/hooks/useAISettings';

type Provider = AISettings['provider'];

export const PROVIDERS: Array<{ id: Provider; name: string; icon: string }> = [
  { id: 'openai', name: 'OpenAI (GPT)', icon: '🤖' },
  { id: 'mistral', name: 'Mistral AI', icon: '⚡' },
  { id: 'claude', name: 'Claude (Anthropic)', icon: '🧠' },
];

export const INFO_BOXES = {
  optional: {
    icon: 'information-circle' as const,
    color: 'accent',
    text: 'Coach IA = Optionnel\n\nL\'app fonctionne parfaitement sans cette fonctionnalité. Configure-la uniquement si tu veux des conseils personnalisés de l\'IA.',
  },
  security: {
    icon: 'shield-checkmark' as const,
    color: '#10B981',
    title: 'Chiffrement AES-256',
    text: 'Ta clé API est stockée de manière sécurisée dans le Keychain iOS / Keystore Android. Elle n\'est jamais partagée ni visible dans les logs.',
  },
  responsibility: {
    icon: 'warning' as const,
    color: '#F59E0B',
    title: 'Tu es responsable de ta clé',
    text: 'Les coûts liés à l\'utilisation de l\'API sont à ta charge. Configure une limite quotidienne pour éviter les frais excessifs.',
  },
} as const;
