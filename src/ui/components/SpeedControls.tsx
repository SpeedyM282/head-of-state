import type { Speed } from '../../store/clock';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

const OPTIONS: { speed: Speed; glyph: string; label: 'pause' | 'normal' | 'fast' }[] = [
  { speed: 'paused', glyph: '❚❚', label: 'pause' },
  { speed: 'normal', glyph: '▶', label: 'normal' },
  { speed: 'fast', glyph: '▶▶', label: 'fast' },
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
        return (
          <button
            key={o.speed}
            type="button"
            onClick={() => setSpeed(o.speed)}
            aria-label={ui.main.speed[o.label]}
            aria-pressed={active}
            className="flex h-7 w-7 shrink-0 items-center justify-center border text-[0.6rem] tracking-tighter"
            style={{
              borderColor: 'var(--paper-line)',
              background: active ? 'var(--gold)' : 'var(--paper)',
              color: active ? 'var(--ink)' : 'var(--text-ink)',
              fontWeight: active ? 700 : 400,
            }}
          >
            <span aria-hidden>{o.glyph}</span>
          </button>
        );
      })}
    </div>
  );
}
