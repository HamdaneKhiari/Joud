/**
 * Tests de composant — SentenceTilesCard (reconstruction de phrase par tuiles, mode Collège)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

const mockIdentity = {
  id: 'college', themeMode: 'light', organizationName: 'Joud Collège',
  palette: { primary: '#34495E', accent: '#FFD700', surface: '#FFFFFF', background: '#F9FAFB' },
  text: { primary: '#1F2937', secondary: '#6B7280', tertiary: '#9CA3AF', onPrimary: '#FFFFFF' },
  ui: { cardRadius: 14, showDecorativeShapes: true, mood: 'playful', cardStyle: 'playful' },
  aiDiagnostic: { accent: '#34495E', error: '#D32F2F', solutionBackground: ['#ECEFF1', '#CFD8DC'] },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockImplementation(() => ({ identity: mockIdentity })),
}));

import SentenceTilesCard from '@/components/pedagogy/Sentence/SentenceTilesCard';
import type { TileToken } from '@/utils/phraseUtils';

const baseData = { phrase_en: 'I like coffee', translation: "J'aime le café" };

describe('SentenceTilesCard — rendu', () => {
  it('affiche la consigne FR', () => {
    const { getByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByText("J'aime le café")).toBeTruthy();
  });

  it("sans tuile placée → affiche le texte d'invite", () => {
    const { getByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByText('Tape les mots ci-dessous...')).toBeTruthy();
  });

  it('affiche les 3 mots de "I like coffee" dans le pool', () => {
    const { getByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByLabelText('Ajouter "I"')).toBeTruthy();
    expect(getByLabelText('Ajouter "like"')).toBeTruthy();
    expect(getByLabelText('Ajouter "coffee"')).toBeTruthy();
  });

  it('reconstitue la phrase depuis sentence + correctAnswer si phrase_en absent', () => {
    const { getByLabelText } = render(
      <SentenceTilesCard
        data={{ sentence: 'I ___ coffee', correctAnswer: 'like' }}
        placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByLabelText('Ajouter "like"')).toBeTruthy();
  });

  it('affiche le bloc "Tip" quand fourni', () => {
    const { getByText } = render(
      <SentenceTilesCard
        data={{ ...baseData, tip: 'Pense au présent simple' }}
        placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByText('Pense au présent simple')).toBeTruthy();
  });

  it('sans tip → pas de bloc Tip', () => {
    const { queryByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(queryByText('💡 Tip')).toBeNull();
  });
});

describe('SentenceTilesCard — placement / retrait de tuiles', () => {
  it('tap sur une tuile du pool → onTokensChange avec la tuile ajoutée', () => {
    const onTokensChange = jest.fn();
    const { getByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={onTokensChange}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );

    fireEvent.press(getByLabelText('Ajouter "I"'));

    expect(onTokensChange).toHaveBeenCalledWith([{ id: 'tile-0', text: 'I' }]);
  });

  it('une tuile déjà placée disparaît du pool', () => {
    const placed: TileToken[] = [{ id: 'tile-0', text: 'I' }];
    const { queryByLabelText, getByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={placed} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );

    expect(queryByLabelText('Ajouter "I"')).toBeNull();
    expect(getByLabelText('Retirer "I"')).toBeTruthy();
  });

  it('tap sur une tuile placée → onTokensChange sans cette tuile', () => {
    const onTokensChange = jest.fn();
    const placed: TileToken[] = [{ id: 'tile-0', text: 'I' }, { id: 'tile-1', text: 'like' }];
    const { getByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={placed} onTokensChange={onTokensChange}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );

    fireEvent.press(getByLabelText('Retirer "I"'));

    expect(onTokensChange).toHaveBeenCalledWith([{ id: 'tile-1', text: 'like' }]);
  });

  it('isValidated=true → les tuiles placées sont désactivées', () => {
    const placed: TileToken[] = [{ id: 'tile-0', text: 'I' }];
    const { getByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={placed} onTokensChange={jest.fn()}
        isValidated={true} isCorrect={true} moduleColor="#34495E"
      />
    );

    expect(getByLabelText('Retirer "I"').props.disabled).toBe(true);
  });

  it('isValidated=true → le pool de tuiles disparaît', () => {
    const { queryByLabelText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={true} isCorrect={true} moduleColor="#34495E"
      />
    );
    expect(queryByLabelText('Ajouter "I"')).toBeNull();
  });
});

describe('SentenceTilesCard — feedback après validation', () => {
  it('réponse correcte → affiche la phrase correcte', () => {
    const { getByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={true} isCorrect={true} moduleColor="#34495E"
      />
    );
    expect(getByText('✓ PHRASE CORRECTE :')).toBeTruthy();
    expect(getByText('I like coffee')).toBeTruthy();
  });

  it('affiche l\'explication si fournie', () => {
    const { getByText } = render(
      <SentenceTilesCard
        data={{ ...baseData, explanation: 'On utilise "like" pour exprimer un goût.' }}
        placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={true} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(getByText('On utilise "like" pour exprimer un goût.')).toBeTruthy();
  });

  it('sans explication → pas de bloc "POURQUOI"', () => {
    const { queryByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={true} isCorrect={true} moduleColor="#34495E"
      />
    );
    expect(queryByText('💡 POURQUOI ?')).toBeNull();
  });

  it('isValidated=false → pas de bloc feedback', () => {
    const { queryByText } = render(
      <SentenceTilesCard
        data={baseData} placedTokens={[]} onTokensChange={jest.fn()}
        isValidated={false} isCorrect={false} moduleColor="#34495E"
      />
    );
    expect(queryByText('✓ PHRASE CORRECTE :')).toBeNull();
  });
});
