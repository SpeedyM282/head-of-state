import type { CSSProperties } from 'react';
import { useViewport } from '../hooks/useViewport';
import type { AnchorRect } from './useAnchorRect';

const MARGIN = 12;
const GAP = 10;
const BELOW_THRESHOLD = 110;

/**
 * The advisor's compact panel — positioned near the spotlighted element without covering it
 * (below by default, above when there isn't room below), or centered on screen when there's no
 * anchor. Placement is recomputed from `useViewport()` on every resize, same primitive
 * OrientationGate/WorldMap already use for the one JS-driven layout decision in the app.
 */
export function AdvisorPanel({
  rect,
  advisorLabel,
  text,
  primaryLabel,
  onPrimary,
  skipLabel,
  onSkip,
}: {
  rect: AnchorRect | null;
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
