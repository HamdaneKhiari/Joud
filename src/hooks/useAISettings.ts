/**
 * ============================================
 * HOOK: useAISettings (SECURE)
 * Gestion des paramètres IA avec clé API chiffrée
 *
 * ARCHITECTURE HYBRIDE :
 * - Clé API → expo-secure-store (chiffrée AES-256)
 * - Autres settings → SQLite (provider, model, limites)
 * ============================================
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/contexts/UserContext';
import secureStorage from '@/services/SecureStorage';
import { log } from '@/utils/logUtils';

// ============================================
// TYPES
// ============================================

export interface AISettings {
  provider: 'openai' | 'mistral' | 'claude';
  apiKey: string | null;              // Chargée depuis SecureStore
  model: string;
  maxTokens: number;
  temperature: number;
  maxMessagesPerDay: number;
  currentUsageCount: number;
  lastResetDate: number;
  isConfigured: boolean;
}

// ============================================
// CONSTANTES
// ============================================

const MODELS_BY_PROVIDER = {
  openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
  mistral: ['mistral-tiny', 'mistral-small', 'mistral-medium'],
  claude: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
};

// ============================================
// HOOK
// ============================================

export const useAISettings = () => {
  const { db } = useUser();
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // =================== CHARGER LES SETTINGS (SQLite + SecureStore) ===================
  const loadSettings = useCallback(async () => {
    if (!db || typeof db === 'number') {
      setIsLoading(false);
      return;
    }

    try {
      // 1. Charger depuis SQLite (paramètres non-sensibles)
      const row = await db.getFirstAsync<{
        provider: string;
        model: string;
        max_tokens: number;
        temperature: number;
        max_messages_per_day: number;
        current_usage_count: number;
        last_reset_date: number;
        is_configured: number;
      }>('SELECT * FROM ai_settings WHERE id = 1');

      if (!row) {
        setIsLoading(false);
        return;
      }

      // 2. Charger la clé API depuis SecureStore (chiffrée)
      const apiKey = await secureStorage.getAPIKey();

      // 3. Combiner les deux sources
      setSettings({
        provider: row.provider as AISettings['provider'],
        apiKey, // Peut être null si jamais configurée
        model: row.model,
        maxTokens: row.max_tokens,
        temperature: row.temperature,
        maxMessagesPerDay: row.max_messages_per_day,
        currentUsageCount: row.current_usage_count,
        lastResetDate: row.last_reset_date,
        isConfigured: row.is_configured === 1 && apiKey !== null, // Configuré ssi clé présente
      });
    } catch (error) {
      console.error('[useAISettings] Load error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // =================== METTRE À JOUR LES SETTINGS ===================
  const updateSettings = useCallback(async (partial: Partial<AISettings>) => {
    if (!db || typeof db === 'number' || !settings) return;

    const updated = { ...settings, ...partial };

    try {
      // 1. Si la clé API change, la stocker dans SecureStore
      if (partial.apiKey !== undefined) {
        if (partial.apiKey && partial.apiKey.trim().length > 0) {
          // Valider le format avant de stocker
          if (!secureStorage.validateAPIKeyFormat(partial.apiKey, updated.provider)) {
            throw new Error('Format de clé API invalide pour ce provider');
          }
          await secureStorage.saveAPIKey(partial.apiKey);
        } else {
          // Supprimer si vide
          await secureStorage.deleteAPIKey();
        }
      }

      // 2. Mettre à jour SQLite (paramètres non-sensibles)
      await db.runAsync(
        `UPDATE ai_settings SET
          provider = ?,
          model = ?,
          max_tokens = ?,
          temperature = ?,
          max_messages_per_day = ?,
          is_configured = ?,
          updated_at = ?
         WHERE id = 1`,
        [
          updated.provider,
          updated.model,
          updated.maxTokens,
          updated.temperature,
          updated.maxMessagesPerDay,
          updated.isConfigured ? 1 : 0,
          Date.now(),
        ]
      );

      setSettings(updated);
      log.info('[useAISettings] Settings mis à jour (clé API chiffrée)');
    } catch (error) {
      console.error('[useAISettings] Update error:', error);
      throw error;
    }
  }, [db, settings]);

  // =================== INCRÉMENTER L'USAGE ===================
  const incrementUsage = useCallback(async () => {
    if (!db || typeof db === 'number' || !settings) return false;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Reset si dernier reset > 24h
    if (now - settings.lastResetDate > oneDayMs) {
      await db.runAsync(
        `UPDATE ai_settings SET
          current_usage_count = 1,
          last_reset_date = ?
         WHERE id = 1`,
        [now]
      );
      setSettings({ ...settings, currentUsageCount: 1, lastResetDate: now });
      return true;
    }

    // Vérifier la limite
    if (settings.currentUsageCount >= settings.maxMessagesPerDay) {
      return false; // Limite atteinte
    }

    // Incrémenter
    const newCount = settings.currentUsageCount + 1;
    await db.runAsync(
      `UPDATE ai_settings SET current_usage_count = ? WHERE id = 1`,
      [newCount]
    );
    setSettings({ ...settings, currentUsageCount: newCount });
    return true;
  }, [db, settings]);

  // =================== VÉRIFIER SI ON PEUT ENVOYER UN MESSAGE ===================
  const canSendMessage = useCallback((): boolean => {
    if (!settings) return false;
    if (!settings.isConfigured || !settings.apiKey) return false;

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Reset auto si > 24h
    if (now - settings.lastResetDate > oneDayMs) {
      return true;
    }

    return settings.currentUsageCount < settings.maxMessagesPerDay;
  }, [settings]);

  // =================== OBTENIR LES MODÈLES DISPONIBLES ===================
  const getAvailableModels = useCallback((): string[] => {
    if (!settings) return [];
    return MODELS_BY_PROVIDER[settings.provider];
  }, [settings]);

  // =================== SUPPRIMER LA CLÉ API ===================
  const deleteAPIKey = useCallback(async () => {
    try {
      await secureStorage.deleteAPIKey();
      if (settings) {
        setSettings({ ...settings, apiKey: null, isConfigured: false });
      }
      // Mettre à jour la DB
      if (db) {
        await db.runAsync(
          `UPDATE ai_settings SET is_configured = 0, updated_at = ? WHERE id = 1`,
          [Date.now()]
        );
      }
      log.info('[useAISettings] Clé API supprimée');
    } catch (error) {
      console.error('[useAISettings] Delete error:', error);
      throw error;
    }
  }, [db, settings]);

  // =================== RETOUR ===================
  return {
    settings,
    isLoading,
    updateSettings,
    incrementUsage,
    canSendMessage,
    getAvailableModels,
    deleteAPIKey,
    refreshSettings: loadSettings,
    // Helpers de sécurité
    secureStorage, // Expose le service pour usage avancé
  };
};
