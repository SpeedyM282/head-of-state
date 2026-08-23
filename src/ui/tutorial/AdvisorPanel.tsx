import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { useViewport } from '../hooks/useViewport';
import type { AnchorRect } from './useAnchorRect';

const MARGIN = 8; // clearance from the viewport edges
const GAP = 10; // clearance from the spotlighted anchor
const MIN_WIDTH = 168; // below this a side reads as unusably narrow — fall back to centered
const PREFERRED_WIDTH = 290;
const BEAK = 9; // px, the rotated-square pointer's on-screen size

type Side = 'left' | 'right' | 'top' | 'bottom' | 'center';

interface Placement {
  style: CSSProperties;
  beak: { side: Side; style: CSSProperties } | null;
}

/**
 * Picks whichever of the anchor's four sides has the most clear room in the viewport, sizes the
 * card to fit THAT side exactly (never a flat width/height that can overflow), and — for
 * left/right sides — aligns flush with whichever vertical edge of the anchor (top or bottom)
 * keeps the card closest to it. That edge-aligned room is deliberately less than the absolute
 * max the viewport could offer (it gives up whatever's on the anchor's OTHER side to stay close),
 * which is fine for most tutorial strings but not quite enough for the longest ones next to the
 * tallest anchor (`stats-panel`, ~62% of the screen's height, measured needing up to 308px
 * against ~285px of edge-aligned room). `measuredHeight` (the real, rendered content height —
 * see AdvisorPanel's useLayoutEffect) lets this case be told apart from the common one instead
 * of guessing: only when the actual content needs more than the close option can give does this
 * fall back to using the viewport's full vertical room, trading a bit of closeness for actually
 * fitting — every other step stays tightly against its anchor.
 */
function computePlacement(rect: AnchorRect | null, vp: { width: number; height: number }, measuredHeight: number | null): Placement {
  const centerWidth = Math.min(PREFERRED_WIDTH, Math.max(MIN_WIDTH, vp.width - MARGIN * 2));
  if (!rect) {
    return {
      style: { top: '50%', left: '50%', width: centerWidth, transform: 'translate(-50%, -50%)' },
      beak: null,
    };
  }

  const spaceLeft = rect.left - MARGIN;
  const spaceRight = vp.width - (rect.left + rect.width) - MARGIN;
  const spaceTop = rect.top - MARGIN;
  const spaceBottom = vp.height - (rect.top + rect.height) - MARGIN;
  const bySpace: { side: Side; space: number }[] = [
    { side: 'right' as const, space: spaceRight },
    { side: 'left' as const, space: spaceLeft },
    { side: 'bottom' as const, space: spaceBottom },
    { side: 'top' as const, space: spaceTop },
  ].sort((a, b) => b.space - a.space);
  const best = bySpace[0];

  // Nothing has room for even the narrowest readable card (a cramped viewport, or an anchor
  // that fills it) — center over the scrim instead of forcing an overflowing side.
  if (best.space < MIN_WIDTH + GAP) {
    return {
      style: { top: '50%', left: '50%', width: centerWidth, transform: 'translate(-50%, -50%)' },
      beak: null,
    };
  }

  if (best.side === 'left' || best.side === 'right') {
    const width = Math.min(PREFERRED_WIDTH, best.space - GAP);
    const left = best.side === 'right' ? rect.left + rect.width + GAP : Math.max(MARGIN, rect.left - width - GAP);
    const anchorMidY = rect.top + rect.height / 2;

    const roomIfTopAligned = vp.height - rect.top - MARGIN;
    const roomIfBottomAligned = rect.top + rect.height - MARGIN;
    const closeRoom = Math.max(roomIfTopAligned, roomIfBottomAligned);
    const fitsClose = measuredHeight == null || measuredHeight <= closeRoom;

    if (fitsClose && roomIfTopAligned >= roomIfBottomAligned) {
      const top = Math.max(MARGIN, rect.top);
      const beakTop = top + 16;
      return {
        style: { top, left, width, maxHeight: roomIfTopAligned },
        beak: {
          side: best.side,
          style: best.side === 'right' ? { top: beakTop, left: left - BEAK / 2 } : { top: beakTop, left: left + width - BEAK / 2 },
        },
      };
    }
    if (fitsClose) {
      const bottom = Math.max(MARGIN, vp.height - (rect.top + rect.height));
      const beakBottom = bottom + 16;
      return {
        style: { bottom, left, width, maxHeight: roomIfBottomAligned },
        beak: {
          side: best.side,
          style: best.side === 'right' ? { bottom: beakBottom, left: left - BEAK / 2 } : { bottom: beakBottom, left: left + width - BEAK / 2 },
        },
      };
    }
    // The measured content genuinely doesn't fit next to either edge — use the viewport's full
    // vertical room instead of clipping into a scroll; still beaked toward the anchor's middle.
    const top = MARGIN;
    const maxHeight = vp.height - MARGIN * 2;
    const beakY = Math.max(top + 14, Math.min(anchorMidY, top + maxHeight - 14));
    return {
      style: { top, left, width, maxHeight },
      beak: {
        side: best.side,
        style: best.side === 'right' ? { top: beakY, left: left - BEAK / 2 } : { top: beakY, left: left + width - BEAK / 2 },
      },
    };
  }

  // top / bottom
  const anchorMidX = rect.left + rect.width / 2;
  const width = Math.min(PREFERRED_WIDTH, Math.max(MIN_WIDTH, vp.width - MARGIN * 2));
  let left = anchorMidX - width / 2;
  left = Math.max(MARGIN, Math.min(left, vp.width - width - MARGIN));
  const beakX = Math.max(left + 14, Math.min(anchorMidX, left + width - 14));
  if (best.side === 'bottom') {
    const top = rect.top + rect.height + GAP;
    return {
      style: { top, left, width, maxHeight: vp.height - top - MARGIN },
      beak: { side: 'bottom', style: { top: top - BEAK / 2, left: beakX } },
    };
  }
  const bottom = vp.height - rect.top + GAP;
  return {
    style: { bottom, left, width, maxHeight: rect.top - GAP - MARGIN },
    beak: { side: 'top', style: { bottom: bottom - BEAK / 2, left: beakX } },
  };
}

/**
 * The advisor's compact coach card — auto-placed on whichever side of the spotlighted element
 * has room (see computePlacement), with a small rotated-square "beak" pointing back at it, or
 * centered on screen when there's no anchor. Recomputed from `useViewport()` on every resize.
 * Also measures its own rendered content height (`useLayoutEffect`, before the browser paints —
 * so the correction is never visible as a jump) so computePlacement can tell a step that
 * genuinely needs more room from the common case, instead of guessing ahead of render.
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
  const cardRef = useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const prevMaxHeight = el.style.maxHeight;
    el.style.maxHeight = 'none'; // unconstrained, so scrollHeight reflects the true content height
    const h = el.scrollHeight;
    el.style.maxHeight = prevMaxHeight;
    setMeasuredHeight(h);
  }, [rect?.top, rect?.left, rect?.width, rect?.height, text, advisorLabel, primaryLabel, skipLabel, vp.width, vp.height]);

  const { style, beak } = computePlacement(rect, vp, measuredHeight);

  return (
    <>
      {beak && (
        <div
          className="pointer-events-none fixed z-40 rotate-45 border-solid border-(--paper-line) bg-(--paper)"
          style={{
            width: BEAK,
            height: BEAK,
            borderWidth: beak.side === 'right' || beak.side === 'bottom' ? '0 0 1px 1px' : '1px 1px 0 0',
            ...beak.style,
          }}
          aria-hidden
        />
      )}
      <div ref={cardRef} className="panel fixed z-40 overflow-y-auto p-sp-3" style={style} role="dialog" aria-live="polite">
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
    </>
  );
}
