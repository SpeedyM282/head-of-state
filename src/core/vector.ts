import type { VectorZone } from './types';

/** Zone boundaries per GDD §5: 0-33 democratic, 34-66 authoritarian, 67-100 totalitarian. */
export function vectorZone(vector: number): VectorZone {
  if (vector <= 33) return 'democratic';
  if (vector <= 66) return 'authoritarian';
  return 'totalitarian';
}
