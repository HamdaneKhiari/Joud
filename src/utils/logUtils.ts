/* eslint-disable no-console */
/**
 * Logger conditionnel White Label
 * Affiche les logs uniquement en mode __DEV__
 */

// Déclaration pour TypeScript au cas où __DEV__ n'est pas reconnu globalement
declare const __DEV__: boolean;

const isDevelopment = __DEV__;

export const log = {
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('📘 INFO:', ...args);
    }
  },

  warn: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.warn('⚠️ WARN:', ...args);
    }
  },

  // Toujours actif, même en PROD (pour le monitoring)
  error: (...args: unknown[]): void => {
    console.error('❌ ERROR:', ...args);
  },

  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('🔍 DEBUG:', ...args);
    }
  },

  success: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.log('✅ SUCCESS:', ...args);
    }
  }
};