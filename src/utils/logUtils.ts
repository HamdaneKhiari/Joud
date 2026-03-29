/* eslint-disable no-console */
/**
 * Logger conditionnel White Label
 * Affiche les logs uniquement en mode __DEV__
 */

// Déclaration pour TypeScript au cas où __DEV__ n'est pas reconnu globalement
declare const __DEV__: boolean;

const isDevelopment = __DEV__;

export const log = {
  /** * INFO: Utilise console.log en DEV uniquement 
   */
  info: (...args: any[]): void => {
    if (isDevelopment) {
      console.log('📘 INFO:', ...args);
    }
  },

  /** * WARN: Utilise console.warn en DEV uniquement 
   */
  warn: (...args: any[]): void => {
    if (isDevelopment) {
      console.warn('⚠️ WARN:', ...args);
    }
  },

  /** * ERROR: Toujours actif, même en PROD (pour le monitoring)
   */
  error: (...args: any[]): void => {
    console.error('❌ ERROR:', ...args);
  },

  /** * DEBUG: Logs techniques détaillés en DEV uniquement
   */
  debug: (...args: any[]): void => {
    if (isDevelopment) {
      console.log('🔍 DEBUG:', ...args);
    }
  },

  /**
   * SUCCESS: Petit ajout sympa pour voir les succès d'API par exemple
   */
  success: (...args: any[]): void => {
    if (isDevelopment) {
      console.log('✅ SUCCESS:', ...args);
    }
  }
};