import { describe, expect, it } from 'vitest';
import { buildContent } from '../../src/data';
import { initGame } from '../../src/core/init';
import type { GameState } from '../../src/core/types';
import { JIT_TIPS, SCRIPTED_STEPS } from '../../src/ui/tutorial/content';

const content = buildContent('absurdistan', 'normal');
const base = initGame(content, 1);

function tip(id: string) {
  const t = JIT_TIPS.find((t) => t.id === id);
  if (!t) throw new Error(`missing tip ${id}`);
  return t;
}

describe('JIT_TIPS: ids are unique and stable (used as one-time persistence keys)', () => {
  it('has no duplicate ids', () => {
    const ids = JIT_TIPS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('JIT_TIPS: danger-zone', () => {
  const t = tip('danger-zone');
  const threshold = content.difficulty.defeatThreshold + 10;

  it('fires when a normal stat drops below the danger threshold', () => {
    const state: GameState = { ...base, stats: { ...base.stats, approval: threshold - 1 } };
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(true);
  });

  it('does not fire when every stat is comfortably inside bounds', () => {
    const safeStats = {
      economy: 60, treasury: 60, approval: 60, eliteLoyalty: 60, stability: 60, development: 60, corruption: 10,
    };
    const state: GameState = { ...base, stats: safeStats };
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(false);
  });

  it('fires for corruption too, mirrored around 100 since it is the inverted stat', () => {
    const state: GameState = { ...base, stats: { ...base.stats, corruption: 100 - threshold + 1 } };
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(true);
  });
});

describe('JIT_TIPS: vector-zone-change', () => {
  const t = tip('vector-zone-change');

  it('does not fire while still inside the session-start zone', () => {
    const state: GameState = { ...base, vector: 10 }; // democratic
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(false);
  });

  it('fires once the current vector has moved into a different zone than the captured start', () => {
    const state: GameState = { ...base, vector: 80 }; // totalitarian
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(true);
  });
});

describe('JIT_TIPS: corruption-50', () => {
  const t = tip('corruption-50');
  const threshold = content.balance.corruptionEliteBondThreshold;

  it('fires only once corruption crosses the elite-bond threshold', () => {
    const below: GameState = { ...base, stats: { ...base.stats, corruption: threshold } };
    const above: GameState = { ...base, stats: { ...base.stats, corruption: threshold + 1 } };
    expect(t.predicate(below, content, { initialZone: 'democratic' })).toBe(false);
    expect(t.predicate(above, content, { initialZone: 'democratic' })).toBe(true);
  });
});

describe('JIT_TIPS: election-approaching', () => {
  const t = tip('election-approaching');
  const termLength = content.difficulty.turnsToWin;

  it('fires only in term 1, within 6 months of the election', () => {
    const closeEnough: GameState = { ...base, term: 1, turn: termLength - 6 };
    const tooEarly: GameState = { ...base, term: 1, turn: termLength - 7 };
    expect(t.predicate(closeEnough, content, { initialZone: 'democratic' })).toBe(true);
    expect(t.predicate(tooEarly, content, { initialZone: 'democratic' })).toBe(false);
  });

  it('never fires in a later term — the constitution-amendment drama is not taught over', () => {
    const term2: GameState = { ...base, term: 2, turn: termLength * 2 - 6 };
    expect(t.predicate(term2, content, { initialZone: 'democratic' })).toBe(false);
  });

  it('stops firing once the election turn itself has arrived', () => {
    const state: GameState = { ...base, term: 1, turn: termLength };
    expect(t.predicate(state, content, { initialZone: 'democratic' })).toBe(false);
  });
});

describe('JIT_TIPS: elite-unpaid', () => {
  const t = tip('elite-unpaid');
  const threshold = content.balance.eliteUnpaidTreasuryThreshold;

  it('fires only once the treasury drops below the elite-unpaid threshold', () => {
    const funded: GameState = { ...base, stats: { ...base.stats, treasury: threshold } };
    const broke: GameState = { ...base, stats: { ...base.stats, treasury: threshold - 1 } };
    expect(t.predicate(funded, content, { initialZone: 'democratic' })).toBe(false);
    expect(t.predicate(broke, content, { initialZone: 'democratic' })).toBe(true);
  });
});

describe('JIT_TIPS: first-event', () => {
  const t = tip('first-event');

  it('fires whenever an event is pending, regardless of which one', () => {
    const idle: GameState = { ...base, pendingEventId: null };
    const pending: GameState = { ...base, pendingEventId: 'whatever-fires-first' };
    expect(t.predicate(idle, content, { initialZone: 'democratic' })).toBe(false);
    expect(t.predicate(pending, content, { initialZone: 'democratic' })).toBe(true);
  });
});

describe('SCRIPTED_STEPS: shape', () => {
  it('runs in the documented order', () => {
    expect(SCRIPTED_STEPS.map((s) => s.id)).toEqual([
      'welcome', 'stats', 'vector', 'clock', 'reformsOpen', 'reformsBuy', 'release',
    ]);
  });

  it('only the action-gated steps hide the "Дальше" button (advanceOn set)', () => {
    const gated = SCRIPTED_STEPS.filter((s) => s.advanceOn).map((s) => s.id);
    expect(gated).toEqual(['reformsOpen', 'reformsBuy']);
  });
});
