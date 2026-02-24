import { generateFeedbackMessage } from '@/utils/feedback';

describe('generateFeedbackMessage', () => {
  describe('not validated yet', () => {
    it('returns null when isValidated is false regardless of other params', () => {
      expect(generateFeedbackMessage(false, false, false, 'hello')).toBeNull();
      expect(generateFeedbackMessage(false, true, true, 'hello')).toBeNull();
    });
  });

  describe('correct answer', () => {
    it('returns correct feedback with ✓ icon', () => {
      const result = generateFeedbackMessage(true, true, false, 'hello');
      expect(result).not.toBeNull();
      expect(result!.icon).toBe('✓');
      expect(result!.title).toBe('Correct');
    });

    it('includes the answer in the message', () => {
      const result = generateFeedbackMessage(true, true, false, 'good morning');
      expect(result!.message).toContain('good morning');
    });

    it('formats array answer as joined string', () => {
      const result = generateFeedbackMessage(true, true, false, ['I', 'am', 'happy']);
      expect(result!.message).toContain('I am happy');
    });
  });

  describe('skip mode (canSkip = true)', () => {
    it('shows the correct answer with ℹ icon', () => {
      const result = generateFeedbackMessage(true, false, true, 'world');
      expect(result).not.toBeNull();
      expect(result!.icon).toBe('ℹ');
      expect(result!.title).toBe('Réponse');
      expect(result!.message).toContain('world');
    });

    it('formats array answer in skip mode', () => {
      const result = generateFeedbackMessage(true, false, true, ['She', 'is', 'tall']);
      expect(result!.message).toContain('She is tall');
    });
  });

  describe('wrong answer (retry)', () => {
    it('shows attempt count with ✗ icon', () => {
      const result = generateFeedbackMessage(true, false, false, 'answer', 0, 3);
      expect(result).not.toBeNull();
      expect(result!.icon).toBe('✗');
      expect(result!.title).toBe('Tentative 1/3');
      expect(result!.message).toBe('Réessaie.');
    });

    it('increments attempt counter correctly', () => {
      const result = generateFeedbackMessage(true, false, false, 'answer', 2, 3);
      expect(result!.title).toBe('Tentative 3/3');
    });

    it('uses default maxAttempts of 3', () => {
      const result = generateFeedbackMessage(true, false, false, 'answer', 1);
      expect(result!.title).toBe('Tentative 2/3');
    });
  });
});
