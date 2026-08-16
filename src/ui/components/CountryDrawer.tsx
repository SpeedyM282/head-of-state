import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { Difficulty } from '../../core/types';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { countries } from '../../data';
import { LevelBar } from './LevelBar';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];
/** Swipe-right distance (px) past which releasing the drawer dismisses it. */
const DISMISS_THRESHOLD = 80;

interface Props {
  countryId: string;
  onClose: () => void;
}

export function CountryDrawer({ countryId, onClose }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const startGame = useGameStore((s) => s.startGame);
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [open, setOpen] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartX = useRef<number | null>(null);

  // Mount off-canvas, then slide in on the next frame (Tailwind transition-transform handles the animation).
  useEffect(() => {
    const id = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const country = countries.find((c) => c.id === countryId);
  if (!country) return null;

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    // Don't start a drag from taps on buttons — capturing the pointer here would
    // retarget their click away from the button and silently swallow it.
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (dragStartX.current === null) return;
    setDragX(Math.max(0, e.clientX - dragStartX.current));
  }
  function onPointerUp() {
    if (dragX > DISMISS_THRESHOLD) {
      onClose();
      return;
    }
    setDragX(0);
    setDragging(false);
    dragStartX.current = null;
  }

  return (
    // No dimming backdrop and no click-outside-to-close: the drawer can be open at the same
    // time as the country list (see MapScreen) or the map itself, and both need to stay
    // clickable underneath it — only the drawer's own panel captures pointer events.
    <div className="pointer-events-none fixed inset-0 z-20 flex justify-end" role="dialog" aria-modal="true">
      <div
        className={`panel pointer-events-auto flex h-full w-[45%] min-w-[260px] flex-col overflow-hidden pr-[env(safe-area-inset-right,0px)] transition-transform duration-200 tablet:w-[400px] ${open ? 'translate-x-0' : 'translate-x-full'}`}
        style={dragging ? { transform: `translateX(${dragX}px)`, transition: 'none' } : undefined}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-(--paper-line) p-4">
          <span className="text-2xl">{country.flagEmoji}</span>
          <h2 className="flex-1 text-lg font-bold leading-tight">{loc(country.name, lang)}</h2>
          <button
            type="button"
            aria-label={ui.map.close}
            className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center text-(--text-faint) desktop:h-8 desktop:w-8"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-sm leading-relaxed text-(--text-faint)">{loc(country.description, lang)}</p>

          <div className="mt-4 flex items-center justify-between py-1 text-sm">
            <span>{ui.map.dossier.population}</span>
            <span className="num">{country.population.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-b border-(--paper-line) py-1 pb-3 text-sm">
            <span>{ui.map.dossier.area}</span>
            <span className="num">{country.areaKm2.toLocaleString()} km²</span>
          </div>

          <div className="mt-3">
            <LevelBar label={ui.map.dossier.economy} value={country.economyLevel} />
            <LevelBar label={ui.map.dossier.corruption} value={country.corruptionLevel} inverted />
            <LevelBar label={ui.map.dossier.democracy} value={country.democracyLevel} />
            <LevelBar label={ui.map.dossier.development} value={country.developmentLevel} />
          </div>
        </div>

        <footer className="shrink-0 border-t border-(--paper-line) p-4">
          <div className="flex gap-1">
            {DIFFICULTY_ORDER.map((d) => (
              <button
                key={d}
                type="button"
                aria-pressed={d === difficulty}
                onClick={() => setDifficulty(d)}
                className="min-h-11 flex-1 border border-(--paper-line) px-2 py-1.5 text-xs"
                style={{
                  background: d === difficulty ? 'var(--gold)' : 'transparent',
                  fontWeight: d === difficulty ? 700 : 400,
                }}
              >
                {ui.menu.difficulties[d].name}
              </button>
            ))}
          </div>
          <button type="button" className="btn btn-primary mt-2 min-h-11 w-full" onClick={() => startGame(country.id, difficulty)}>
            {ui.map.choose}
          </button>
        </footer>
      </div>
    </div>
  );
}
