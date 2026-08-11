import type { GameContent, GameState } from './types';
import { applyEffects } from './effects';
import { vectorZone } from './vector';
import { chance } from './rng';

/** The turn (month) the current term's election lands on: end of the term. */
export function electionTurn(state: GameState, content: GameContent): number {
  return state.term * content.difficulty.turnsToWin;
}

/** Approval needed to win re-election this term (rises per term via escalation). */
export function electionThreshold(state: GameState, content: GameContent): number {
  const b = content.balance;
  return b.electionsApprovalToWin + (state.term - 1) * b.electionApprovalRisePerTerm;
}

/**
 * Resolve the end-of-term election. Call only when state.turn === electionTurn(state, content).
 * The zone bends the honesty of the vote (satire of election integrity):
 *  - democratic: win if approval >= threshold
 *  - authoritarian: win if approval >= threshold - margin («админресурс»)
 *  - totalitarian: almost always "wins", but each win shoves the vector and costs reputation
 *
 * Outcomes:
 *  - step down (term limit reached, constitution un-amended) → VICTORY (the good ending)
 *  - lose → 'elections' defeat
 *  - win → term++, awaitingInauguration set; stats are NOT reset — the country remembers.
 *
 * Pure and deterministic: totalitarian's coin-flip flows through state.rngState.
 */
export function resolveElection(state: GameState, content: GameContent): GameState {
  const b = content.balance;

  // Constitution: once the term limit is reached, running again needs an amendment.
  // Without it the ruler steps down of their own accord — the canonical "good ending".
  if (state.term >= b.termLimit && !state.constitutionAmended) {
    return { ...state, outcome: { result: 'victory', turn: state.turn } };
  }

  const zone = vectorZone(state.vector);
  const threshold = electionThreshold(state, content);

  let s = state;
  let won: boolean;
  if (zone === 'totalitarian') {
    const [wins, rng] = chance(s.rngState, b.totalitarianElectionWinChance);
    s = { ...s, rngState: rng };
    won = wins;
    if (won) {
      s = applyEffects(s, [
        { target: 'vector', delta: b.totalitarianElectionVectorShift },
        { target: 'economy', delta: -b.totalitarianElectionEconomyHit },
        { target: 'development', delta: -b.totalitarianElectionDevelopmentHit },
      ]);
    }
  } else if (zone === 'authoritarian') {
    won = s.stats.approval >= threshold - b.authoritarianElectionMargin;
  } else {
    won = s.stats.approval >= threshold;
  }

  if (!won) {
    return { ...s, outcome: { result: 'defeat', defeat: 'elections', turn: s.turn } };
  }
  return { ...s, term: s.term + 1, awaitingInauguration: true };
}
