import { describe, expect, it } from 'vitest';
import { applyEffects } from '../../src/core/effects';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';

const state = () => initGame(buildContent('normal'), 1);

describe('applyEffects', () => {
  it('applies stat deltas and clamps to 0-100', () => {
    const s = applyEffects(state(), [
      { target: 'economy', delta: 999 },
      { target: 'approval', delta: -999 },
    ]);
    expect(s.stats.economy).toBe(100);
    expect(s.stats.approval).toBe(0);
  });

  it('clamps vector to 0-100 and floors influence at 0', () => {
    const s = applyEffects(state(), [
      { target: 'vector', delta: 999 },
      { target: 'influence', delta: -999 },
    ]);
    expect(s.vector).toBe(100);
    expect(s.influence).toBe(0);
  });

  it('does not mutate the input state', () => {
    const before = state();
    const snapshot = JSON.stringify(before);
    applyEffects(before, [{ target: 'economy', delta: 10 }]);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
