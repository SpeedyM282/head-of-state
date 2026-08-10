import { describe, expect, it } from 'vitest';
import { trendColor, trendDirection, trendGlyph } from '../../src/ui/trend';

describe('trendDirection', () => {
  it('classifies deltas beyond the noise threshold', () => {
    expect(trendDirection(1)).toBe('up');
    expect(trendDirection(-1)).toBe('down');
  });

  it('treats small deltas as flat (noise)', () => {
    expect(trendDirection(0)).toBe('flat');
    expect(trendDirection(0.4)).toBe('flat');
    expect(trendDirection(-0.4)).toBe('flat');
  });
});

describe('trendGlyph', () => {
  it('maps each direction to its arrow', () => {
    expect(trendGlyph('up')).toBe('▲');
    expect(trendGlyph('down')).toBe('▼');
    expect(trendGlyph('flat')).toBe('—');
  });
});

describe('trendColor — inverted stats flip which direction is good news', () => {
  it('for a normal stat, rising is good (green) and falling is bad (red)', () => {
    expect(trendColor('approval', 'up')).toBe('var(--ok)');
    expect(trendColor('approval', 'down')).toBe('var(--stamp)');
    expect(trendColor('approval', 'flat')).toBe('var(--text-faint)');
  });

  it('for corruption (the inverted stat), rising is bad (red) and falling is good (green)', () => {
    expect(trendColor('corruption', 'up')).toBe('var(--stamp)');
    expect(trendColor('corruption', 'down')).toBe('var(--ok)');
    expect(trendColor('corruption', 'flat')).toBe('var(--text-faint)');
  });

  it('every non-inverted stat agrees with approval’s polarity', () => {
    const normalStats = ['economy', 'treasury', 'eliteLoyalty', 'stability', 'development'] as const;
    for (const stat of normalStats) {
      expect(trendColor(stat, 'up')).toBe('var(--ok)');
      expect(trendColor(stat, 'down')).toBe('var(--stamp)');
    }
  });
});
