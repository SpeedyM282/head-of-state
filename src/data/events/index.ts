import type { GameEvent } from '../../core/types';
import { randomEvents } from './random';
import { triggeredEvents } from './triggered';
import { externalEvents } from './external';

/**
 * Full event pool (GDD §7): 24 random + 8 triggered + 12 external = 44.
 * Random & external are once-only (drain over a game); triggered are repeatable
 * pressure mechanics on cooldown. See each file and GameEvent.once.
 */
export const events: GameEvent[] = [...randomEvents, ...triggeredEvents, ...externalEvents];
