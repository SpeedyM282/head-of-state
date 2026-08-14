import type { GameContent, GameState } from './types';
import { seedRng } from './rng';

export function initGame(content: GameContent, seed: number): GameState {
  const stats = {
    ...content.difficulty.startStats,
    ...content.country.startStatsOverride,
  };
  return {
    turn: 0,
    stats,
    vector: 50, // start in the middle of the authoritarian zone — player's choices push it
    influence: content.balance.startingInfluence,
    term: 1,
    constitutionAmended: false,
    stepDownPending: false,
    awaitingInauguration: false,
    scheduledEffects: [],
    ownedReforms: [],
    pendingEventId: null,
    eventHistory: {},
    defeatCounters: { coup: 0, revolution: 0, default: 0, elections: 0 },
    difficulty: content.difficulty.id,
    countryId: content.country.id,
    seed,
    rngState: seedRng(seed),
    outcome: null,
    log: [],
  };
}
