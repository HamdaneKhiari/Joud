/**
 * Configuration pour AITutorSelectionScreen
 */

export const MODES = [
  {
    key:         'free',
    route:       '/ai-tutor/free',
    emoji:       '💬',
    title:       'Chat libre',
    description: "Pose n'importe quelle question sur l'anglais, obtiens une réponse instantanée de l'IA.",
    features: [
      'Questions en français ou en anglais',
      'Explications adaptées à ton niveau',
      'Accès au contenu Joud Academy',
    ],
  },
  {
    key:         'guided',
    route:       '/ai-tutor/guided',
    emoji:       '🎯',
    title:       'Mode guidé',
    description: "L'IA analyse tes dernières erreurs d'exercice et te suggère des pistes pour progresser.",
    features: [
      'Analyse automatique de tes points faibles',
      'Suggestions personnalisées par module',
      'Suivi de ta progression',
    ],
  },
] as const;

export const ONBOARDING_FEATURES = [
  'Analyse tes erreurs automatiquement',
  'Conseils personnalisés selon ton niveau',
  'Chat libre pour poser tes questions',
  'Tu contrôles ta clé API (OpenAI, Mistral, Claude)',
] as const;
