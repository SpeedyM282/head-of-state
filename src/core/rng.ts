// Seeded, serializable PRNG (mulberry32). Pure functions: state in, [value, state] out.
// The core must never call Math.random() — determinism enables replays and multiplayer.

export type RngState = number;

export function seedRng(seed: number): RngState {
  return seed >>> 0;
}

/** One mulberry32 step. Returns a float in [0, 1) and the next state. */
export function nextFloat(state: RngState): [number, RngState] {
  let s = (state + 0x6d2b79f5) >>> 0;
  let t = s;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, s];
}

export function nextInt(state: RngState, maxExclusive: number): [number, RngState] {
  const [f, s] = nextFloat(state);
  return [Math.floor(f * maxExclusive), s];
}

export function pick<T>(state: RngState, items: readonly T[]): [T, RngState] {
  const [i, s] = nextInt(state, items.length);
  return [items[i], s];
}

/** Returns [true, state] with probability p. */
export function chance(state: RngState, p: number): [boolean, RngState] {
  const [f, s] = nextFloat(state);
  return [f < p, s];
}
