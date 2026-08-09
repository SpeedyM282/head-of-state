import { describe, expect, it } from 'vitest';
import { chance, nextFloat, nextInt, seedRng } from '../../src/core/rng';

describe('rng', () => {
  it('is deterministic: same seed produces the same sequence', () => {
    let a = seedRng(42);
    let b = seedRng(42);
    for (let i = 0; i < 100; i++) {
      const [va, na] = nextFloat(a);
      const [vb, nb] = nextFloat(b);
      expect(va).toBe(vb);
      a = na;
      b = nb;
    }
  });

  it('different seeds diverge', () => {
    const [a] = nextFloat(seedRng(1));
    const [b] = nextFloat(seedRng(2));
    expect(a).not.toBe(b);
  });

  it('nextFloat stays in [0, 1)', () => {
    let s = seedRng(7);
    for (let i = 0; i < 1000; i++) {
      const [v, ns] = nextFloat(s);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
      s = ns;
    }
  });

  it('nextInt respects bounds', () => {
    let s = seedRng(9);
    for (let i = 0; i < 500; i++) {
      const [v, ns] = nextInt(s, 5);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
      s = ns;
    }
  });

  it('chance(p=1) is always true, chance(p=0) always false', () => {
    const [t] = chance(seedRng(3), 1);
    const [f] = chance(seedRng(3), 0);
    expect(t).toBe(true);
    expect(f).toBe(false);
  });
});
