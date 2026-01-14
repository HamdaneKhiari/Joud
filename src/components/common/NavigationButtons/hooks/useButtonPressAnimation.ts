import { useRef } from 'react';
import { Animated } from 'react-native';

/**
 * Interface définissant le retour du hook
 */
interface ButtonPressAnimation {
  scaleAnim: Animated.Value;
  animate: (callback?: () => void) => void;
}

/**
 * useButtonPressAnimation - Hook pour gérer l'effet de rebond (scale down/up)
 */
export const useButtonPressAnimation = (): ButtonPressAnimation => {
  // On utilise useRef pour garder la même instance de Animated.Value
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Déclenche la séquence d'animation
   * @param callback - Fonction optionnelle à exécuter après l'effet
   */
  const animate = (callback?: () => void): void => {
    Animated.sequence([
      // 1. On compresse le bouton
      Animated.spring(scaleAnim, {
        toValue: 0.92,
        useNativeDriver: true,
        speed: 50,
        bounciness: 0,
      }),
      // 2. On relâche avec un effet de ressort
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
    ]).start(() => {
      // On lance l'action une fois l'animation terminée
      if (callback) callback();
    });
  };

  return { scaleAnim, animate };
};