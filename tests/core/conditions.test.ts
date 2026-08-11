import { describe, expect, it } from 'vitest';
import { checkConditions } from '../../src/core/conditions';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';
import type { GameState } from '../../src/core/types';

const content = buildContent('normal'); // threshold 15, grace 3

function armed(patch: Partial<GameState['stats']>, extra?: Partial<GameState>): GameState {
  const s = initGame(content, 1);
  return { ...s, turn: 5, stats: { ...s.stats, ...patch }, ...extra };
}

describe('defeat conditions', () => {
  it('coup fires only after grace turns of low elite loyalty', () => {
    let s = armed({ eliteLoyalty: 5 });
    s = checkConditions(s, content);
    expect(s.outcome).toBeNull();
    s = checkConditions(s, content);
    expect(s.outcome).toBeNull();
    s = checkConditions(s, content);
    expect(s.outcome?.defeat).toBe('coup');
  });

  it('counter resets when the stat recovers', () => {
    let s = armed({ eliteLoyalty: 5 });
    s = checkConditions(s, content);
    s = checkConditions(s, content);
    s = { ...s, stats: { ...s.stats, eliteLoyalty: 50 } };
    s = checkConditions(s, content);
    expect(s.defeatCounters.coup).toBe(0);
    expect(s.outcome).toBeNull();
  });

  it('revolution needs BOTH low approval and low stability', () => {
    let a = armed({ approval: 5, stability: 80 });
    for (let i = 0; i < 5; i++) a = checkConditions(a, content);
    expect(a.outcome).toBeNull();

    let b = armed({ approval: 5, stability: 20 });
    for (let i = 0; i < 3; i++) b = checkConditions(b, content);
    expect(b.outcome?.defeat).toBe('revolution');
  });

  it('default fires on empty treasury after grace', () => {
    let s = armed({ treasury: 0 });
    for (let i = 0; i < 3; i++) s = checkConditions(s, content);
    expect(s.outcome?.defeat).toBe('default');
  });

  it('does not resolve elections or victory — those live in elections.ts now', () => {
    // Reaching a term boundary is no longer a checkConditions concern.
    const atTermEnd = armed({ approval: 5 }, { vector: 10, turn: content.difficulty.turnsToWin });
    expect(checkConditions(atTermEnd, content).outcome).toBeNull();
  });
});
