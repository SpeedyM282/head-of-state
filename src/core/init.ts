import { clampStat } from './effects';
import type { CountryProfile, DifficultyConfig, GameContent, GameState, Stats } from './types';
import { seedRng } from './rng';

/** Derives economy/corruption/development from the country's levels plus the difficulty's
 * offset; treasury/approval/eliteLoyalty/stability come from the difficulty alone. */
export function deriveStartStats(profile: CountryProfile, difficulty: DifficultyConfig): Stats {
  return {
    economy: clampStat(profile.economyLevel + difficulty.levelOffsets.economy),
    corruption: clampStat(profile.corruptionLevel + difficulty.levelOffsets.corruption),
    development: clampStat(profile.developmentLevel + difficulty.levelOffsets.development),
    treasury: difficulty.startStats.treasury,
    approval: difficulty.startStats.approval,
    eliteLoyalty: difficulty.startStats.eliteLoyalty,
    stability: difficulty.startStats.stability,
  };
}

/** 0 = democracy, 100 = totalitarianism — inverted from the country's democracy level. */
export function deriveStartVector(profile: CountryProfile): number {
  return clampStat(100 - profile.democracyLevel);
}

export function initGame(content: GameContent, seed: number): GameState {
  const stats = {
    ...deriveStartStats(content.country, content.difficulty),
    ...content.country.startStatsOverride,
  };
  return {
    turn: 0,
    stats,
    vector: deriveStartVector(content.country),
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
