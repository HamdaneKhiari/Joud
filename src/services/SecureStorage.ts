/**
 * ============================================
 * SECURE STORAGE SERVICE
 * Gestion sécurisée des clés API avec expo-secure-store
 *
 * SÉCURITÉ :
 * - Stockage chiffré (AES-256)
 * - Protégé par le keychain iOS / Keystore Android
 * - Jamais exposé dans SQLite ou logs
 * - Isolation par utilisateur (iOS) / par app (Android)
 * ============================================
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { log } from '@/utils/logUtils';

// ============================================
// CONSTANTES
// ============================================

const KEYS = {
  API_KEY: 'ai_api_key',           // Clé API (chiffrée)
  PROVIDER: 'ai_provider',         // Provider actuel (optionnel, backup)
} as const;

// Options de sécurité renforcées
const SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  // iOS : Accessibilité uniquement quand l'appareil est déverrouillé
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  // Android : Nécessite authentification biométrique (si disponible)
  requireAuthentication: false, // Mettre true pour forcer Touch ID/Face ID
};

// ============================================
// SERVICE
// ============================================

class SecureStorageService {
  /**
   * Vérifie si le SecureStore est disponible sur la plateforme
   */
  isAvailable(): boolean {
    // SecureStore fonctionne sur iOS et Android natif
    // Pas disponible sur web
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Stocke la clé API de manière sécurisée
   *
   * @param apiKey - Clé API à chiffrer et stocker
   * @throws Error si le stockage échoue
   */
  async saveAPIKey(apiKey: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('SecureStore non disponible sur cette plateforme');
    }

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('La clé API ne peut pas être vide');
    }

    try {
      await SecureStore.setItemAsync(KEYS.API_KEY, apiKey.trim(), SECURE_OPTIONS);
      log.info('[SecureStorage] Clé API stockée avec succès (chiffrée)');
    } catch (error) {
      log.error('[SecureStorage] Erreur lors du stockage:', error);
      throw new Error('Impossible de stocker la clé API de manière sécurisée');
    }
  }

  /**
   * Récupère la clé API stockée
   *
   * @returns Clé API déchiffrée ou null si non trouvée
   */
  async getAPIKey(): Promise<string | null> {
    if (!this.isAvailable()) {
      log.warn('[SecureStorage] SecureStore non disponible');
      return null;
    }

    try {
      const apiKey = await SecureStore.getItemAsync(KEYS.API_KEY, SECURE_OPTIONS);

      if (apiKey) {
        log.debug('[SecureStorage] Clé API récupérée (longueur:', apiKey.length, 'chars)');
      } else {
        log.debug('[SecureStorage] Aucune clé API stockée');
      }

      return apiKey;
    } catch (error) {
      log.error('[SecureStorage] Erreur lors de la récupération:', error);
      return null;
    }
  }

  /**
   * Supprime la clé API stockée
   * Utile lors de la déconnexion ou du changement de provider
   */
  async deleteAPIKey(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await SecureStore.deleteItemAsync(KEYS.API_KEY, SECURE_OPTIONS);
      log.info('[SecureStorage] Clé API supprimée');
    } catch (error) {
      log.error('[SecureStorage] Erreur lors de la suppression:', error);
      throw new Error('Impossible de supprimer la clé API');
    }
  }

  /**
   * Vérifie si une clé API existe (sans la lire)
   * Utile pour savoir si l'utilisateur a configuré l'IA
   */
  async hasAPIKey(): Promise<boolean> {
    const key = await this.getAPIKey();
    return key !== null && key.length > 0;
  }

  /**
   * Valide le format d'une clé API selon le provider
   *
   * @param apiKey - Clé à valider
   * @param provider - Provider ('openai' | 'mistral' | 'claude')
   * @returns true si valide, false sinon
   */
  validateAPIKeyFormat(apiKey: string, provider: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }

    const trimmed = apiKey.trim();

    switch (provider) {
      case 'openai':
        // OpenAI : sk-... (32+ chars)
        return trimmed.startsWith('sk-') && trimmed.length >= 32;

      case 'mistral':
        // Mistral : commence souvent par une lettre (flexible)
        return trimmed.length >= 20;

      case 'claude':
        // Claude/Anthropic : sk-ant-... (format spécifique)
        return trimmed.startsWith('sk-ant-') && trimmed.length >= 40;

      default:
        // Provider inconnu : au moins 20 chars
        return trimmed.length >= 20;
    }
  }

  /**
   * Masque une clé API pour l'affichage
   * Ex: "sk-abc123def456ghi789" → "sk-abc...i789"
   */
  maskAPIKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 10) {
      return '***';
    }

    const start = apiKey.substring(0, 6);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}...${end}`;
  }

  /**
   * Efface TOUTES les données sécurisées
   * ⚠️ À utiliser uniquement lors de la réinitialisation complète
   */
  async clearAll(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      await this.deleteAPIKey();
      log.info('[SecureStorage] Toutes les données sécurisées effacées');
    } catch (error) {
      log.error('[SecureStorage] Erreur lors de l\'effacement:', error);
    }
  }
}

// ============================================
// EXPORT SINGLETON
// ============================================

export const secureStorage = new SecureStorageService();
export default secureStorage;
