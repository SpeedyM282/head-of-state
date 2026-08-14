import type { Difficulty, DifficultyConfig } from '../core/types';

/** Months per in-game year — one tick is one month. */
const MONTHS_PER_YEAR = 12;

/** Fill the derived turnsToWin (= yearsToWin * 12) so the literal lives in one place. */
function withTurns(cfg: Omit<DifficultyConfig, 'turnsToWin'>): DifficultyConfig {
  return { ...cfg, turnsToWin: cfg.yearsToWin * MONTHS_PER_YEAR };
}

/**
 * GDD §8. Every difficulty is a single 4-year term (48 months). Since length is now equal,
 * difficulty comes ONLY from crisis density (event chances), thresholds, starting stats and
 * external pressure — the levers still climb clearly easy → normal → hard.
 */
export const difficulties: Record<Difficulty, DifficultyConfig> = {
  easy: withTurns({
    id: 'easy',
    startStats: { treasury: 65, approval: 65, eliteLoyalty: 65, stability: 65 },
    // Back-derived from the old absolute values (65/60/20) against Absurdistan's baseline
    // levels (50/45/30) so Absurdistan+normal stays byte-identical to pre-country-select behavior.
    levelOffsets: { economy: 15, development: 15, corruption: -10 },
    randomEventChance: 0.16,
    externalEventChance: 0.08,
    defeatThreshold: 10,
    defeatGraceTurns: 4,
    yearsToWin: 4, // 48 months
    externalPressure: 0,
  }),
  normal: withTurns({
    id: 'normal',
    startStats: { treasury: 50, approval: 50, eliteLoyalty: 50, stability: 50 },
    levelOffsets: { economy: 0, development: 0, corruption: 0 },
    randomEventChance: 0.24,
    externalEventChance: 0.12,
    defeatThreshold: 15,
    defeatGraceTurns: 3,
    yearsToWin: 4, // 48 months
    externalPressure: 0.33,
  }),
  hard: withTurns({
    id: 'hard',
    startStats: { treasury: 35, approval: 45, eliteLoyalty: 40, stability: 40 },
    levelOffsets: { economy: -10, development: -10, corruption: 15 },
    randomEventChance: 0.34,
    externalEventChance: 0.18,
    defeatThreshold: 20,
    defeatGraceTurns: 3,
    yearsToWin: 4, // 48 months
    externalPressure: 0.67,
  }),
};
