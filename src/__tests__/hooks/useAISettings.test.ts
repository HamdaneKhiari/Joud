/**
 * Tests de hooks — useAISettings
 * Couvre : chargement (SQLite + SecureStore), updateSettings (validation clé, suppression si
 * vide), incrementUsage (reset 24h, limite), canSendMessage, getAvailableModels, deleteAPIKey.
 */

import { renderHook, waitFor, act } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

const mockDb = {
  getFirstAsync: jest.fn(),
  runAsync: jest.fn().mockResolvedValue({ changes: 1 }),
};

jest.mock('@/contexts/UserContext', () => ({
  useUser: jest.fn().mockReturnValue({ db: mockDb }),
}));

jest.mock('@/services/SecureStorage', () => ({
  __esModule: true,
  default: {
    getAPIKey: jest.fn(),
    saveAPIKey: jest.fn().mockResolvedValue(undefined),
    deleteAPIKey: jest.fn().mockResolvedValue(undefined),
    validateAPIKeyFormat: jest.fn().mockReturnValue(true),
  },
}));

jest.mock('@/utils/logUtils', () => ({
  log: { error: jest.fn(), warn: jest.fn(), debug: jest.fn(), info: jest.fn() },
}));

import { useAISettings } from '@/hooks/useAISettings';
import secureStorage from '@/services/SecureStorage';

const resetDbAndKeyMocks = () => {
  jest.clearAllMocks();
  mockDb.getFirstAsync.mockReset();
  (secureStorage.getAPIKey as jest.Mock).mockReset();
};

const DB_ROW = {
  provider: 'openai',
  model: 'gpt-3.5-turbo',
  max_tokens: 500,
  temperature: 0.7,
  max_messages_per_day: 50,
  current_usage_count: 0,
  last_reset_date: Date.now(),
  is_configured: 1,
};

// ============================================
// Chargement
// ============================================

describe('useAISettings — chargement', () => {
  beforeEach(() => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
  });

  it('sans DB → isLoading passe à false, settings reste null', async () => {
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: null });

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
  });

  it('DB sans ligne ai_settings → settings reste null', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
  });

  it('combine SQLite + clé API SecureStore, isConfigured = true si clé présente', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-existing-key');

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toMatchObject({
      provider: 'openai',
      apiKey: 'sk-existing-key',
      model: 'gpt-3.5-turbo',
      isConfigured: true,
    });
  });

  it('is_configured=1 mais pas de clé API → isConfigured false', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce(null);

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings?.isConfigured).toBe(false);
    expect(result.current.settings?.apiKey).toBeNull();
  });

  it('erreur DB → isLoading passe quand même à false', async () => {
    mockDb.getFirstAsync.mockRejectedValueOnce(new Error('DB error'));

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.settings).toBeNull();
  });
});

// ============================================
// updateSettings
// ============================================

describe('useAISettings — updateSettings', () => {
  beforeEach(async () => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-existing-key');
    (secureStorage.validateAPIKeyFormat as jest.Mock).mockReturnValue(true);
  });

  const setup = async () => {
    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    return result;
  };

  it('nouvelle clé API valide → sauvegardée dans SecureStore', async () => {
    const result = await setup();

    await act(async () => {
      await result.current.updateSettings({ apiKey: 'sk-new-valid-key-1234567890' });
    });

    expect(secureStorage.saveAPIKey).toHaveBeenCalledWith('sk-new-valid-key-1234567890');
    expect(result.current.settings?.apiKey).toBe('sk-new-valid-key-1234567890');
  });

  it('clé API au format invalide → rejette sans sauvegarder', async () => {
    (secureStorage.validateAPIKeyFormat as jest.Mock).mockReturnValue(false);
    const result = await setup();

    await expect(
      act(async () => {
        await result.current.updateSettings({ apiKey: 'bad-key' });
      })
    ).rejects.toThrow('Format de clé API invalide');

    expect(secureStorage.saveAPIKey).not.toHaveBeenCalled();
  });

  it('clé API vide → supprimée du SecureStore', async () => {
    const result = await setup();

    await act(async () => {
      await result.current.updateSettings({ apiKey: '' });
    });

    expect(secureStorage.deleteAPIKey).toHaveBeenCalled();
  });

  it('sans changement de clé (apiKey undefined) → ne touche pas au SecureStore', async () => {
    const result = await setup();

    await act(async () => {
      await result.current.updateSettings({ model: 'gpt-4' });
    });

    expect(secureStorage.saveAPIKey).not.toHaveBeenCalled();
    expect(secureStorage.deleteAPIKey).not.toHaveBeenCalled();
    expect(result.current.settings?.model).toBe('gpt-4');
  });

  it('met à jour la ligne SQLite ai_settings', async () => {
    const result = await setup();

    await act(async () => {
      await result.current.updateSettings({ model: 'gpt-4' });
    });

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE ai_settings'),
      expect.arrayContaining(['gpt-4'])
    );
  });
});

// ============================================
// incrementUsage
// ============================================

describe('useAISettings — incrementUsage', () => {
  const setup = async (row: typeof DB_ROW) => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.getFirstAsync.mockResolvedValueOnce(row);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-key');

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    return result;
  };

  it('reset auto si dernier reset > 24h → count remis à 1, retourne true', async () => {
    const result = await setup({ ...DB_ROW, current_usage_count: 40, last_reset_date: Date.now() - 25 * 60 * 60 * 1000 });

    let returned: boolean | undefined;
    await act(async () => { returned = await result.current.incrementUsage(); });

    expect(returned).toBe(true);
    expect(result.current.settings?.currentUsageCount).toBe(1);
  });

  it('sous la limite → incrémente, retourne true', async () => {
    const result = await setup({ ...DB_ROW, current_usage_count: 10, last_reset_date: Date.now() });

    let returned: boolean | undefined;
    await act(async () => { returned = await result.current.incrementUsage(); });

    expect(returned).toBe(true);
    expect(result.current.settings?.currentUsageCount).toBe(11);
  });

  it('limite atteinte → ne modifie rien, retourne false', async () => {
    const result = await setup({ ...DB_ROW, current_usage_count: 50, max_messages_per_day: 50, last_reset_date: Date.now() });

    let returned: boolean | undefined;
    await act(async () => { returned = await result.current.incrementUsage(); });

    expect(returned).toBe(false);
    expect(result.current.settings?.currentUsageCount).toBe(50);
  });
});

// ============================================
// canSendMessage
// ============================================

describe('useAISettings — canSendMessage', () => {
  const setup = async (row: typeof DB_ROW | null, apiKey: string | null = 'sk-key') => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.getFirstAsync.mockResolvedValueOnce(row);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce(apiKey);

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    return result;
  };

  it('settings null → false', async () => {
    const result = await setup(null);
    expect(result.current.canSendMessage()).toBe(false);
  });

  it('pas configuré → false', async () => {
    const result = await setup({ ...DB_ROW, is_configured: 0 });
    expect(result.current.canSendMessage()).toBe(false);
  });

  it('configuré mais pas de clé API → false', async () => {
    const result = await setup(DB_ROW, null);
    expect(result.current.canSendMessage()).toBe(false);
  });

  it('reset auto passé (>24h) → true même si le compteur était au max', async () => {
    const result = await setup({
      ...DB_ROW, current_usage_count: 50, last_reset_date: Date.now() - 25 * 60 * 60 * 1000,
    });
    expect(result.current.canSendMessage()).toBe(true);
  });

  it('sous la limite quotidienne → true', async () => {
    const result = await setup({ ...DB_ROW, current_usage_count: 10, last_reset_date: Date.now() });
    expect(result.current.canSendMessage()).toBe(true);
  });

  it('limite quotidienne atteinte → false', async () => {
    const result = await setup({ ...DB_ROW, current_usage_count: 50, max_messages_per_day: 50, last_reset_date: Date.now() });
    expect(result.current.canSendMessage()).toBe(false);
  });
});

// ============================================
// getAvailableModels
// ============================================

describe('useAISettings — getAvailableModels', () => {
  beforeEach(() => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
  });

  it('settings null → tableau vide', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(null);
    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getAvailableModels()).toEqual([]);
  });

  it('provider openai → liste des modèles OpenAI', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-key');
    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getAvailableModels()).toEqual(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo']);
  });

  it('provider claude → liste des modèles Claude', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce({ ...DB_ROW, provider: 'claude' });
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-ant-key');
    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.getAvailableModels()).toEqual(['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus']);
  });
});

// ============================================
// deleteAPIKey
// ============================================

describe('useAISettings — deleteAPIKey', () => {
  beforeEach(() => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
  });

  it('supprime du SecureStore, met settings.apiKey à null et isConfigured à false', async () => {
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW);
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValueOnce('sk-key');

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => { await result.current.deleteAPIKey(); });

    expect(secureStorage.deleteAPIKey).toHaveBeenCalled();
    expect(result.current.settings?.apiKey).toBeNull();
    expect(result.current.settings?.isConfigured).toBe(false);
    expect(mockDb.runAsync).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE ai_settings'),
      expect.anything()
    );
  });
});

// ============================================
// refreshSettings
// ============================================

describe('useAISettings — refreshSettings', () => {
  it('recharge les settings depuis la DB', async () => {
    resetDbAndKeyMocks();
    const { useUser } = require('@/contexts/UserContext');
    useUser.mockReturnValue({ db: mockDb });
    mockDb.getFirstAsync.mockResolvedValueOnce(DB_ROW).mockResolvedValueOnce({ ...DB_ROW, model: 'gpt-4-turbo' });
    (secureStorage.getAPIKey as jest.Mock).mockResolvedValue('sk-key');

    const { result } = renderHook(() => useAISettings());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.settings?.model).toBe('gpt-3.5-turbo');

    await act(async () => { await result.current.refreshSettings(); });

    expect(result.current.settings?.model).toBe('gpt-4-turbo');
  });
});
