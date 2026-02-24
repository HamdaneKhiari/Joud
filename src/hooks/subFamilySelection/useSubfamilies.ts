// src/hooks/subFamilySelection/useSubfamilies.ts
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useUser } from '@/contexts/UserContext';
import { useTheme } from '@/themes/ThemeContext';
import { getSubFamiliesByFamily, SubFamily } from '@/services/subfamilyService';

export default function useSubfamilies(familyId: number) {
  const { db, user } = useUser();
  const { identity } = useTheme();
  const [subfamilies, setSubfamilies] = useState<SubFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    // SÉCURITÉ : Pas de SQL si les objets ne sont pas prêts
    if (!db || typeof db === 'number' || !familyId || !identity?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await getSubFamiliesByFamily(db, familyId, identity.id, user?.id);
      setSubfamilies(data);
    } catch (error) {
      console.error('❌ Erreur Subfamilies:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, familyId, identity?.id, user?.id]);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  return { subfamilies, isLoading };
}