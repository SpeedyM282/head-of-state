import type { Effect, GameState } from './types';

export function clampStat(value: number): number {
  return Math.max(0, Math.min(100, value));
}

/** Applies effects immutably. Stats and vector clamp to 0-100; influence floors at 0. */
export function applyEffects(state: GameState, effects: Effect[]): GameState {
  if (effects.length === 0) return state;
  const stats = { ...state.stats };
  let vector = state.vector;
  let influence = state.influence;
  for (const e of effects) {
    if (e.target === 'vector') vector = clampStat(vector + e.delta);
    else if (e.target === 'influence') influence = Math.max(0, influence + e.delta);
    else stats[e.target] = clampStat(stats[e.target] + e.delta);
  }
  return { ...state, stats, vector, influence };
}
