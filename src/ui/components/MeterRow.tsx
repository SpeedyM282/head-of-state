import { useEffect, useRef, useState } from 'react';

interface Props {
  label: string;
  /** Displayed value (already rounded/formatted by the caller). */
  value: number;
  /** Warning tone (corruption, or a stat in danger): label, value and fill in --warning. */
  warning?: boolean;
  /** 'card' = country card (Spectral 16 value); 'compact' = glass stats panel (Spectral 13). */
  size?: 'card' | 'compact';
  /** Pop a «+2» / «−8» label next to the value whenever the displayed value changes. */
  popOnChange?: boolean;
  /** Inverted stat (corruption: higher is worse) — a rise pops in warning, a fall in accent. */
  inverted?: boolean;
}

/**
 * «Кабинет» stat row: label and value on one line, a 2pt bar underneath (track = line, fill =
 * accent at value%). Used by the country card (02) and the main screen's stats panel (03).
 */
export function MeterRow({ label, value, warning = false, size = 'card', popOnChange = false, inverted = false }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  const pop = useChangePop(value, popOnChange);
  return (
    <div className="relative flex flex-col gap-1">
      <div className="flex items-baseline justify-between gap-sp-2">
        <span className={`truncate text-caption leading-none ${warning ? 'text-(--warning)' : 'text-(--muted)'}`}>{label}</span>
        <span className={`num shrink-0 leading-none ${size === 'card' ? 'text-label' : 'text-num'} ${warning ? 'text-(--warning)' : ''}`}>{value}</span>
      </div>
      <div className="h-0.5 overflow-hidden rounded-xs bg-(--line)">
        <div className="meter-fill h-full" style={{ width: `${pct}%`, background: warning ? 'var(--warning)' : 'var(--accent)' }} />
      </div>
      {pop && (
        <span
          key={pop.key}
          className="stat-pop num text-num"
          style={{ color: pop.delta > 0 !== inverted ? 'var(--accent)' : 'var(--warning)' }}
          aria-hidden
        >
          {pop.delta > 0 ? `+${pop.delta}` : `−${Math.abs(pop.delta)}`}
        </span>
      )}
    </div>
  );
}

/** Tracks the last displayed value; when it changes, returns the delta with a fresh key so the
 * pop animation restarts. Presentation only — the value itself comes from the store. */
function useChangePop(value: number, enabled: boolean): { delta: number; key: number } | null {
  const last = useRef(value);
  const [pop, setPop] = useState<{ delta: number; key: number } | null>(null);
  useEffect(() => {
    const delta = value - last.current;
    last.current = value;
    if (!enabled || delta === 0) return;
    setPop((p) => ({ delta, key: (p?.key ?? 0) + 1 }));
  }, [value, enabled]);
  return pop;
}
