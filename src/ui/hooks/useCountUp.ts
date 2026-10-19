import { useLayoutEffect, useState } from 'react';

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Presentation-only count-up for a hero number (game over's months in power): animates
 * 0 → `target` once on mount with an ease-out cubic over `durationMs`. The initial state is the
 * FINAL value, so anything that renders without running effects (snapshots, reduced motion)
 * shows the real number, never 0. The animation starts in a layout effect, before first paint,
 * so the final value never flashes before the count begins.
 */
export function useCountUp(target: number, durationMs = 1400): number {
  const [value, setValue] = useState(target);

  useLayoutEffect(() => {
    if (prefersReducedMotion() || target <= 0) {
      setValue(target);
      return;
    }
    let frame = 0;
    const start = performance.now();
    setValue(0);
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
