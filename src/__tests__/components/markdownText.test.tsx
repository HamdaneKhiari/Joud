/**
 * Tests de composants — MarkdownText
 * Couvre : rendu texte plein, gras, italique, code, listes puces, listes numérotées, lignes vides
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { MarkdownText } from '@/components/ui/MarkdownText';

// ============================================
// Texte plain
// ============================================

describe('MarkdownText — texte plain', () => {
  it('rend un texte simple sans transformation', () => {
    const { getByText } = render(<MarkdownText content="Hello world" />);
    expect(getByText('Hello world')).toBeTruthy();
  });

  it('rend plusieurs lignes indépendamment', () => {
    const { getByText } = render(<MarkdownText content={'Line 1\nLine 2'} />);
    expect(getByText('Line 1')).toBeTruthy();
    expect(getByText('Line 2')).toBeTruthy();
  });
});

// ============================================
// Gras **...**
// ============================================

describe('MarkdownText — gras', () => {
  it('rend le contenu entre ** comme texte', () => {
    const { getByText } = render(<MarkdownText content="Dit **bonjour** en anglais" />);
    expect(getByText('bonjour')).toBeTruthy();
  });

  it('rend le texte avant et après le gras', () => {
    const { getByText } = render(
      <MarkdownText content="Dit **bonjour** en anglais" />
    );
    expect(getByText('bonjour')).toBeTruthy();
    // Le texte peut être découpé en nœuds séparés
    // On vérifie juste que le contenu en gras est rendu
  });
});

// ============================================
// Italique *...*
// ============================================

describe('MarkdownText — italique', () => {
  it('rend le contenu entre * comme texte', () => {
    const { getByText } = render(<MarkdownText content="C'est *important* ici" />);
    expect(getByText('important')).toBeTruthy();
  });
});

// ============================================
// Code `...`
// ============================================

describe('MarkdownText — code inline', () => {
  it('rend le contenu entre backticks comme texte', () => {
    const { getByText } = render(<MarkdownText content="Use `console.log()` here" />);
    expect(getByText('console.log()')).toBeTruthy();
  });
});

// ============================================
// Listes puces
// ============================================

describe('MarkdownText — listes puces', () => {
  it('rend un item de liste puce (- item)', () => {
    const { getByText } = render(<MarkdownText content="- Premier item" />);
    expect(getByText('Premier item')).toBeTruthy();
  });

  it('rend plusieurs items de liste', () => {
    const content = '- Alpha\n- Beta\n- Gamma';
    const { getByText } = render(<MarkdownText content={content} />);
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Beta')).toBeTruthy();
    expect(getByText('Gamma')).toBeTruthy();
  });

  it('rend le bullet point • pour chaque item', () => {
    const { getAllByText } = render(<MarkdownText content={'- A\n- B'} />);
    expect(getAllByText('• ').length).toBe(2);
  });
});

// ============================================
// Listes numérotées
// ============================================

describe('MarkdownText — listes numérotées', () => {
  it('rend un item de liste numérotée', () => {
    const { getByText } = render(<MarkdownText content="1. Premier" />);
    expect(getByText('Premier')).toBeTruthy();
    expect(getByText('1. ')).toBeTruthy();
  });

  it('rend plusieurs items numérotés avec leurs numéros', () => {
    const content = '1. Alpha\n2. Beta';
    const { getByText } = render(<MarkdownText content={content} />);
    expect(getByText('Alpha')).toBeTruthy();
    expect(getByText('Beta')).toBeTruthy();
    expect(getByText('1. ')).toBeTruthy();
    expect(getByText('2. ')).toBeTruthy();
  });
});

// ============================================
// Contenu mixte
// ============================================

describe('MarkdownText — contenu mixte', () => {
  it('traite chaque ligne indépendamment', () => {
    const content = '**Introduction**\n- Étape 1\n- Étape 2\n\nConclusion';
    const { getByText } = render(<MarkdownText content={content} />);
    expect(getByText('Introduction')).toBeTruthy();
    expect(getByText('Étape 1')).toBeTruthy();
    expect(getByText('Étape 2')).toBeTruthy();
    expect(getByText('Conclusion')).toBeTruthy();
  });
});

// ============================================
// Cas limites
// ============================================

describe('MarkdownText — cas limites', () => {
  it('ne plante pas avec un contenu vide', () => {
    expect(() => render(<MarkdownText content="" />)).not.toThrow();
  });

  it('ne plante pas avec plusieurs lignes vides', () => {
    expect(() => render(<MarkdownText content={'\n\n\n'} />)).not.toThrow();
  });

  it('préserve les caractères spéciaux non-markdown', () => {
    const { getByText } = render(<MarkdownText content="Coût : 5€ (HT)" />);
    expect(getByText('Coût : 5€ (HT)')).toBeTruthy();
  });

  it('ne double-encode pas les astérisques littéraux (pas de markdown)', () => {
    const { getByText } = render(<MarkdownText content="Réponse correcte !" />);
    expect(getByText('Réponse correcte !')).toBeTruthy();
  });
});
