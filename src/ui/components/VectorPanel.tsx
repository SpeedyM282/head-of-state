import { vectorZone } from '../../core';
import { format } from '../../i18n';
import { useUi } from '../../store/langStore';
import { signed } from '../effectFormat';

/** Opacity of the trail markers, most recent month first. */
const TRAIL_OPACITY = [0.4, 0.2, 0.12];

function Pointer({ at, opacity = 1, className = '' }: { at: number; opacity?: number; className?: string }) {
  return (
    <span
      className={`absolute -top-0.5 h-0 w-0 -translate-x-1/2 border-x-[5px] border-t-[7px] border-x-transparent border-t-(--accent) ${className}`}
      style={{ left: `${Math.max(0, Math.min(100, at))}%`, opacity }}
      aria-hidden
    />
  );
}

/**
 * «Кабинет» governance vector panel (handoff screen 05, bottom of Реформы): the zone name, a
 * three-band tape (democracy / authoritarianism / totalitarianism, boundaries at the thirds —
 * matching core's vectorZone) with tick marks, a pointer at the current value and fading trail
 * markers at the previous months, the trend over those months, and «Если принять» — how the
 * selected reform would shift the vector. The vector is 0 (democracy) … 100 (totalitarianism),
 * mapped straight onto 0–100% of the tape.
 */
export function VectorPanel({ vector, trail, previewShift }: { vector: number; trail: number[]; previewShift: number | null }) {
  const ui = useUi();
  const zone = vectorZone(vector);

  const months = trail.length;
  const delta = months > 0 ? Math.round(vector - trail[0]) : 0;
  const trend =
    months === 0 ? null : format(delta > 0 ? ui.vector.trend.right : delta < 0 ? ui.vector.trend.left : ui.vector.trend.still, { n: months, d: Math.abs(delta) });

  const p = ui.vector.preview;
  const shift = previewShift !== null && previewShift !== 0 ? previewShift : null;

  return (
    <section data-tutorial="vector-panel" className="card flex min-h-[62px] shrink-0 items-center gap-sp-3 px-sp-3 py-sp-2">
      <div className="flex min-w-0 flex-[1.7] flex-col gap-1">
        <div className="flex items-baseline gap-sp-2">
          <p className="eyebrow whitespace-nowrap">{ui.vector.heading}</p>
          <span className="truncate font-serif text-label leading-none">{ui.vector.zones[zone]}</span>
        </div>
        <div className="relative mt-1 h-3.5">
          <div className="absolute inset-x-0 top-1 flex h-2.5 overflow-hidden rounded-[3px]">
            <span className="flex-1 bg-(--zone-dem)" />
            <span className="flex-1 bg-(--zone-auth)" />
            <span className="flex-1 bg-(--zone-tot)" />
          </div>
          <div
            className="absolute inset-x-0 top-1 h-2.5 opacity-45"
            style={{ background: 'repeating-linear-gradient(90deg, var(--muted) 0 1px, transparent 1px 11px)' }}
            aria-hidden
          />
          {[...trail].reverse().map((v, i) => (
            <Pointer key={i} at={v} opacity={TRAIL_OPACITY[i] ?? 0.1} />
          ))}
          <Pointer at={vector} className="vector-pointer" />
        </div>
        <div className="flex items-baseline justify-between gap-sp-2 text-micro text-(--muted)">
          <span>{ui.vector.scale.democracy}</span>
          {trend && <span className="flavor truncate text-micro-lg">{trend}</span>}
          <span>{ui.vector.scale.totalitarianism}</span>
        </div>
      </div>

      <span className="h-9 w-px shrink-0 bg-(--line)" aria-hidden />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <p className="eyebrow">{p.kicker}</p>
        <p className="truncate text-caption font-medium text-(--accent)">
          {shift !== null ? `${format(p.shift, { d: signed(shift) })} · ${shift < 0 ? p.toDemocracy : p.toTotalitarianism}` : p.none}
        </p>
        <p className="flavor truncate text-caption">{shift !== null ? p.flavor : p.flavorNone}</p>
      </div>
    </section>
  );
}
