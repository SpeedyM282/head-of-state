import { useEffect, useState } from 'react';

/**
 * The one JS-driven responsive primitive in the app — everywhere else, layout switches on
 * plain Tailwind breakpoints (`tablet:`/`desktop:` custom variants in index.css), which CSS can
 * express on its own. This hook exists only for the two things CSS genuinely cannot express:
 * (1) OrientationGate's side effect of pausing the game clock when a phone is held portrait,
 * and (2) WorldMap's SVG viewBox/projection numbers, which are JS values, not stylable classes.
 */
export interface Viewport {
  width: number;
  height: number;
  /** Mirrors the `pointer: fine` media feature — part of this app's "desktop" definition
   * alongside width, matching the `desktop:` custom variant in index.css. */
  pointerFine: boolean;
}

function readViewport(): Viewport {
  if (typeof window === 'undefined') return { width: 0, height: 0, pointerFine: false };
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    pointerFine: window.matchMedia('(pointer: fine)').matches,
  };
}

export function useViewport(): Viewport {
  const [viewport, setViewport] = useState<Viewport>(readViewport);

  useEffect(() => {
    const update = () => setViewport(readViewport());
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    const pointerQuery = window.matchMedia('(pointer: fine)');
    // Safari < 14 lacks addEventListener on MediaQueryList; addListener is its deprecated
    // equivalent. Both are still wired so the pointer-type flip is caught either way.
    pointerQuery.addEventListener?.('change', update);
    pointerQuery.addListener?.(update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
      pointerQuery.removeEventListener?.('change', update);
      pointerQuery.removeListener?.(update);
    };
  }, []);

  return viewport;
}

/** Phone-sized and portrait — exactly OrientationGate's trigger condition (see GDD/ARCHITECTURE). */
export function isPhonePortrait(vp: Viewport): boolean {
  return vp.width < 768 && vp.height > vp.width;
}

export type FormFactor = 'phoneLandscape' | 'tablet' | 'desktop';

/** Mirrors the `tablet:`/`desktop:` custom variants in index.css exactly, so WorldMap's frame-
 * bucket choice always lines up with which CSS layout is actually on screen. */
export function classifyFormFactor(vp: Viewport): FormFactor {
  if (vp.width >= 1280 && vp.pointerFine) return 'desktop';
  if (vp.width >= 768 && vp.height >= 500) return 'tablet';
  return 'phoneLandscape';
}
