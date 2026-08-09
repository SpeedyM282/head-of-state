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

  it('elections defeat: democratic zone, election turn, low approval — instant', () => {
    const electionTurn = content.balance.electionsEveryTurns;
    const s = armed({ approval: 30 }, { vector: 10, turn: electionTurn });
    expect(checkConditions(s, content).outcome?.defeat).toBe('elections');
  });

  it('no elections outside the democratic zone', () => {
    const electionTurn = content.balance.electionsEveryTurns;
    const s = armed({ approval: 30 }, { vector: 80, turn: electionTurn, stats: undefined as never });
    const fixed = { ...s, stats: { ...initGame(content, 1).stats, approval: 30, stability: 60, eliteLoyalty: 60 } };
    expect(checkConditions(fixed, content).outcome).toBeNull();
  });

  it('victory at turnsToWin', () => {
    const s = armed({}, { turn: content.difficulty.turnsToWin });
    expect(checkConditions(s, content).outcome?.result).toBe('victory');
  });
});
