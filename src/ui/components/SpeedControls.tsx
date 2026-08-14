import type { Speed } from '../../store/clock';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

// Plain SVG glyphs, not Unicode symbol characters (▶/❚❚): iOS Safari renders those via its
// emoji/dingbat fallback font, coming out oversized and mis-baselined next to the other buttons.
function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <rect x="3" y="2" width="5" height="16" />
      <rect x="12" y="2" width="5" height="16" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path d="M4 2 L18 10 L4 18 Z" />
    </svg>
  );
}

function FastForwardIcon() {
  return (
    <svg width="15" height="13" viewBox="0 0 24 20" fill="currentColor" aria-hidden>
      <path d="M1 2 L12 10 L1 18 Z" />
      <path d="M11 2 L22 10 L11 18 Z" />
    </svg>
  );
}

const OPTIONS: { speed: Speed; Icon: typeof PauseIcon; label: 'pause' | 'normal' | 'fast' }[] = [
  { speed: 'paused', Icon: PauseIcon, label: 'pause' },
  { speed: 'normal', Icon: PlayIcon, label: 'normal' },
  { speed: 'fast', Icon: FastForwardIcon, label: 'fast' },
];

/** Real-time clock controls: pause / play / fast-forward. Active speed is highlighted. */
export function SpeedControls() {
  const speed = useGameStore((s) => s.speed);
  const setSpeed = useGameStore((s) => s.setSpeed);
  const ui = useUi();
  return (
    <div className="flex items-center gap-1" role="group" aria-label={ui.main.speed.normal}>
      {OPTIONS.map((o) => {
        const active = speed === o.speed;
        const Icon = o.Icon;
        return (
          <button
            key={o.speed}
            type="button"
            onClick={() => setSpeed(o.speed)}
            aria-label={ui.main.speed[o.label]}
            aria-pressed={active}
            className="flex h-7 w-7 shrink-0 items-center justify-center border"
            style={{
              borderColor: 'var(--paper-line)',
              background: active ? 'var(--gold)' : 'var(--paper)',
              color: active ? 'var(--ink)' : 'var(--text-ink)',
            }}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}
