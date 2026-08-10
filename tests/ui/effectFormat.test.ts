import { describe, expect, it } from 'vitest';
import { effectColor, signed, targetLabel } from '../../src/ui/effectFormat';
import { uiStrings } from '../../src/i18n';

const ui = uiStrings.en;

describe('signed', () => {
  it('prefixes positive numbers with + and negative with −', () => {
    expect(signed(4)).toBe('+4');
    expect(signed(-10)).toBe('−10');
  });
});

describe('targetLabel', () => {
  it('resolves stats, vector, and influence to their localized labels', () => {
    expect(targetLabel('approval', ui)).toBe(ui.stats.approval);
    expect(targetLabel('corruption', ui)).toBe(ui.stats.corruption);
    expect(targetLabel('vector', ui)).toBe(ui.vector.heading);
    expect(targetLabel('influence', ui)).toBe(ui.main.influence);
  });
});

describe('effectColor — one formatter, shared by reforms and event cards', () => {
  it('colors a normal stat green when rising, red when falling', () => {
    expect(effectColor({ target: 'approval', delta: 5 })).toBe('var(--ok)');
    expect(effectColor({ target: 'treasury', delta: -5 })).toBe('var(--stamp)');
  });

  it('flips corruption: a positive delta (more corruption) is bad, negative is good', () => {
    expect(effectColor({ target: 'corruption', delta: 8 })).toBe('var(--stamp)');
    expect(effectColor({ target: 'corruption', delta: -8 })).toBe('var(--ok)');
  });

  it('treats the vector as neutral regardless of sign', () => {
    expect(effectColor({ target: 'vector', delta: 5 })).toBe('var(--gold)');
    expect(effectColor({ target: 'vector', delta: -5 })).toBe('var(--gold)');
  });

  it('treats influence like a normal (non-inverted) stat', () => {
    expect(effectColor({ target: 'influence', delta: 3 })).toBe('var(--ok)');
    expect(effectColor({ target: 'influence', delta: -3 })).toBe('var(--stamp)');
  });
});
