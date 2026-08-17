import type { Effect, EffectTarget } from '../core/types';
import type { Ui } from '../i18n';
import { isInverted } from '../data/statMeta';

/** Localized name for an effect target (stat, vector or influence). */
export function targetLabel(target: EffectTarget, ui: Ui): string {
  if (target === 'vector') return ui.vector.heading;
  if (target === 'influence') return ui.main.influence;
  return ui.stats[target];
}

/** "+4" / "−10" — the sign as typed, not the stat's good/bad polarity. */
export function signed(delta: number): string {
  return `${delta > 0 ? '+' : '−'}${Math.abs(delta)}`;
}

/**
 * Color for one effect: green = good for the player, red = bad, gold = neutral (the
 * governance vector has no inherent good/bad direction). Inverted stats (corruption) flip
 * a positive delta to read as bad.
 */
export function effectColor(e: Effect): string {
  if (e.target === 'vector') return 'var(--gold)';
  const inverted = e.target !== 'influence' && isInverted(e.target);
  const bad = inverted ? e.delta > 0 : e.delta < 0;
  return bad ? 'var(--stamp)' : 'var(--ok)';
}

/** Vertical effect list — used by the reforms detail pane. */
export function EffectLines({ effects, ui }: { effects: Effect[]; ui: Ui }) {
  return (
    <ul className="mt-sp-1">
      {effects.map((e, i) => (
        <li key={i} className="flex items-center justify-between gap-sp-3 py-0.5 text-caption">
          <span className="text-(--text-faint)">{targetLabel(e.target, ui)}</span>
          <span className="num" style={{ color: effectColor(e) }}>{signed(e.delta)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Compact single-line effect summary — used on event option cards, e.g.
 * «Одобрение +4 · Казна −10 · Вектор +5». Root is a <span> (not <p>) so it stays valid
 * nested inside a <button>.
 */
export function EffectSummaryLine({ effects, ui }: { effects: Effect[]; ui: Ui }) {
  if (effects.length === 0) return null;
  return (
    <span className="mt-sp-1 block text-caption leading-relaxed text-(--text-faint)">
      {effects.map((e, i) => (
        <span key={i}>
          {i > 0 && ' · '}
          {targetLabel(e.target, ui)}{' '}
          <span className="num" style={{ color: effectColor(e) }}>{signed(e.delta)}</span>
        </span>
      ))}
    </span>
  );
}
