/**
 * Tests de composants — DynamicIcon
 * Couvre : priorité du nom (prop > identity.icons.logo > fallback),
 *          couleur (color prop > identity.text.onPrimary)
 */

import React from 'react';
import { render } from '@testing-library/react-native';

// ============================================
// Mocks
// ============================================

// Capture les props passées à MaterialCommunityIcons
const MockIcon = jest.fn().mockReturnValue(null);

jest.mock('@expo/vector-icons', () => ({
  MaterialCommunityIcons: (props: Record<string, unknown>) => MockIcon(props),
}));

const mockIdentity = {
  icons: { logo: 'home' },
  text: { onPrimary: '#FFFFFF' },
};

jest.mock('@/themes/ThemeContext', () => ({
  useTheme: jest.fn().mockReturnValue({ identity: mockIdentity }),
}));

import { DynamicIcon } from '@/components/ui/DynamicIcon';

// ============================================
// Priorité du nom d'icône
// ============================================

describe('DynamicIcon — priorité du nom', () => {
  beforeEach(() => {
    MockIcon.mockClear();
    const { useTheme } = require('@/themes/ThemeContext');
    useTheme.mockReturnValue({ identity: mockIdentity });
  });

  it('utilise le prop "name" s\'il est défini', () => {
    render(<DynamicIcon name="star" />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'star' }));
  });

  it('utilise identity.icons.logo si name est null', () => {
    render(<DynamicIcon name={null} />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'home' }));
  });

  it('utilise identity.icons.logo si name est undefined', () => {
    render(<DynamicIcon />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'home' }));
  });

  it('utilise le fallback si name est null et identity.icons.logo est absent', () => {
    const { useTheme } = require('@/themes/ThemeContext');
    useTheme.mockReturnValue({
      identity: { icons: { logo: '' }, text: { onPrimary: '#000' } },
    });

    render(<DynamicIcon name={null} fallback="help-circle" />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'help-circle' }));
  });

  it('fallback par défaut est "help-circle" si rien n\'est défini', () => {
    const { useTheme } = require('@/themes/ThemeContext');
    useTheme.mockReturnValue({
      identity: { icons: { logo: '' }, text: { onPrimary: '#000' } },
    });

    render(<DynamicIcon />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ name: 'help-circle' }));
  });
});

// ============================================
// Taille
// ============================================

describe('DynamicIcon — size', () => {
  beforeEach(() => {
    MockIcon.mockClear();
    const { useTheme } = require('@/themes/ThemeContext');
    useTheme.mockReturnValue({ identity: mockIdentity });
  });

  it('size par défaut est 24', () => {
    render(<DynamicIcon name="star" />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ size: 24 }));
  });

  it('size personnalisée est transmise', () => {
    render(<DynamicIcon name="star" size={48} />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ size: 48 }));
  });
});

// ============================================
// Couleur
// ============================================

describe('DynamicIcon — couleur', () => {
  beforeEach(() => {
    MockIcon.mockClear();
    const { useTheme } = require('@/themes/ThemeContext');
    useTheme.mockReturnValue({ identity: mockIdentity });
  });

  it('utilise identity.text.onPrimary si color non fourni', () => {
    render(<DynamicIcon name="star" />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ color: '#FFFFFF' }));
  });

  it('utilise le prop color si fourni', () => {
    render(<DynamicIcon name="star" color="#FF0000" />);
    expect(MockIcon).toHaveBeenCalledWith(expect.objectContaining({ color: '#FF0000' }));
  });
});
