import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react';
import { desktopScale, useViewport } from '../hooks/useViewport';
import type { AnchorRect } from './useAnchorRect';

/** Card geometry in px. Phone/tablet: the mobile handoff's values. Desktop: the desktop
 * handoff's (580-wide card, 26px beak…) times the design-pixel scale. */
interface Sizes {
  /** Clearance from the viewport edges. */
  margin: number;
  /** Clearance from the spotlighted anchor. */
  gap: number;
  /** Below this a side reads as unusably narrow — fall back to centered. */
  minWidth: number;
  /** The coach card width. */
  preferredWidth: number;
  /** The rotated-square pointer's on-screen size. */
  beak: number;
  /** How far down the card's edge the beak sits / how close to a corner it may go. */
  beakInset: number;
}

function sizesFor(dp: number | null): Sizes {
  if (!dp) return { margin: 8, gap: 10, minWidth: 168, preferredWidth: 270, beak: 9, beakInset: 16 };
  return { margin: 24 * dp, gap: 26 * dp, minWidth: 380 * dp, preferredWidth: 580 * dp, beak: 26 * dp, beakInset: 64 * dp };
}

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
function computePlacement(rect: AnchorRect | null, vp: { width: number; height: number }, measuredHeight: number | null, S: Sizes): Placement {
  const centerWidth = Math.min(S.preferredWidth, Math.max(S.minWidth, vp.width - S.margin * 2));
  if (!rect) {
    return {
      style: { top: '50%', left: '50%', width: centerWidth, transform: 'translate(-50%, -50%)' },
      beak: null,
    };
  }

  const spaceLeft = rect.left - S.margin;
  const spaceRight = vp.width - (rect.left + rect.width) - S.margin;
  const spaceTop = rect.top - S.margin;
  const spaceBottom = vp.height - (rect.top + rect.height) - S.margin;
  const bySpace: { side: Side; space: number }[] = [
    { side: 'right' as const, space: spaceRight },
    { side: 'left' as const, space: spaceLeft },
    { side: 'bottom' as const, space: spaceBottom },
    { side: 'top' as const, space: spaceTop },
  ].sort((a, b) => b.space - a.space);
  const best = bySpace[0];

  // Nothing has room for even the narrowest readable card (a cramped viewport, or an anchor
  // that fills it) — center over the scrim instead of forcing an overflowing side.
  if (best.space < S.minWidth + S.gap) {
    return {
      style: { top: '50%', left: '50%', width: centerWidth, transform: 'translate(-50%, -50%)' },
      beak: null,
    };
  }

  if (best.side === 'left' || best.side === 'right') {
    const width = Math.min(S.preferredWidth, best.space - S.gap);
    const left = best.side === 'right' ? rect.left + rect.width + S.gap : Math.max(S.margin, rect.left - width - S.gap);
    const anchorMidY = rect.top + rect.height / 2;

    const roomIfTopAligned = vp.height - rect.top - S.margin;
    const roomIfBottomAligned = rect.top + rect.height - S.margin;
    const closeRoom = Math.max(roomIfTopAligned, roomIfBottomAligned);
    const fitsClose = measuredHeight == null || measuredHeight <= closeRoom;

    if (fitsClose && roomIfTopAligned >= roomIfBottomAligned) {
      const top = Math.max(S.margin, rect.top);
      const beakTop = top + S.beakInset;
      return {
        style: { top, left, width, maxHeight: roomIfTopAligned },
        beak: {
          side: best.side,
          style: best.side === 'right' ? { top: beakTop, left: left - S.beak / 2 } : { top: beakTop, left: left + width - S.beak / 2 },
        },
      };
    }
    if (fitsClose) {
      const bottom = Math.max(S.margin, vp.height - (rect.top + rect.height));
      const beakBottom = bottom + S.beakInset;
      return {
        style: { bottom, left, width, maxHeight: roomIfBottomAligned },
        beak: {
          side: best.side,
          style: best.side === 'right' ? { bottom: beakBottom, left: left - S.beak / 2 } : { bottom: beakBottom, left: left + width - S.beak / 2 },
        },
      };
    }
    // The measured content genuinely doesn't fit next to either edge — use the viewport's full
    // vertical room instead of clipping into a scroll; still beaked toward the anchor's middle.
    const top = S.margin;
    const maxHeight = vp.height - S.margin * 2;
    const beakY = Math.max(top + S.beakInset, Math.min(anchorMidY, top + maxHeight - S.beakInset));
    return {
      style: { top, left, width, maxHeight },
      beak: {
        side: best.side,
        style: best.side === 'right' ? { top: beakY, left: left - S.beak / 2 } : { top: beakY, left: left + width - S.beak / 2 },
      },
    };
  }

  // top / bottom
  const anchorMidX = rect.left + rect.width / 2;
  const width = Math.min(S.preferredWidth, Math.max(S.minWidth, vp.width - S.margin * 2));
  let left = anchorMidX - width / 2;
  left = Math.max(S.margin, Math.min(left, vp.width - width - S.margin));
  const beakX = Math.max(left + S.beakInset, Math.min(anchorMidX, left + width - S.beakInset));
  if (best.side === 'bottom') {
    const top = rect.top + rect.height + S.gap;
    return {
      style: { top, left, width, maxHeight: vp.height - top - S.margin },
      beak: { side: 'bottom', style: { top: top - S.beak / 2, left: beakX } },
    };
  }
  const bottom = vp.height - rect.top + S.gap;
  return {
    style: { bottom, left, width, maxHeight: rect.top - S.gap - S.margin },
    beak: { side: 'top', style: { bottom: bottom - S.beak / 2, left: beakX } },
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
  kicker,
  title,
  text,
  steps,
  primaryLabel,
  onPrimary,
  skipLabel,
  onSkip,
}: {
  rect: AnchorRect | null;
  /** «Обучение · шаг 1 из 4» for scripted steps, «Советник» for one-time tips. */
  kicker: string;
  /** Spectral heading — scripted steps only. */
  title?: string;
  text: string;
  /** Step dots (scripted steps only). */
  steps?: { count: number; current: number };
  primaryLabel: string;
  onPrimary: () => void;
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
  }, [rect?.top, rect?.left, rect?.width, rect?.height, kicker, title, text, primaryLabel, skipLabel, vp.width, vp.height]);

  const S = sizesFor(desktopScale(vp));
  const { style, beak } = computePlacement(rect, vp, measuredHeight, S);

  return (
    <>
      <div ref={cardRef} className="dialog fixed z-40 flex flex-col gap-sp-1 overflow-y-auto rounded-card px-sp-4 py-sp-3 desktop:gap-dp-18 desktop:rounded-dp-30 desktop:px-dp-44 desktop:py-dp-40" style={style} role="dialog" aria-live="polite">
        <p className="eyebrow">{kicker}</p>
        {title && <p className="font-serif text-heading leading-[1.1] desktop:text-dp-44">{title}</p>}
        <p className="text-caption leading-relaxed text-(--muted) desktop:text-dp-21 desktop:leading-normal desktop:text-(--text)">{text}</p>
        <div className="mt-sp-1 flex items-center gap-sp-2 desktop:mt-0 desktop:gap-dp-24">
          {steps && (
            <span className="flex gap-1.5 desktop:gap-dp-10" aria-hidden>
              {Array.from({ length: steps.count }, (_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full desktop:size-dp-12 ${i === steps.current ? 'bg-(--accent)' : 'bg-(--line)'}`} />
              ))}
            </span>
          )}
          {skipLabel && (
            <button type="button" className="press ml-auto min-h-9 text-caption font-medium text-(--muted) desktop:text-dp-18" onClick={onSkip}>
              {skipLabel}
            </button>
          )}
          <button type="button" className={`btn btn-primary min-h-9 px-sp-3 text-label ${skipLabel ? '' : 'ml-auto'}`} onClick={onPrimary}>
            {primaryLabel}
          </button>
        </div>
      </div>
      {/* Beak drawn after the card so it sits over the card's edge (same surface fill). */}
      {beak && (
        <div className="pointer-events-none fixed z-40 rotate-45 bg-(--surface)" style={{ width: S.beak + 2, height: S.beak + 2, ...beak.style }} aria-hidden />
      )}
    </>
  );
}
