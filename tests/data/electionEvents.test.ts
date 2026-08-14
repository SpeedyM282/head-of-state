import { describe, expect, it } from 'vitest';
import { triggeredEvents } from '../../src/data/events/triggered';
import { pickEvent } from '../../src/core/eventEngine';
import { applyPlayerActions } from '../../src/core/actions';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';
import type { GameState } from '../../src/core/types';

const content = buildContent('absurdistan', 'normal');
const turnsToWin = content.difficulty.turnsToWin; // 48

const electionChoice = triggeredEvents.find((e) => e.id === 'trg-election-choice')!;
const constitution = triggeredEvents.find((e) => e.id === 'trg-constitution')!;

function state(patch: Partial<GameState>): GameState {
  return { ...initGame(content, 1), ...patch };
}

describe('trg-election-choice trigger window', () => {
  it('fires in the 3-month window before every term\'s election, not outside it', () => {
    const electionTurn = 1 * turnsToWin; // term 1
    expect(electionChoice.trigger!(state({ term: 1, turn: electionTurn - 4 }), content)).toBe(false);
    expect(electionChoice.trigger!(state({ term: 1, turn: electionTurn - 3 }), content)).toBe(true);
    expect(electionChoice.trigger!(state({ term: 1, turn: electionTurn - 1 }), content)).toBe(true);
    expect(electionChoice.trigger!(state({ term: 1, turn: electionTurn }), content)).toBe(false);
  });

  it('recurs every term, scaled to that term\'s election turn', () => {
    const electionTurn = 3 * turnsToWin; // term 3
    expect(electionChoice.trigger!(state({ term: 3, turn: electionTurn - 3 }), content)).toBe(true);
    expect(electionChoice.trigger!(state({ term: 3, turn: electionTurn - 4 }), content)).toBe(false);
  });

  it('is suppressed once stepDownPending is already set (e.g. a refused amendment)', () => {
    const electionTurn = 2 * turnsToWin; // term 2
    const s = state({ term: 2, turn: electionTurn - 3, stepDownPending: true });
    expect(electionChoice.trigger!(s, content)).toBe(false);
  });

  it("term 2's window (93-95) starts after the constitution question's turn (90)", () => {
    expect(constitution.trigger!(state({ term: 2, turn: 90, constitutionAmended: false }), content)).toBe(true);
    expect(electionChoice.trigger!(state({ term: 2, turn: 90 }), content)).toBe(false);
  });
});

describe('trg-election-choice answers', () => {
  it('"run again" leaves stepDownPending false', () => {
    const s0 = state({ pendingEventId: 'trg-election-choice' });
    const s1 = applyPlayerActions(s0, [{ type: 'answerEvent', optionIndex: 0 }], content);
    expect(s1.pendingEventId).toBeNull();
    expect(s1.stepDownPending).toBe(false);
  });

  it('"step down at your peak" sets stepDownPending', () => {
    const s0 = state({ pendingEventId: 'trg-election-choice' });
    const s1 = applyPlayerActions(s0, [{ type: 'answerEvent', optionIndex: 1 }], content);
    expect(s1.pendingEventId).toBeNull();
    expect(s1.stepDownPending).toBe(true);
  });
});

describe('trg-constitution refusal uses the same step-down flag', () => {
  it('refusing to amend sets stepDownPending (single code path with trg-election-choice)', () => {
    const s0 = state({ pendingEventId: 'trg-constitution', term: 2, turn: 90 });
    const s1 = applyPlayerActions(s0, [{ type: 'answerEvent', optionIndex: 1 }], content);
    expect(s1.constitutionAmended).toBe(false);
    expect(s1.stepDownPending).toBe(true);
  });

  it('amending does not set stepDownPending', () => {
    const s0 = state({ pendingEventId: 'trg-constitution', term: 2, turn: 90 });
    const s1 = applyPlayerActions(s0, [{ type: 'answerEvent', optionIndex: 0 }], content);
    expect(s1.constitutionAmended).toBe(true);
    expect(s1.stepDownPending).toBe(false);
  });
});

describe('pickEvent priority', () => {
  it('trg-election-choice wins its window even if another triggered event is also eligible', () => {
    // Force every random/external roll to fire too, to prove triggered priority still holds.
    const c = { ...content, difficulty: { ...content.difficulty, randomEventChance: 1, externalEventChance: 1 } };
    const s = state({ term: 1, turn: turnsToWin - 3, stats: { ...initGame(content, 1).stats, approval: 5 } }); // also satisfies trg-protests (<30)
    const picked = pickEvent(s, c);
    expect(picked.eventId).toBe('trg-election-choice');
  });
});
