import { describe, expect, it } from 'vitest';
import { averageGoodness, isDangerous, isInverted } from '../../src/data/statMeta';
import type { Stats } from '../../src/core/types';

describe('isInverted', () => {
  it('is true only for corruption', () => {
    expect(isInverted('corruption')).toBe(true);
    expect(isInverted('economy')).toBe(false);
    expect(isInverted('treasury')).toBe(false);
    expect(isInverted('approval')).toBe(false);
    expect(isInverted('eliteLoyalty')).toBe(false);
    expect(isInverted('stability')).toBe(false);
    expect(isInverted('development')).toBe(false);
  });
});

describe('isDangerous', () => {
  it('flags a normal stat as dangerous when LOW', () => {
    expect(isDangerous('approval', 10, 25)).toBe(true);
    expect(isDangerous('approval', 30, 25)).toBe(false);
  });

  it('flags corruption as dangerous when HIGH — mirrored around 100', () => {
    expect(isDangerous('corruption', 90, 25)).toBe(true); // 90 > 100-25
    expect(isDangerous('corruption', 50, 25)).toBe(false); // 50 <= 100-25
  });
});

describe('averageGoodness', () => {
  const base: Stats = {
    economy: 60,
    treasury: 60,
    approval: 60,
    eliteLoyalty: 60,
    stability: 60,
    development: 60,
    corruption: 0,
  };

  it('zero corruption normalizes to full marks (100), not zero', () => {
    // corruption=0 is the best possible state, so it should pull the average UP toward 100.
    expect(averageGoodness(base)).toBeCloseTo((60 * 6 + 100) / 7, 5);
  });

  it('high corruption LOWERS the score, not raises it', () => {
    const clean = averageGoodness({ ...base, corruption: 10 });
    const corrupt = averageGoodness({ ...base, corruption: 90 });
    expect(corrupt).toBeLessThan(clean);
  });

  it('matches a plain average with corruption pre-flipped around 100', () => {
    const stats = { ...base, corruption: 30 };
    const manual = (60 * 6 + (100 - 30)) / 7;
    expect(averageGoodness(stats)).toBeCloseTo(manual, 5);
  });
});
