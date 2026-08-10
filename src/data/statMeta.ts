import type { StatKey, Stats } from '../core/types';

/**
 * Stats where HIGHER is WORSE (today: only corruption). Everything else follows the
 * default "higher is better" semantics. UI reads this map instead of hardcoding an
 * if-chain per stat — StatRow danger/trend coloring, effect-line coloring on event and
 * reform cards. Purely a presentation concern: core never reads this file.
 */
const INVERTED_STATS: ReadonlySet<StatKey> = new Set(['corruption']);

export function isInverted(stat: StatKey): boolean {
  return INVERTED_STATS.has(stat);
}

/**
 * A stat reads as "in danger" when it crosses toward its bad end — high for inverted
 * stats, low for everything else. `threshold` is the same low-end margin the rest of the
 * ui uses (e.g. content.difficulty.defeatThreshold + a buffer); for inverted stats it is
 * mirrored around 100.
 */
export function isDangerous(stat: StatKey, value: number, threshold: number): boolean {
  return isInverted(stat) ? value > 100 - threshold : value < threshold;
}

/**
 * Average of all stats, normalized so every one reads "higher is better" first (inverted
 * stats flip around 100). A plain average would let high corruption inflate this score;
 * this is the "how well is the country doing" proxy the victory rank is computed from.
 */
export function averageGoodness(stats: Stats): number {
  const keys = Object.keys(stats) as StatKey[];
  const normalized = keys.map((key) => (isInverted(key) ? 100 - stats[key] : stats[key]));
  return normalized.reduce((a, b) => a + b, 0) / normalized.length;
}
