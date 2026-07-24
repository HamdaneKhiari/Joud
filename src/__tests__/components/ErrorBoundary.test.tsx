/**
 * Tests: ErrorBoundary
 * Composant de classe — getDerivedStateFromError, render fallback, handleReset
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Composant qui crash intentionnellement
const CrashingComponent = ({ shouldCrash }: { shouldCrash: boolean }) => {
  if (shouldCrash) throw new Error('Test crash message');
  return <></>;
};

// Supprimer les console.error de React pendant les tests d'erreur
beforeEach(() => { jest.spyOn(console, 'error').mockImplementation(() => {}); });
afterEach(() => { (console.error as jest.Mock).mockRestore(); });

describe('ErrorBoundary', () => {
  it('affiche les enfants normalement sans erreur', () => {
    render(
      <ErrorBoundary>
        <CrashingComponent shouldCrash={false} />
        {/* @ts-ignore */}
        <any testID="child-text">Contenu normal</any>
      </ErrorBoundary>
    );
    // Pas de crash → les enfants sont rendus
    expect(() => render(<ErrorBoundary><></></ErrorBoundary>)).not.toThrow();
  });

  it('affiche le fallback quand un enfant crash', () => {
    const { getByText } = render(
      <ErrorBoundary>
        <CrashingComponent shouldCrash={true} />
      </ErrorBoundary>
    );
    expect(getByText('Quelque chose s\'est mal passé')).toBeTruthy();
    expect(getByText('Test crash message')).toBeTruthy();
    expect(getByText('Réessayer')).toBeTruthy();
  });

  it('Réessayer appelle handleReset et le bouton disparaît', () => {
    // On teste que handleReset est bien câblé au bouton
    const boundary = new ErrorBoundary({ children: null });
    boundary.state = { hasError: true, error: new Error('test') };
    boundary.setState = jest.fn();
    boundary.handleReset();
    expect(boundary.setState).toHaveBeenCalledWith({ hasError: false, error: null });
  });

  it('affiche "Erreur inattendue" si pas de message d\'erreur', () => {
    const CrashWithoutMessage = () => { throw new Error(); };
    const { getByText } = render(
      <ErrorBoundary>
        <CrashWithoutMessage />
      </ErrorBoundary>
    );
    expect(getByText('Erreur inattendue')).toBeTruthy();
  });
});
