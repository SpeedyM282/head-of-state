import type { DefeatKind, GameContent, GameState } from './types';
import { vectorZone } from './vector';

/**
 * Defeats per GDD §9. Each condition must stay "armed" for defeatGraceTurns
 * consecutive turns before firing — the player gets a visible chance to recover.
 * Elections (democratic zone only) fire instantly on the election turn.
 */
export function checkConditions(state: GameState, content: GameContent): GameState {
  if (state.outcome) return state;
  const { defeatThreshold, defeatGraceTurns, turnsToWin } = content.difficulty;
  const b = content.balance;
  const zone = vectorZone(state.vector);

  const armed: Record<DefeatKind, boolean> = {
    coup: state.stats.eliteLoyalty < defeatThreshold,
    revolution:
      state.stats.approval < defeatThreshold &&
      state.stats.stability < b.revolutionStabilityCeiling,
    default: state.stats.treasury <= 0,
    elections: false, // handled separately below
  };
  // Totalitarian zone: coup and revolution bite harder (GDD §5) — effectively a higher threshold.
  if (zone === 'totalitarian') {
    armed.coup = state.stats.eliteLoyalty < defeatThreshold + 10;
    armed.revolution =
      state.stats.approval < defeatThreshold + 10 &&
      state.stats.stability < b.revolutionStabilityCeiling;
  }

  const counters = { ...state.defeatCounters };
  for (const kind of ['coup', 'revolution', 'default'] as const) {
    counters[kind] = armed[kind] ? counters[kind] + 1 : 0;
    if (counters[kind] >= defeatGraceTurns) {
      return {
        ...state,
        defeatCounters: counters,
        outcome: { result: 'defeat', defeat: kind, turn: state.turn },
      };
    }
  }

  // Elections: democratic zone only, every N turns, instant.
  if (
    zone === 'democratic' &&
    state.turn > 0 &&
    state.turn % b.electionsEveryTurns === 0 &&
    state.stats.approval < b.electionsApprovalToWin
  ) {
    return {
      ...state,
      defeatCounters: counters,
      outcome: { result: 'defeat', defeat: 'elections', turn: state.turn },
    };
  }

  if (state.turn >= turnsToWin) {
    return {
      ...state,
      defeatCounters: counters,
      outcome: { result: 'victory', turn: state.turn },
    };
  }

  return { ...state, defeatCounters: counters };
}
