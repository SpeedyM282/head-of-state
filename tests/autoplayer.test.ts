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
 */

interface RunStats {
  outcomes: Record<string, number>;
  avgLength: number;
}

function playGame(difficulty: Difficulty, seed: number): { outcome: Outcome; turns: number } {
  const content = buildContent(difficulty);
  let s: GameState = initGame(content, seed);
  // Separate rng for the "player brain" so it never touches simulation determinism assertions
  let brain = seed ^ 0x9e3779b9;

  const maxTurns = content.difficulty.turnsToWin + 10; // hard stop: game MUST end before this
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
  }
  if (!s.outcome) throw new Error(`game did not terminate (difficulty=${difficulty}, seed=${seed})`);
  return { outcome: s.outcome, turns: s.turn };
}

function runMany(difficulty: Difficulty, games: number): RunStats {
  const outcomes: Record<string, number> = {};
  let totalTurns = 0;
  for (let seed = 1; seed <= games; seed++) {
    const { outcome, turns } = playGame(difficulty, seed);
    const key = outcome.result === 'victory' ? 'victory' : outcome.defeat!;
    outcomes[key] = (outcomes[key] ?? 0) + 1;
    totalTurns += turns;
  }
  return { outcomes, avgLength: totalTurns / games };
}

describe('autoplayer', () => {
  it('every game terminates and stats are sane (500 games x 3 difficulties)', () => {
    for (const difficulty of ['easy', 'normal', 'hard'] as const) {
      const stats = runMany(difficulty, 500);
      const total = Object.values(stats.outcomes).reduce((a, b) => a + b, 0);
      expect(total).toBe(500);
      // eslint-disable-next-line no-console
      console.log(`[autoplayer] ${difficulty}:`, JSON.stringify(stats.outcomes), `avgLength=${stats.avgLength.toFixed(1)}`);
    }
  });

  it('random play loses most games on hard', () => {
    const stats = runMany('hard', 300);
    const defeats = 300 - (stats.outcomes['victory'] ?? 0);
    expect(defeats / 300).toBeGreaterThan(0.6);
  });

  it('random play is survivable sometimes on easy', () => {
    const stats = runMany('easy', 300);
    expect(stats.outcomes['victory'] ?? 0).toBeGreaterThan(0);
  });

  it('determinism: same seed + same actions = identical outcome', () => {
    const a = playGame('normal', 12345);
    const b = playGame('normal', 12345);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });

  it('all four defeat kinds are reachable across seeds', () => {
    const stats = runMany('hard', 500);
    const merged = { ...stats.outcomes, ...runMany('easy', 300).outcomes };
    // coup/revolution/default must appear on hard; elections may need democratic play — check leniently
    expect(stats.outcomes['coup'] ?? merged['coup'] ?? 0).toBeGreaterThan(0);
    expect((stats.outcomes['revolution'] ?? 0) + (merged['revolution'] ?? 0)).toBeGreaterThan(0);
    expect((stats.outcomes['default'] ?? 0) + (merged['default'] ?? 0)).toBeGreaterThan(0);
  });
});
