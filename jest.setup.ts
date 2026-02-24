/**
 * Jest setup file - runs before each test suite
 *
 * Pre-defines Expo SDK 54 globals to prevent the winter runtime lazy getter
 * from firing inside Jest's module scope (which causes a ReferenceError).
 * expo/src/winter/installGlobal.ts checks `if (!existing)` — so pre-defining
 * these prevents the problematic lazy require() from being registered.
 */

// Suppress Expo's winter runtime __ExpoImportMetaRegistry lazy getter
(global as any).__ExpoImportMetaRegistry = { url: null };
