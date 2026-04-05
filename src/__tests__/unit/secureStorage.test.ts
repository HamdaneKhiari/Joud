/**
 * Unit tests — SecureStorage service
 *
 * Couvre : isAvailable, saveAPIKey, getAPIKey, deleteAPIKey, hasAPIKey,
 *          validateAPIKeyFormat, maskAPIKey, clearAll.
 */

// ============================================
// Mocks
// ============================================

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

// Note : react-native mock global fournit Platform.OS = 'ios'

// ============================================
// Imports — après tous les jest.mock()
// ============================================

import { secureStorage } from '@/services/SecureStorage';

const SecureStore = () => require('expo-secure-store');

// ============================================
// isAvailable
// ============================================

describe('isAvailable', () => {
  it('retourne true sur iOS (Platform.OS = "ios")', () => {
    // Le mock react-native global a Platform.OS = 'ios'
    expect(secureStorage.isAvailable()).toBe(true);
  });
});

// ============================================
// saveAPIKey
// ============================================

describe('saveAPIKey', () => {
  beforeEach(() => jest.clearAllMocks());

  it('stocke la clé API trimée', async () => {
    SecureStore().setItemAsync.mockResolvedValue(undefined);

    await secureStorage.saveAPIKey('  sk-abc123def456ghi789jkl  ');

    expect(SecureStore().setItemAsync).toHaveBeenCalledWith(
      'ai_api_key',
      'sk-abc123def456ghi789jkl',
      expect.any(Object)
    );
  });

  it('lance une erreur si clé vide', async () => {
    await expect(secureStorage.saveAPIKey('')).rejects.toThrow('ne peut pas être vide');
    await expect(secureStorage.saveAPIKey('  ')).rejects.toThrow('ne peut pas être vide');
  });

  it('lance une erreur si le store échoue', async () => {
    SecureStore().setItemAsync.mockRejectedValue(new Error('Keychain error'));

    await expect(secureStorage.saveAPIKey('sk-validkey123')).rejects.toThrow(
      'Impossible de stocker la clé API'
    );
  });
});

// ============================================
// getAPIKey
// ============================================

describe('getAPIKey', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne la clé si elle existe', async () => {
    SecureStore().getItemAsync.mockResolvedValue('sk-mykey123');

    const key = await secureStorage.getAPIKey();
    expect(key).toBe('sk-mykey123');
  });

  it('retourne null si aucune clé', async () => {
    SecureStore().getItemAsync.mockResolvedValue(null);

    const key = await secureStorage.getAPIKey();
    expect(key).toBeNull();
  });

  it('retourne null si le store échoue', async () => {
    SecureStore().getItemAsync.mockRejectedValue(new Error('Read error'));

    const key = await secureStorage.getAPIKey();
    expect(key).toBeNull();
  });
});

// ============================================
// deleteAPIKey
// ============================================

describe('deleteAPIKey', () => {
  beforeEach(() => jest.clearAllMocks());

  it('supprime la clé API', async () => {
    SecureStore().deleteItemAsync.mockResolvedValue(undefined);

    await secureStorage.deleteAPIKey();

    expect(SecureStore().deleteItemAsync).toHaveBeenCalledWith('ai_api_key', expect.any(Object));
  });

  it('lance une erreur si la suppression échoue', async () => {
    SecureStore().deleteItemAsync.mockRejectedValue(new Error('Delete error'));

    await expect(secureStorage.deleteAPIKey()).rejects.toThrow('Impossible de supprimer');
  });
});

// ============================================
// hasAPIKey
// ============================================

describe('hasAPIKey', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retourne true si une clé existe', async () => {
    SecureStore().getItemAsync.mockResolvedValue('sk-valid-key-123');
    expect(await secureStorage.hasAPIKey()).toBe(true);
  });

  it('retourne false si aucune clé', async () => {
    SecureStore().getItemAsync.mockResolvedValue(null);
    expect(await secureStorage.hasAPIKey()).toBe(false);
  });

  it('retourne false si chaîne vide', async () => {
    SecureStore().getItemAsync.mockResolvedValue('');
    expect(await secureStorage.hasAPIKey()).toBe(false);
  });
});

// ============================================
// validateAPIKeyFormat
// ============================================

describe('validateAPIKeyFormat', () => {
  it('OpenAI : valide si commence par "sk-" et >= 32 chars', () => {
    const validKey = 'sk-' + 'a'.repeat(30); // 33 chars
    expect(secureStorage.validateAPIKeyFormat(validKey, 'openai')).toBe(true);
  });

  it('OpenAI : invalide si ne commence pas par "sk-"', () => {
    expect(secureStorage.validateAPIKeyFormat('abc-short-key', 'openai')).toBe(false);
  });

  it('OpenAI : invalide si trop court', () => {
    expect(secureStorage.validateAPIKeyFormat('sk-short', 'openai')).toBe(false);
  });

  it('Mistral : valide si >= 20 chars', () => {
    expect(secureStorage.validateAPIKeyFormat('a'.repeat(20), 'mistral')).toBe(true);
  });

  it('Mistral : invalide si < 20 chars', () => {
    expect(secureStorage.validateAPIKeyFormat('short', 'mistral')).toBe(false);
  });

  it('Claude : valide si commence par "sk-ant-" et >= 40 chars', () => {
    const validKey = 'sk-ant-' + 'a'.repeat(34); // 41 chars
    expect(secureStorage.validateAPIKeyFormat(validKey, 'claude')).toBe(true);
  });

  it('Claude : invalide si mauvais préfixe', () => {
    expect(secureStorage.validateAPIKeyFormat('sk-' + 'a'.repeat(40), 'claude')).toBe(false);
  });

  it('Provider inconnu : valide si >= 20 chars', () => {
    expect(secureStorage.validateAPIKeyFormat('a'.repeat(25), 'unknown')).toBe(true);
    expect(secureStorage.validateAPIKeyFormat('short', 'unknown')).toBe(false);
  });

  it('retourne false si clé vide', () => {
    expect(secureStorage.validateAPIKeyFormat('', 'openai')).toBe(false);
    expect(secureStorage.validateAPIKeyFormat('  ', 'openai')).toBe(false);
  });
});

// ============================================
// maskAPIKey
// ============================================

describe('maskAPIKey', () => {
  it('masque correctement une clé longue', () => {
    const masked = secureStorage.maskAPIKey('sk-abc123def456ghi789');
    expect(masked).toBe('sk-abc...i789');
  });

  it('retourne "***" si clé trop courte (< 10 chars)', () => {
    expect(secureStorage.maskAPIKey('short')).toBe('***');
  });

  it('retourne "***" si clé vide', () => {
    expect(secureStorage.maskAPIKey('')).toBe('***');
  });
});

// ============================================
// clearAll
// ============================================

describe('clearAll', () => {
  beforeEach(() => jest.clearAllMocks());

  it('supprime toutes les données sécurisées', async () => {
    SecureStore().deleteItemAsync.mockResolvedValue(undefined);

    await secureStorage.clearAll();

    expect(SecureStore().deleteItemAsync).toHaveBeenCalledWith('ai_api_key', expect.any(Object));
  });

  it('ne plante pas si la suppression échoue', async () => {
    SecureStore().deleteItemAsync.mockRejectedValue(new Error('Error'));

    await expect(secureStorage.clearAll()).resolves.not.toThrow();
  });
});
