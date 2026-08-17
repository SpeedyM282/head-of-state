import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';
import { trendColor, trendDirection, trendGlyph } from '../trend';

interface Props {
  statKey: StatKey;
  value: number;
  prev: number | null;
  danger: boolean;
}

export function StatRow({ statKey, value, prev, danger }: Props) {
  const ui = useUi();
  const delta = prev === null ? 0 : value - prev;
  const direction = trendDirection(delta);
  const trend = trendGlyph(direction);
  const color = trendColor(statKey, direction);
  return (
    // py stays a fixed sub-token value (not p-sp-*) — the 7-row stack must fit 640×360 with no
    // scroll, and even the smallest spacing token grows a couple px by desktop that this
    // height-critical row can't spare.
    <div className="flex items-center gap-sp-1 py-0.5 tablet:py-1">
      <span className="w-24 shrink-0 truncate text-label tablet:w-40">{ui.stats[statKey]}</span>
      <div className="h-1.5 flex-1 border border-(--paper-line) bg-(--paper-dim) tablet:h-2">
        <div
          className="h-full"
          style={{
            width: `${value}%`,
            background: danger ? 'var(--stamp)' : 'var(--gold)',
            transition: 'width 300ms',
          }}
        />
      </div>
      <span className="num w-7 text-right text-num tablet:w-8">{Math.round(value)}</span>
      <span className="w-3 text-caption" style={{ color }} aria-label={`${ui.trend} ${trend}`}>
        {trend}
      </span>
    </div>
  );
}
