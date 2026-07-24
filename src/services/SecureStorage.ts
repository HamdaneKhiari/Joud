/**
 * Gestion sécurisée des clés API avec expo-secure-store : stockage chiffré (AES-256),
 * protégé par le keychain iOS / Keystore Android, jamais exposé dans SQLite ou logs.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { log } from '@/utils/logUtils';

const KEYS = {
  API_KEY: 'ai_api_key',
  PROVIDER: 'ai_provider',
} as const;

// AsyncStorage est effacé à la désinstallation, contrairement au Keychain iOS qui peut
// survivre (ex: téléphone revendu sans reset usine, app réinstallée dessus). L'absence de
// ce marqueur signale soit un tout premier lancement, soit une réinstallation — dans les
// deux cas on purge une éventuelle clé résiduelle du Keychain avant qu'elle soit utilisable.
const INSTALL_MARKER_KEY = 'JOUD_INSTALL_MARKER';

// Options de sécurité de base (sans authentification biométrique)
const BASE_SECURE_OPTIONS: SecureStore.SecureStoreOptions = {
  // iOS : Accessibilité uniquement quand l'appareil est déverrouillé
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * Options de sécurité utilisées pour lire/écrire la clé API.
 * Ajoute Face ID / Touch ID / empreinte quand l'appareil le permet
 * (Keychain access control sur iOS, setUserAuthenticationRequired sur Android).
 * Sur un appareil sans biométrie configurée, on retombe sur les options de base
 * pour ne jamais bloquer la fonctionnalité BYOK.
 */
const getSecureOptions = (): SecureStore.SecureStoreOptions => {
  let canUseBiometrics = false;
  try {
    canUseBiometrics = SecureStore.canUseBiometricAuthentication();
  } catch {
    canUseBiometrics = false;
  }

  if (!canUseBiometrics) {
    return BASE_SECURE_OPTIONS;
  }

  return {
    ...BASE_SECURE_OPTIONS,
    requireAuthentication: true,
    authenticationPrompt: 'Authentifie-toi pour accéder à ta clé API IA',
  };
};

class SecureStorageService {
  isAvailable(): boolean {
    // SecureStore fonctionne sur iOS et Android natif uniquement, pas sur web
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  async saveAPIKey(apiKey: string): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error('SecureStore non disponible sur cette plateforme');
    }

    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('La clé API ne peut pas être vide');
    }

    try {
      try {
        await SecureStore.setItemAsync(KEYS.API_KEY, apiKey.trim(), getSecureOptions());
      } catch (authError) {
        // Repli sans authentification biométrique si celle-ci n'est pas disponible
        // (ex: build Expo Go, biométrie retirée entre-temps)
        log.warn('[SecureStorage] Stockage avec authentification indisponible, repli sans biométrie:', authError);
        await SecureStore.setItemAsync(KEYS.API_KEY, apiKey.trim(), BASE_SECURE_OPTIONS);
      }
      log.info('[SecureStorage] Clé API stockée avec succès (chiffrée)');
    } catch (error) {
      log.error('[SecureStorage] Erreur lors du stockage:', error);
      throw new Error('Impossible de stocker la clé API de manière sécurisée');
    }
  }

  async getAPIKey(): Promise<string | null> {
    if (!this.isAvailable()) {
      log.warn('[SecureStorage] SecureStore non disponible');
      return null;
    }

    try {
      let apiKey: string | null;
      try {
        apiKey = await SecureStore.getItemAsync(KEYS.API_KEY, getSecureOptions());
      } catch (authError) {
        log.warn('[SecureStorage] Lecture avec authentification indisponible, repli sans biométrie:', authError);
        apiKey = await SecureStore.getItemAsync(KEYS.API_KEY, BASE_SECURE_OPTIONS);
      }

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

  async deleteAPIKey(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    try {
      try {
        await SecureStore.deleteItemAsync(KEYS.API_KEY, getSecureOptions());
      } catch (authError) {
        log.warn('[SecureStorage] Suppression avec authentification indisponible, repli sans biométrie:', authError);
        await SecureStore.deleteItemAsync(KEYS.API_KEY, BASE_SECURE_OPTIONS);
      }
      log.info('[SecureStorage] Clé API supprimée');
    } catch (error) {
      log.error('[SecureStorage] Erreur lors de la suppression:', error);
      throw new Error('Impossible de supprimer la clé API');
    }
  }

  async hasAPIKey(): Promise<boolean> {
    const key = await this.getAPIKey();
    return key !== null && key.length > 0;
  }

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

  // Ex: "sk-abc123def456ghi789" → "sk-abc...i789"
  maskAPIKey(apiKey: string): string {
    if (!apiKey || apiKey.length < 10) {
      return '***';
    }

    const start = apiKey.substring(0, 6);
    const end = apiKey.substring(apiKey.length - 4);
    return `${start}...${end}`;
  }

  /**
   * Purge la clé API si l'app vient d'être (ré)installée — à appeler une fois au
   * démarrage, avant toute lecture de clé. Sans effet sur un lancement normal
   * (marqueur déjà présent) : ne touche jamais un utilisateur en usage courant.
   */
  async purgeIfStaleInstall(): Promise<void> {
    try {
      const hasMarker = await AsyncStorage.getItem(INSTALL_MARKER_KEY);
      if (hasMarker) return;

      await this.deleteAPIKey();
      await AsyncStorage.setItem(INSTALL_MARKER_KEY, '1');
      log.info('[SecureStorage] Nouvelle installation détectée — clé API résiduelle purgée');
    } catch (error) {
      log.warn('[SecureStorage] purgeIfStaleInstall error:', error);
    }
  }

  // À utiliser uniquement lors de la réinitialisation complète
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

export const secureStorage = new SecureStorageService();
export default secureStorage;
