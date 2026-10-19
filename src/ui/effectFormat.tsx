import type { Effect, EffectTarget, Lang } from '../core/types';
import type { Ui } from '../i18n';
import { isInverted } from '../data/statMeta';

/** Localized name for an effect target (stat, vector or influence). */
export function targetLabel(target: EffectTarget, ui: Ui): string {
  if (target === 'vector') return ui.vector.heading;
  if (target === 'influence') return ui.main.influence;
  return ui.stats[target];
}

/** "+4" / "−10" — the sign as typed, not the stat's good/bad polarity. With `lang`, the
 * number uses that locale's decimal separator («+0,4» in ru/uz). */
export function signed(delta: number, lang?: Lang): string {
  const abs = Math.abs(delta);
  return `${delta > 0 ? '+' : '−'}${lang ? abs.toLocaleString(lang) : abs}`;
}

/**
 * Color for one effect: green = good for the player, red = bad, gold = neutral (the
 * governance vector has no inherent good/bad direction). Inverted stats (corruption) flip
 * a positive delta to read as bad.
 */
export function effectColor(e: Effect): string {
  if (e.target === 'vector') return 'var(--muted)';
  const inverted = e.target !== 'influence' && isInverted(e.target);
  const bad = inverted ? e.delta > 0 : e.delta < 0;
  return bad ? 'var(--stamp)' : 'var(--ok)';
}

/**
 * «Кабинет» inline effect summary — «казна −8 · экономика +2»: lowercase muted labels, deltas
 * colored by good/bad. Used on event option rows and the reforms detail rows.
 */
export function EffectInline({ effects, ui, lang }: { effects: Effect[]; ui: Ui; lang?: Lang }) {
  return (
    <>
      {effects.map((e, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          <span className="lowercase">{targetLabel(e.target, ui)}</span>{' '}
          <span style={{ color: effectColor(e) }}>{signed(e.delta, lang)}</span>
        </span>
      ))}
    </>
  );
}
