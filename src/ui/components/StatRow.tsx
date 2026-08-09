import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';

interface Props {
  statKey: StatKey;
  value: number;
  prev: number | null;
  danger: boolean;
}

export function StatRow({ statKey, value, prev, danger }: Props) {
  const ui = useUi();
  const delta = prev === null ? 0 : value - prev;
  const trend = delta > 0.5 ? '▲' : delta < -0.5 ? '▼' : '—';
  const trendColor = delta > 0.5 ? 'var(--ok)' : delta < -0.5 ? 'var(--stamp)' : 'var(--text-faint)';
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-40 shrink-0 truncate text-sm">{ui.stats[statKey]}</span>
      <div className="h-2 flex-1 border border-[var(--paper-line)] bg-[var(--paper-dim)]">
        <div
          className="h-full"
          style={{
            width: `${value}%`,
            background: danger ? 'var(--stamp)' : 'var(--gold)',
            transition: 'width 300ms',
          }}
        />
      </div>
      <span className="num w-8 text-right text-sm">{Math.round(value)}</span>
      <span className="w-3 text-xs" style={{ color: trendColor }} aria-label={`${ui.trend} ${trend}`}>
        {trend}
      </span>
    </div>
  );
}
