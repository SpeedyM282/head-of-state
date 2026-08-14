import { describe, expect, it } from 'vitest';
import { applyPlayerActions } from '../src/core/actions';
import { initGame } from '../src/core/init';
import { nextInt } from '../src/core/rng';
import { tick } from '../src/core/tick';
import type { Difficulty, GameState, Outcome } from '../src/core/types';
import { buildContent } from '../src/data';

/**
 * Autoplayer: plays full games with a random strategy.
 * Purpose: (1) the simulation always terminates, (2) outcome distribution is sane,
 * (3) determinism holds. Run after every balance change and compare the printed stats.
 *
 * Games span multiple 48-month terms now (elections at the end of each term; open-ended
 * after a constitution amendment), so the hard-stop covers ~6 terms. Per-term escalation
 * must force termination well within that.
 */

interface RunStats {
  outcomes: Record<string, number>;
  avgLength: number;
}

function playGame(countryId: string, difficulty: Difficulty, seed: number): { outcome: Outcome; turns: number; term: number } {
  const content = buildContent(countryId, difficulty);
  let s: GameState = initGame(content, seed);
  // Separate rng for the "player brain" so it never touches simulation determinism assertions
  let brain = seed ^ 0x9e3779b9;

  const maxTurns = content.difficulty.turnsToWin * 6 + 20; // ~6 terms: game MUST end before this
  while (!s.outcome && s.turn < maxTurns) {
    // Answer a pending event randomly.
    if (s.pendingEventId) {
      const event = content.events.find((e) => e.id === s.pendingEventId);
      const [idx, b1] = nextInt(brain, event?.options.length ?? 1);
      brain = b1;
      s = applyPlayerActions(s, [{ type: 'answerEvent', optionIndex: idx }], content);
    }
    // Sometimes try to buy a random reform.
    const [roll, b2] = nextInt(brain, 3);
    brain = b2;
    if (roll === 0) {
      const [ri, b3] = nextInt(brain, content.reforms.length);
      brain = b3;
      s = applyPlayerActions(s, [{ type: 'buyReform', reformId: content.reforms[ri].id }], content);
    }
    s = tick(s, content).state;
    // The inter-term inauguration is a ui pause; the sim just continues into the new term.
    if (s.awaitingInauguration) s = { ...s, awaitingInauguration: false };
  }
  if (!s.outcome) throw new Error(`game did not terminate (country=${countryId}, difficulty=${difficulty}, seed=${seed})`);
  return { outcome: s.outcome, turns: s.turn, term: s.term };
}

function runMany(countryId: string, difficulty: Difficulty, games: number): RunStats {
  const outcomes: Record<string, number> = {};
  let totalTurns = 0;
  for (let seed = 1; seed <= games; seed++) {
    const { outcome, turns } = playGame(countryId, difficulty, seed);
    const key = outcome.result === 'victory' ? 'victory' : outcome.defeat!;
    outcomes[key] = (outcomes[key] ?? 0) + 1;
    totalTurns += turns;
  }
  return { outcomes, avgLength: totalTurns / games };
}

describe('autoplayer', () => {
  it('every game terminates and stats are sane (500 games x 3 difficulties)', () => {
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const stats = runMany('absurdistan', difficulty, 500);
      const total = Object.values(stats.outcomes).reduce((a, b) => a + b, 0);
      expect(total).toBe(500);
      // eslint-disable-next-line no-console
      console.log(`[autoplayer] absurdistan/${difficulty}:`, JSON.stringify(stats.outcomes), `avgLength=${stats.avgLength.toFixed(1)}`);
    }
  });

  it('random play loses most games on hard', () => {
    const stats = runMany('absurdistan', 'hard', 300);
    const defeats = 300 - (stats.outcomes['victory'] ?? 0);
    expect(defeats / 300).toBeGreaterThan(0.6);
  });

  it('the step-down victory is reachable — some easy games end by voluntarily leaving power', () => {
    const stats = runMany('absurdistan', 'easy', 500);
    expect(stats.outcomes['victory'] ?? 0).toBeGreaterThan(0);
  });

  it('the mandatory per-term choice does not collapse the game into a single term — both '
    + 'stepping down early and running into a later term are reachable', () => {
    let sawTerm1Only = false;
    let sawTerm2Plus = false;
    for (let seed = 1; seed <= 500; seed++) {
      const { term } = playGame('absurdistan', 'easy', seed);
      if (term >= 2) sawTerm2Plus = true;
      else sawTerm1Only = true;
    }
    expect(sawTerm1Only).toBe(true); // some games resolve (step down or lose) within term 1
    expect(sawTerm2Plus).toBe(true); // some games choose to run again and reach a later term
  });

  it('determinism: same seed + same actions = identical outcome', () => {
    const a = playGame('absurdistan', 'normal', 12345);
    const b = playGame('absurdistan', 'normal', 12345);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('all four defeat kinds AND the step-down victory are reachable across seeds', () => {
    const hard = runMany('absurdistan', 'hard', 500).outcomes;
    const easy = runMany('absurdistan', 'easy', 500).outcomes;
    const merged: Record<string, number> = {};
    for (const src of [hard, easy]) for (const [k, v] of Object.entries(src)) merged[k] = (merged[k] ?? 0) + v;

    for (const kind of ['coup', 'revolution', 'default', 'elections'] as const) {
      expect(merged[kind] ?? 0, `${kind} should be reachable`).toBeGreaterThan(0);
    }
    // Step-down victory (the good ending) must be reachable too.
    expect(merged['victory'] ?? 0, 'step-down victory should be reachable').toBeGreaterThan(0);
  });
});

// Country profiles now shape starting stats and the starting governance vector (see
// core/init.ts deriveStartStats/deriveStartVector). Absurdistan is the calibrated baseline;
// Norway/Bulgaria/Serbia span the rest of the real-country spread (high/mid/low levels,
// Serbia additionally starting deep in the authoritarian zone) — this just confirms the
// simulation stays sane (terminates, produces a believable outcome mix) across that spread.
describe('autoplayer across country profiles', () => {
  const PROFILES = ['absurdistan', 'no', 'bg', 'rs'] as const;
  const GAMES_PER_CELL = 150;

  it('every profile x difficulty cell terminates; per-profile outcome stats are reported', () => {
    for (const countryId of PROFILES) {
      for (const difficulty of ['easy', 'normal', 'hard'] as const) {
        const stats = runMany(countryId, difficulty, GAMES_PER_CELL);
        const total = Object.values(stats.outcomes).reduce((a, b) => a + b, 0);
        expect(total).toBe(GAMES_PER_CELL);
        // eslint-disable-next-line no-console
        console.log(
          `[autoplayer] ${countryId}/${difficulty}:`,
          JSON.stringify(stats.outcomes),
          `avgLength=${stats.avgLength.toFixed(1)}`,
        );
      }
    }
  });
});
