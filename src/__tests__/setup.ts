/**
 * Jest global setup — s'exécute avant chaque fichier de test
 * Configure les modules natifs qui ne peuvent pas être mockés via moduleNameMapper
 */

// Silence les warnings react-test-renderer deprecation
jest.spyOn(console, 'error').mockImplementation((msg, ...args) => {
  if (typeof msg === 'string' && (
    msg.includes('react-test-renderer is deprecated') ||
    msg.includes('not wrapped in act')
  )) return;
  // eslint-disable-next-line no-console
  console.warn(msg, ...args);
});
