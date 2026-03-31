/**
 * Tests unitaires — inputSanitizer.ts
 * Couvre : sanitizeUserInput, sanitizeExerciseInput
 */

import { sanitizeUserInput, sanitizeExerciseInput } from '@/utils/inputSanitizer';

// ============================================
// sanitizeUserInput
// ============================================

describe('sanitizeUserInput', () => {
  // Comportement de base
  it('retourne le texte inchangé s\'il est valide', () => {
    expect(sanitizeUserInput('Bonjour, comment ça va ?')).toBe('Bonjour, comment ça va ?');
  });

  it('trimme les espaces en début et fin', () => {
    expect(sanitizeUserInput('  hello  ')).toBe('hello');
  });

  it('tronque au-delà de la limite par défaut (2000 chars)', () => {
    const long = 'a'.repeat(2500);
    expect(sanitizeUserInput(long)).toHaveLength(2000);
  });

  it('tronque à la limite personnalisée', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeUserInput(long, 500)).toHaveLength(500);
  });

  it('ne tronque pas si la chaîne est dans la limite', () => {
    const text = 'hello world';
    expect(sanitizeUserInput(text, 500)).toBe('hello world');
  });

  // Caractères de contrôle
  it('supprime les null bytes (\\x00)', () => {
    expect(sanitizeUserInput('hello\x00world')).toBe('helloworld');
  });

  it('supprime les caractères de contrôle \\x01-\\x08', () => {
    expect(sanitizeUserInput('a\x01b\x02c\x08d')).toBe('abcd');
  });

  it('supprime \\x0B (vertical tab) et \\x0C (form feed)', () => {
    expect(sanitizeUserInput('a\x0Bb\x0Cc')).toBe('abc');
  });

  it('supprime les caractères \\x0E-\\x1F', () => {
    expect(sanitizeUserInput('a\x0Eb\x1Fc')).toBe('abc');
  });

  it('supprime \\x7F (DEL)', () => {
    expect(sanitizeUserInput('hel\x7Flo')).toBe('hello');
  });

  // Caractères préservés (légitimes)
  it('conserve les tabulations \\t', () => {
    expect(sanitizeUserInput('hello\tworld')).toBe('hello\tworld');
  });

  it('conserve les sauts de ligne \\n', () => {
    expect(sanitizeUserInput('line1\nline2')).toBe('line1\nline2');
  });

  it('conserve les retours chariot \\r', () => {
    expect(sanitizeUserInput('line1\r\nline2')).toBe('line1\r\nline2');
  });

  it('conserve les emojis', () => {
    expect(sanitizeUserInput('Hello 🌍 World')).toBe('Hello 🌍 World');
  });

  it('conserve les accents et caractères spéciaux', () => {
    expect(sanitizeUserInput('café, naïf, résumé')).toBe('café, naïf, résumé');
  });

  it('conserve les caractères arabes et asiatiques', () => {
    expect(sanitizeUserInput('مرحبا 你好')).toBe('مرحبا 你好');
  });

  // Chaîne vide
  it('retourne une chaîne vide pour une entrée vide', () => {
    expect(sanitizeUserInput('')).toBe('');
  });

  it('retourne une chaîne vide pour une chaîne qui ne contient que des espaces', () => {
    expect(sanitizeUserInput('   ')).toBe('');
  });

  // Combinaisons
  it('enchaîne : supprime contrôles + trim + tronque', () => {
    const input = '  hello\x00world  ' + 'a'.repeat(2000);
    const result = sanitizeUserInput(input, 10);
    expect(result.startsWith('helloworld')).toBe(true);
    expect(result).toHaveLength(10);
  });
});

// ============================================
// sanitizeExerciseInput
// ============================================

describe('sanitizeExerciseInput', () => {
  it('limite à 500 caractères', () => {
    const long = 'x'.repeat(600);
    expect(sanitizeExerciseInput(long)).toHaveLength(500);
  });

  it('ne tronque pas en dessous de 500 chars', () => {
    const text = 'Hello';
    expect(sanitizeExerciseInput(text)).toBe('Hello');
  });

  it('supprime aussi les caractères de contrôle', () => {
    expect(sanitizeExerciseInput('hello\x00world')).toBe('helloworld');
  });

  it('trimme les espaces', () => {
    expect(sanitizeExerciseInput('  answer  ')).toBe('answer');
  });
});
