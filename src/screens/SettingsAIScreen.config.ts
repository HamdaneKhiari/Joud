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
    text: 'Coach IA = Optionnel\n\nLe Coach IA te permet de discuter avec une intelligence artificielle pour progresser en anglais. Deux modes disponibles : Chat libre (conversation ouverte) et Mode guidé (exercices ciblés).',
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
    text: 'Les coûts liés à l\'utilisation de l\'API sont à ta charge. Les limites d\'usage sont gérées directement par ton fournisseur d\'API.',
  },
} as const;
