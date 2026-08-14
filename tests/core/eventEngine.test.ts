import { describe, expect, it } from 'vitest';
import { pickEvent } from '../../src/core/eventEngine';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';
import type { GameContent, GameEvent, GameState, LocalizedText } from '../../src/core/types';

const L = (s: string): LocalizedText => ({ en: s, ru: s, uz: s });

function ev(partial: Partial<GameEvent> & Pick<GameEvent, 'id' | 'kind'>): GameEvent {
  return {
    title: L('t'),
    text: L('x'),
    options: [{ text: L('o'), effects: [] }],
    ...partial,
  };
}

/** Content with forced event chances so selection is deterministic given the pool. */
function makeContent(events: GameEvent[]): GameContent {
  const base = buildContent('absurdistan', 'normal');
  return {
    ...base,
    events,
    difficulty: { ...base.difficulty, randomEventChance: 1, externalEventChance: 1 },
  };
}

function stateWith(content: GameContent, patch: Partial<GameState>): GameState {
  return { ...initGame(content, 1), ...patch };
}

describe('pickEvent once-only semantics', () => {
  it('excludes a once-only event that already fired', () => {
    const content = makeContent([ev({ id: 'R1', kind: 'random' }), ev({ id: 'R2', kind: 'random' })]);
    const s = stateWith(content, { turn: 5, eventHistory: { R1: 0 } });
    expect(pickEvent(s, content).eventId).toBe('R2');
  });

  it('external events default to once-only', () => {
    const content = makeContent([ev({ id: 'X1', kind: 'external', zones: ['authoritarian'] })]);
    const fresh = stateWith(content, { turn: 5, vector: 50 }); // vector 50 = authoritarian
    expect(pickEvent(fresh, content).eventId).toBe('X1');
    const fired = stateWith(content, { turn: 5, vector: 50, eventHistory: { X1: 0 } });
    expect(pickEvent(fired, content).eventId).toBeNull();
  });

  it('triggered events are repeatable (re-fire after cooldown despite history)', () => {
    const content = makeContent([ev({ id: 'T', kind: 'triggered', trigger: () => true, cooldown: 3 })]);
    const onCd = stateWith(content, { turn: 2, eventHistory: { T: 0 } });
    expect(pickEvent(onCd, content).eventId).toBeNull(); // 2 - 0 < 3
    const offCd = stateWith(content, { turn: 3, eventHistory: { T: 0 } });
    expect(pickEvent(offCd, content).eventId).toBe('T'); // 3 - 0 >= 3
  });
});

describe('pickEvent pool exhaustion', () => {
  it('fires nothing (no crash) when every eligible event is used up', () => {
    const content = makeContent([ev({ id: 'R1', kind: 'random' }), ev({ id: 'R2', kind: 'random' })]);
    const s = stateWith(content, { turn: 5, eventHistory: { R1: 0, R2: 0 } });
    expect(() => pickEvent(s, content)).not.toThrow();
    expect(pickEvent(s, content).eventId).toBeNull();
  });

  it('handles an entirely empty event pool', () => {
    const content = makeContent([]);
    const s = stateWith(content, { turn: 5 });
    expect(pickEvent(s, content).eventId).toBeNull();
  });
});
