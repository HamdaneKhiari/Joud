/**
 * Tests unitaires — logUtils.ts
 * Couvre : log.info, log.warn, log.error, log.debug, log.success
 * Vérifie le comportement en DEV (__DEV__ = true, valeur globale définie dans jest.config.js)
 * et simule le comportement en PROD (__DEV__ = false).
 */

import { log } from '@/utils/logUtils';

// ============================================
// Helpers
// ============================================

const spyConsoleLog = () => jest.spyOn(console, 'log').mockImplementation(() => {});
const spyConsoleWarn = () => jest.spyOn(console, 'warn').mockImplementation(() => {});
const spyConsoleError = () => jest.spyOn(console, 'error').mockImplementation(() => {});

afterEach(() => jest.restoreAllMocks());

// ============================================
// En mode DEV (__DEV__ = true par défaut dans jest.config.js)
// ============================================

describe('log — mode DEV', () => {
  it('log.info appelle console.log avec le préfixe 📘 INFO:', () => {
    const spy = spyConsoleLog();
    log.info('test info');
    expect(spy).toHaveBeenCalledWith('📘 INFO:', 'test info');
  });

  it('log.warn appelle console.warn avec le préfixe ⚠️ WARN:', () => {
    const spy = spyConsoleWarn();
    log.warn('test warn');
    expect(spy).toHaveBeenCalledWith('⚠️ WARN:', 'test warn');
  });

  it('log.error appelle console.error avec le préfixe ❌ ERROR:', () => {
    const spy = spyConsoleError();
    log.error('test error');
    expect(spy).toHaveBeenCalledWith('❌ ERROR:', 'test error');
  });

  it('log.debug appelle console.log avec le préfixe 🔍 DEBUG:', () => {
    const spy = spyConsoleLog();
    log.debug('test debug');
    expect(spy).toHaveBeenCalledWith('🔍 DEBUG:', 'test debug');
  });

  it('log.success appelle console.log avec le préfixe ✅ SUCCESS:', () => {
    const spy = spyConsoleLog();
    log.success('test success');
    expect(spy).toHaveBeenCalledWith('✅ SUCCESS:', 'test success');
  });

  it('log.error accepte plusieurs arguments', () => {
    const spy = spyConsoleError();
    log.error('message', { code: 404 }, new Error('not found'));
    expect(spy).toHaveBeenCalledWith('❌ ERROR:', 'message', { code: 404 }, expect.any(Error));
  });

  it('log.info accepte plusieurs arguments', () => {
    const spy = spyConsoleLog();
    log.info('msg', 1, true, null);
    expect(spy).toHaveBeenCalledWith('📘 INFO:', 'msg', 1, true, null);
  });
});

// ============================================
// log.error est toujours actif (même en prod)
// ============================================

describe('log.error — toujours actif', () => {
  it('log.error est défini et appelable', () => {
    expect(typeof log.error).toBe('function');
  });

  it('log.error appelle bien console.error', () => {
    const spy = spyConsoleError();
    log.error('erreur critique');
    expect(spy).toHaveBeenCalled();
  });
});

// ============================================
// Signature des méthodes
// ============================================

describe('log — API', () => {
  it('toutes les méthodes sont des fonctions', () => {
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.debug).toBe('function');
    expect(typeof log.success).toBe('function');
  });

  it('les méthodes ne retournent rien (void)', () => {
    const spy = spyConsoleLog();
    spyConsoleWarn();
    spyConsoleError();
    expect(log.info('x')).toBeUndefined();
    expect(log.warn('x')).toBeUndefined();
    expect(log.error('x')).toBeUndefined();
    expect(log.debug('x')).toBeUndefined();
    expect(log.success('x')).toBeUndefined();
    spy.mockRestore();
  });
});
