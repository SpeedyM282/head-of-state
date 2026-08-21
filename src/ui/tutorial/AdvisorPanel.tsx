import type { CSSProperties } from 'react';
import { useViewport } from '../hooks/useViewport';
import type { AnchorRect } from './useAnchorRect';

const MARGIN = 12;
const GAP = 10;
const BELOW_THRESHOLD = 110;

/**
 * The advisor's compact panel — positioned near the spotlighted element without covering it
 * (below by default, above when there isn't room below; or to a side for anchors where
 * `side="left"`/`side="right"` is requested, e.g. the stats panel and the right-column anchors
 * next to it, which are tall enough that a below/above placement would land far from the
 * anchor), or centered on screen when there's no anchor. The requested side is a preference,
 * not a guarantee — it flips to the other side when there isn't room. Placement is recomputed
 * from `useViewport()` on every resize, same primitive OrientationGate/WorldMap already use for
 * the one JS-driven layout decision in the app.
 */
export function AdvisorPanel({
  rect,
  side = 'below',
  advisorLabel,
  text,
  primaryLabel,
  onPrimary,
  skipLabel,
  onSkip,
}: {
  rect: AnchorRect | null;
  side?: 'below' | 'left' | 'right';
  advisorLabel: string;
  text: string;
  primaryLabel?: string;
  onPrimary?: () => void;
  skipLabel?: string;
  onSkip?: () => void;
}) {
  const vp = useViewport();
  const maxWidth = Math.min(320, Math.max(200, vp.width - MARGIN * 2));

  let style: CSSProperties;
  if (!rect) {
    style = { top: '50%', left: '50%', width: maxWidth, transform: 'translate(-50%, -50%)' };
  } else if (side === 'left' || side === 'right') {
    const spaceRight = vp.width - (rect.left + rect.width);
    const spaceLeft = rect.left;
    const placeRight =
      side === 'right' ? spaceRight >= maxWidth + GAP || spaceRight >= spaceLeft : spaceRight >= maxWidth + GAP && spaceRight > spaceLeft;
    const top = Math.max(MARGIN, Math.min(rect.top, vp.height - MARGIN));
    style = placeRight
      ? { top, left: rect.left + rect.width + GAP, width: maxWidth }
      : { top, left: Math.max(MARGIN, rect.left - maxWidth - GAP), width: maxWidth };
  } else {
    const spaceBelow = vp.height - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const placeBelow = spaceBelow >= BELOW_THRESHOLD || spaceBelow >= spaceAbove;
    let left = rect.left + rect.width / 2 - maxWidth / 2;
    left = Math.max(MARGIN, Math.min(left, vp.width - maxWidth - MARGIN));
    style = placeBelow
      ? { top: rect.top + rect.height + GAP, left, width: maxWidth }
      : { bottom: vp.height - rect.top + GAP, left, width: maxWidth };
  }

  return (
    <div
      className="panel fixed z-40 max-h-[70dvh] overflow-y-auto p-sp-3"
      style={style}
      role="dialog"
      aria-live="polite"
    >
      <p className="eyebrow">{advisorLabel}</p>
      <p className="mt-sp-1 text-body leading-relaxed">{text}</p>
      {(primaryLabel || skipLabel) && (
        <div className="mt-sp-3 flex items-center justify-between gap-sp-2">
          {skipLabel ? (
            <button type="button" className="text-caption text-(--text-faint) underline" onClick={onSkip}>
              {skipLabel}
            </button>
          ) : (
            <span />
          )}
          {primaryLabel && (
            <button type="button" className="btn btn-primary min-h-9 px-sp-4 text-label" onClick={onPrimary}>
              {primaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
