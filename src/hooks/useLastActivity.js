import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../../utils/constants';

const useLastActivity = () => {
  const [lastActivity, setLastActivity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger la dernière activité depuis le stockage
  const loadLastActivity = useCallback(async () => {
    try {
      setIsLoading(true);
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (stored) {
        setLastActivity(JSON.parse(stored));
      }
    } catch (error) {
      // On reste silencieux en prod ou on utilise un console.error basique
      console.error('Erreur chargement activité:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder une nouvelle activité
  const saveActivity = useCallback(async (activityData) => {
    try {
      const activity = {
        ...activityData,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, JSON.stringify(activity));
      setLastActivity(activity);
    } catch (error) {
      console.error('Erreur sauvegarde activité:', error);
    }
  }, []);

  useEffect(() => {
    loadLastActivity();
  }, [loadLastActivity]);

  return { lastActivity, saveActivity, isLoading, refresh: loadLastActivity };
};

export default useLastActivity;