import { describe, expect, it } from 'vitest';
import { toRoman } from '../../src/ui/roman';

describe('toRoman', () => {
  it('formats term numbers', () => {
    expect(toRoman(1)).toBe('I');
    expect(toRoman(2)).toBe('II');
    expect(toRoman(4)).toBe('IV');
    expect(toRoman(9)).toBe('IX');
    expect(toRoman(14)).toBe('XIV');
    expect(toRoman(49)).toBe('XLIX');
  });

  it('falls back to the plain number for non-positive or fractional input', () => {
    expect(toRoman(0)).toBe('0');
    expect(toRoman(-3)).toBe('-3');
    expect(toRoman(1.5)).toBe('1.5');
  });
});
