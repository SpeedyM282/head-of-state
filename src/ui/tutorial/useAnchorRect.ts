import { useEffect, useState } from 'react';
import type { TutorialAnchor } from './content';

export interface AnchorRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function unionRects(rects: AnchorRect[]): AnchorRect | null {
  if (rects.length === 0) return null;
  let minTop = Infinity;
  let minLeft = Infinity;
  let maxBottom = -Infinity;
  let maxRight = -Infinity;
  for (const r of rects) {
    minTop = Math.min(minTop, r.top);
    minLeft = Math.min(minLeft, r.left);
    maxBottom = Math.max(maxBottom, r.top + r.height);
    maxRight = Math.max(maxRight, r.left + r.width);
  }
  return { top: minTop, left: minLeft, width: maxRight - minLeft, height: maxBottom - minTop };
}

function computeAnchorRect(anchor: TutorialAnchor): AnchorRect | null {
  if (!anchor) return null;
  const ids = Array.isArray(anchor) ? anchor : [anchor];
  const rects: AnchorRect[] = [];
  for (const id of ids) {
    document.querySelectorAll<HTMLElement>(`[data-tutorial="${id}"]`).forEach((el) => {
      // Matches the `tablet:hidden`/`hidden tablet:flex` pattern used to swap layouts —
      // an element hidden by CSS at the current form factor has no offsetParent.
      if (el.offsetParent === null) return;
      const r = el.getBoundingClientRect();
      rects.push({ top: r.top, left: r.left, width: r.width, height: r.height });
    });
  }
  return unionRects(rects);
}

/**
 * Tracks the viewport-relative bounding box of the DOM node(s) tagged `data-tutorial="<id>"`
 * for the given anchor, re-measuring on a light poll plus resize — the anchors are ordinary
 * layout elements (no ResizeObserver plumbing per-anchor is warranted at this scope). Returns
 * null while nothing matches yet (e.g. the reforms panel hasn't mounted) or for a null anchor.
 */
export function useAnchorRect(anchor: TutorialAnchor): AnchorRect | null {
  const [rect, setRect] = useState<AnchorRect | null>(() => computeAnchorRect(anchor));

  useEffect(() => {
    const update = () => setRect(computeAnchorRect(anchor));
    update();
    const interval = window.setInterval(update, 250);
    window.addEventListener('resize', update);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('resize', update);
    };
  }, [anchor]);

  return rect;
}
