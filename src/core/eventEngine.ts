import type { GameContent, GameEvent, GameState } from './types';
import { chance, pick } from './rng';
import { vectorZone } from './vector';

interface PickedEvent {
  state: GameState;
  eventId: string | null;
}

const DEFAULT_COOLDOWN = 6;

/** An event whose id is in eventHistory has fired at least once this game. */
function firedBefore(state: GameState, eventId: string): boolean {
  return state.eventHistory[eventId] !== undefined;
}

function offCooldown(state: GameState, eventId: string, cooldown: number): boolean {
  const last = state.eventHistory[eventId];
  return last === undefined || state.turn - last >= cooldown;
}

/** Default: random & external fire once per game; triggered are repeatable. */
function isOnce(event: GameEvent): boolean {
  return event.once ?? event.kind !== 'triggered';
}

/** An event may be selected only if it has not exhausted its once-limit and is off cooldown. */
function eligible(state: GameState, event: GameEvent): boolean {
  if (isOnce(event) && firedBefore(state, event.id)) return false;
  return offCooldown(state, event.id, event.cooldown ?? DEFAULT_COOLDOWN);
}

/**
 * Event priority per GDD §7: triggered > external (by vector zone) > random.
 * Consumes rng state; returns updated state and the fired event id, if any.
 * If a category has no eligible events left (pool exhausted), it simply does not fire.
 */
export function pickEvent(state: GameState, content: GameContent): PickedEvent {
  // 1. Triggered events: fire immediately when their predicate holds.
  for (const e of content.events) {
    if (e.kind !== 'triggered' || !e.trigger) continue;
    if (!eligible(state, e)) continue;
    if (e.trigger(state, content)) return { state, eventId: e.id };
  }

  let rng = state.rngState;

  // 2. External events for the current zone.
  const zone = vectorZone(state.vector);
  const external = content.events.filter(
    (e) => e.kind === 'external' && e.zones?.includes(zone) && eligible(state, e),
  );
  if (external.length > 0) {
    const [fires, r1] = chance(rng, content.difficulty.externalEventChance);
    rng = r1;
    if (fires) {
      const [event, r2] = pick(rng, external);
      return { state: { ...state, rngState: r2 }, eventId: event.id };
    }
  }

  // 3. Random events.
  const random = content.events.filter((e) => e.kind === 'random' && eligible(state, e));
  if (random.length > 0) {
    const [fires, r1] = chance(rng, content.difficulty.randomEventChance);
    rng = r1;
    if (fires) {
      const [event, r2] = pick(rng, random);
      return { state: { ...state, rngState: r2 }, eventId: event.id };
    }
  }

  return { state: { ...state, rngState: rng }, eventId: null };
}
