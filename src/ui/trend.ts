import type { StatKey } from '../core/types';
import { isInverted } from '../data/statMeta';

export type TrendDirection = 'up' | 'down' | 'flat';

/** Below this magnitude a delta reads as noise, not a real move. */
const EPSILON = 0.5;

export function trendDirection(delta: number): TrendDirection {
  if (delta > EPSILON) return 'up';
  if (delta < -EPSILON) return 'down';
  return 'flat';
}

export function trendGlyph(direction: TrendDirection): string {
  return direction === 'up' ? '▲' : direction === 'down' ? '▼' : '—';
}

/**
 * Color for a stat's movement: green = good news, red = bad news, muted = flat. Direction
 * alone doesn't say whether it's good news — inverted stats (corruption) flip it, so rising
 * corruption colors red, not green.
 */
export function trendColor(stat: StatKey, direction: TrendDirection): string {
  if (direction === 'flat') return 'var(--text-faint)';
  const goodNews = isInverted(stat) ? direction === 'down' : direction === 'up';
  return goodNews ? 'var(--ok)' : 'var(--stamp)';
}
