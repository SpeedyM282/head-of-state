import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildContent } from '../../src/data';
import { initGame } from '../../src/core/init';
import type { DefeatKind } from '../../src/core/types';
import { useMedalStore } from '../../src/store/medalStore';
import { loadMedals } from '../../src/store/persistence';

/** Same minimal in-memory Storage stand-in as tests/store/persistence.test.ts. */
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

const content = buildContent('absurdistan', 'normal');
const base = initGame(content, 7);

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
  useMedalStore.setState({ earned: [], unseen: [], defeatsSeen: [], earnedThisGame: [], gameSeed: null });
});

afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe('medalStore.evaluate', () => {
  it('earns, persists and marks new medals unseen', () => {
    useMedalStore.getState().evaluate({ ...base, stats: { ...base.stats, economy: 90 } }, content);
    const s = useMedalStore.getState();
    expect(s.earned).toEqual(['invisible-hand']);
    expect(s.unseen).toEqual(['invisible-hand']);
    expect(s.earnedThisGame).toEqual(['invisible-hand']);
    expect(loadMedals().earned).toEqual(['invisible-hand']);
  });

  it('never re-earns, and resets the per-game list on a new seed', () => {
    const rich = { ...base, stats: { ...base.stats, economy: 90 } };
    useMedalStore.getState().evaluate(rich, content);
    useMedalStore.getState().evaluate(rich, content);
    expect(useMedalStore.getState().earned).toEqual(['invisible-hand']);

    useMedalStore.getState().evaluate({ ...rich, seed: 99 }, content);
    expect(useMedalStore.getState().earnedThisGame).toEqual([]);
    expect(useMedalStore.getState().earned).toEqual(['invisible-hand']);
  });

  it('records each defeat kind once, across games', () => {
    const lose = (defeat: DefeatKind, seed: number) =>
      useMedalStore.getState().evaluate({ ...base, seed, outcome: { result: 'defeat', defeat, turn: 10 } }, content);
    lose('coup', 1);
    lose('coup', 2);
    lose('revolution', 3);
    lose('default', 4);
    expect(useMedalStore.getState().defeatsSeen).toEqual(['coup', 'revolution', 'default']);
    expect(useMedalStore.getState().earned).not.toContain('disaster-collector');
    lose('elections', 5);
    expect(useMedalStore.getState().earned).toContain('disaster-collector');
    expect(loadMedals().defeatsSeen).toEqual(['coup', 'revolution', 'default', 'elections']);
  });
});

describe('medalStore.markAllSeen', () => {
  it('clears the unseen list and persists it', () => {
    useMedalStore.getState().evaluate({ ...base, stats: { ...base.stats, economy: 90 } }, content);
    useMedalStore.getState().markAllSeen();
    expect(useMedalStore.getState().unseen).toEqual([]);
    expect(loadMedals()).toEqual({ earned: ['invisible-hand'], unseen: [], defeatsSeen: [] });
  });
});
