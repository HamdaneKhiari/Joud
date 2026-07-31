import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Respecte le réglage OS "Réduire les animations" (iOS/Android) pour les animations
// pilotées par l'API Animated de react-native. Pour react-native-reanimated, préférer
// le modificateur natif `.reduceMotion(ReduceMotion.System)` sur chaque animation.
export const useReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => { if (mounted) setReduced(enabled); })
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      mounted = false;
      subscription.remove();
    };
  }, []);

  return reduced;
};

export default useReducedMotion;
