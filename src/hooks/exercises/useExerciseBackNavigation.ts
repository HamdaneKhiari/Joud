// Retour arrière depuis un écran d'exercice, en attendant la fin de la sauvegarde SQLite.
//
// La sauvegarde de progression est débouncée (voir ProgressContext) et le filet de
// useExerciseSaveOnUnmount ne peut pas être attendu (React n'attend jamais un cleanup async
// avant un unmount). Résultat : si l'utilisateur tape "retour" juste après avoir terminé un
// exercice, l'écran précédent (sélection de sous-famille) peut se re-rafraîchir et lire la
// base AVANT que l'écriture SQLite n'ait eu lieu, affichant un pourcentage périmé.
// En attendant explicitement saveProgressNow() avant de naviguer, on garantit que la base
// est à jour au moment où l'écran précédent la relit.

import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useProgress } from '@/contexts/ProgressContext';
import useSafeNavigation from '../useSafeNavigation';

export default function useExerciseBackNavigation() {
  const navigation = useNavigation();
  const { saveProgressNow } = useProgress();

  const backAction = useCallback(async () => {
    await saveProgressNow();
    if (navigation.canGoBack()) navigation.goBack();
  }, [navigation, saveProgressNow]);

  return useSafeNavigation(backAction);
}
