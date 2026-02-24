/**
 * Tests for logUtils
 *
 * Note: jest-expo sets __DEV__ = true by default.
 * All log.info / log.warn / log.debug / log.success tests run in DEV mode.
 * log.error is always active (production monitoring).
 */
import { log } from '@/utils/logUtils';

describe('logUtils (DEV mode)', () => {
  let spyLog: jest.SpyInstance;
  let spyWarn: jest.SpyInstance;
  let spyError: jest.SpyInstance;

  beforeEach(() => {
    spyLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    spyWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    spyError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('log.info', () => {
    it('calls console.log with 📘 INFO: prefix', () => {
      log.info('hello world');
      expect(spyLog).toHaveBeenCalledWith('📘 INFO:', 'hello world');
    });

    it('forwards multiple arguments', () => {
      log.info('msg', { id: 1 }, 42);
      expect(spyLog).toHaveBeenCalledWith('📘 INFO:', 'msg', { id: 1 }, 42);
    });
  });

  describe('log.warn', () => {
    it('calls console.warn with ⚠️ WARN: prefix', () => {
      log.warn('something fishy');
      expect(spyWarn).toHaveBeenCalledWith('⚠️ WARN:', 'something fishy');
    });
  });

  describe('log.debug', () => {
    it('calls console.log with 🔍 DEBUG: prefix', () => {
      log.debug('internal state', { x: 0 });
      expect(spyLog).toHaveBeenCalledWith('🔍 DEBUG:', 'internal state', { x: 0 });
    });
  });

  describe('log.success', () => {
    it('calls console.log with ✅ SUCCESS: prefix', () => {
      log.success('saved!');
      expect(spyLog).toHaveBeenCalledWith('✅ SUCCESS:', 'saved!');
    });
  });

  describe('log.error (always active)', () => {
    it('calls console.error with ❌ ERROR: prefix', () => {
      log.error('critical failure');
      expect(spyError).toHaveBeenCalledWith('❌ ERROR:', 'critical failure');
    });

    it('never calls console.log or console.warn for errors', () => {
      log.error('boom');
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).not.toHaveBeenCalled();
    });

    it('forwards Error objects', () => {
      const err = new Error('test');
      log.error('caught', err);
      expect(spyError).toHaveBeenCalledWith('❌ ERROR:', 'caught', err);
    });
  });
});
