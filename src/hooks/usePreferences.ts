/**
 * usePreferences — Préférences utilisateur persistées en AsyncStorage
 * Sons de feedback + vibrations haptiques
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'JOUD_PREFERENCES';

export interface Preferences {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const DEFAULT_PREFS: Preferences = {
  soundEnabled: true,
  hapticsEnabled: true,
};

export const usePreferences = () => {
  const [prefs, setPrefs] = useState<Preferences>(DEFAULT_PREFS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(PREFS_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
          } catch { /* fallback to defaults */ }
        }
        setLoaded(true);
      })
      .catch(() => {
        // AsyncStorage indisponible — on garde les valeurs par défaut
        setLoaded(true);
      });
  }, []);

  const updatePref = useCallback(<K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: value };
      AsyncStorage.setItem(PREFS_KEY, JSON.stringify(updated)).catch(() => {
        // Échec silencieux acceptable — la préférence sera réinitialisée au prochain lancement
      });
      return updated;
    });
  }, []);

  return { prefs, loaded, updatePref };
};
