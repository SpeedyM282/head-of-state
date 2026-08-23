import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';
import { trendColor, trendDirection, trendGlyph } from '../trend';

interface Props {
  statKey: StatKey;
  value: number;
  prev: number | null;
  danger: boolean;
}

function WarningIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M10 3 L18 17 H2 Z" />
      <path d="M10 8v4" />
      <circle cx="10" cy="14.5" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** One register-book row: label ‹dotted leader› value trend-arrow — the ledger replaces the
 * old progress-bar StatRow with a pure numeric register, matching the gazette's "figures in a
 * book" register aesthetic. A row in a dangerous state (danger prop, threshold logic lives in
 * MainScreen/data/statMeta — StatRow only reads the polarity-aware boolean) turns wholesale
 * magenta with a warning glyph, rather than just tinting a bar. */
export function StatRow({ statKey, value, prev, danger }: Props) {
  const ui = useUi();
  const delta = prev === null ? 0 : value - prev;
  const direction = trendDirection(delta);
  const trend = trendGlyph(direction);
  const color = danger ? 'var(--stamp)' : trendColor(statKey, direction);
  return (
    <div className="led py-0.5" style={{ color: danger ? 'var(--stamp)' : undefined }}>
      {danger && <WarningIcon />}
      <span className="shrink-0 text-label font-bold">{ui.stats[statKey]}</span>
      <span
        className="led-dots"
        style={danger ? { borderColor: 'color-mix(in srgb, var(--stamp) 55%, var(--paper-line))' } : undefined}
        aria-hidden
      />
      <span className="num shrink-0 text-num">{Math.round(value)}</span>
      <span className="w-4 shrink-0 text-right text-caption" style={{ color }} aria-label={`${ui.trend} ${trend}`}>
        {trend}
      </span>
    </div>
  );
}
