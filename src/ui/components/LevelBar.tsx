interface Props {
  label: string;
  value: number;
  /** Corruption reads high-is-bad — colors the fill with --stamp instead of --gold. */
  inverted?: boolean;
}

/** Pre-game dossier bar (country levels, not live Stats) — deliberately not StatRow:
 * no trend glyph, no danger threshold, since there's no running game state yet. */
export function LevelBar({ label, value, inverted }: Props) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-32 shrink-0 truncate text-sm">{label}</span>
      <div className="h-2 flex-1 border border-(--paper-line) bg-(--paper-dim)">
        <div
          className="h-full"
          style={{ width: `${value}%`, background: inverted ? 'var(--stamp)' : 'var(--gold)' }}
        />
      </div>
      <span className="num w-8 text-right text-sm">{Math.round(value)}</span>
    </div>
  );
}
