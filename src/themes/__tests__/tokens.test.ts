import { withOpacity } from '@/themes/tokens';

describe('withOpacity', () => {
  it('converts a pure red hex to rgba', () => {
    expect(withOpacity('#FF0000', 1)).toBe('rgba(255, 0, 0, 1)');
  });

  it('converts black with full transparency', () => {
    expect(withOpacity('#000000', 0)).toBe('rgba(0, 0, 0, 0)');
  });

  it('converts white at half opacity', () => {
    expect(withOpacity('#FFFFFF', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
  });

  it('handles lowercase hex characters', () => {
    expect(withOpacity('#ff6b6b', 0.8)).toBe('rgba(255, 107, 107, 0.8)');
  });

  it('handles a typical brand color at low opacity (card border)', () => {
    // #4A90D9 → r=74 g=144 b=217
    expect(withOpacity('#4A90D9', 0.1)).toBe('rgba(74, 144, 217, 0.1)');
  });

  it('handles the primary color at 0.05 (hint background)', () => {
    // #34495E → r=52 g=73 b=94
    expect(withOpacity('#34495E', 0.05)).toBe('rgba(52, 73, 94, 0.05)');
  });
});
