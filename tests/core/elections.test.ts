import { describe, expect, it } from 'vitest';
import { electionThreshold, electionTurn, resolveElection } from '../../src/core/elections';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';
import type { GameState } from '../../src/core/types';

const content = buildContent('normal');
const b = content.balance;

function state(opts: { term?: number; approval?: number; vector?: number; amended?: boolean }): GameState {
  const s = initGame(content, 1);
  const term = opts.term ?? 1;
  return {
    ...s,
    term,
    turn: term * content.difficulty.turnsToWin,
    vector: opts.vector ?? s.vector,
    constitutionAmended: opts.amended ?? false,
    stats: { ...s.stats, approval: opts.approval ?? s.stats.approval },
  };
}

describe('electionTurn / electionThreshold', () => {
  it('lands at the end of each term', () => {
    expect(electionTurn(state({ term: 1 }), content)).toBe(48);
    expect(electionTurn(state({ term: 3 }), content)).toBe(144);
  });

  it('the re-election bar rises each term (escalation)', () => {
    const t1 = electionThreshold(state({ term: 1 }), content);
    const t2 = electionThreshold(state({ term: 2 }), content);
    expect(t1).toBe(b.electionsApprovalToWin);
    expect(t2 - t1).toBe(b.electionApprovalRisePerTerm);
  });
});

describe('resolveElection — democratic zone', () => {
  it('enough approval → new term, awaiting inauguration, stats kept', () => {
    const s = resolveElection(state({ term: 1, vector: 10, approval: 60 }), content);
    expect(s.outcome).toBeNull();
    expect(s.term).toBe(2);
    expect(s.awaitingInauguration).toBe(true);
  });

  it('low approval → elections defeat', () => {
    const s = resolveElection(state({ term: 1, vector: 10, approval: 20 }), content);
    expect(s.outcome?.defeat).toBe('elections');
  });
});

describe('resolveElection — authoritarian «админресурс»', () => {
  it('wins at a lower bar than a democracy would', () => {
    const approval = b.electionsApprovalToWin - 5; // under the democratic bar, over the authoritarian one
    expect(resolveElection(state({ term: 1, vector: 10, approval }), content).outcome?.defeat).toBe('elections');
    const auth = resolveElection(state({ term: 1, vector: 50, approval }), content);
    expect(auth.outcome).toBeNull();
    expect(auth.term).toBe(2);
  });
});

describe('resolveElection — totalitarian', () => {
  it('almost always wins even at zero approval, shoving the vector and docking reputation', () => {
    const before = state({ term: 1, vector: 90, approval: 0 });
    const after = resolveElection(before, content);
    expect(after.awaitingInauguration).toBe(true); // 0.997 — a win for this seed
    expect(after.vector).toBeGreaterThan(before.vector);
    expect(after.stats.economy).toBeLessThan(before.stats.economy);
    expect(after.stats.development).toBeLessThan(before.stats.development);
  });
});

describe('resolveElection — term limit & constitution', () => {
  it('at the term limit without amending, the ruler steps down = victory', () => {
    const s = resolveElection(state({ term: b.termLimit, vector: 50, approval: 10 }), content);
    expect(s.outcome?.result).toBe('victory');
    expect(s.awaitingInauguration).toBe(false);
  });

  it('an amended constitution lets the ruler run past the limit', () => {
    const s = resolveElection(state({ term: b.termLimit, vector: 10, approval: 95, amended: true }), content);
    expect(s.outcome).toBeNull();
    expect(s.term).toBe(b.termLimit + 1);
  });
});

describe('resolveElection — stepDownPending (mandatory per-term run/step-down choice)', () => {
  it('resolves as the step-down victory even in term 1, below the term limit', () => {
    const s = resolveElection({ ...state({ term: 1, vector: 10, approval: 95 }), stepDownPending: true }, content);
    expect(s.outcome?.result).toBe('victory');
    expect(s.awaitingInauguration).toBe(false);
    expect(s.term).toBe(1);
  });

  it('overrides an otherwise-winning election — the choice to leave is final', () => {
    const winning = state({ term: 1, vector: 10, approval: 95 });
    const stayed = resolveElection(winning, content);
    expect(stayed.outcome).toBeNull(); // control: would have won and continued

    const left = resolveElection({ ...winning, stepDownPending: true }, content);
    expect(left.outcome?.result).toBe('victory');
  });

  it('overrides an otherwise-losing election — leaving is a victory, not a defeat', () => {
    const s = resolveElection({ ...state({ term: 1, vector: 10, approval: 5 }), stepDownPending: true }, content);
    expect(s.outcome?.result).toBe('victory');
  });

  it('without the flag, term 1 resolves normally (no premature step-down)', () => {
    const s = resolveElection(state({ term: 1, vector: 10, approval: 95 }), content);
    expect(s.outcome).toBeNull();
    expect(s.term).toBe(2);
  });
});
