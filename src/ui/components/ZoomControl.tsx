import { useLang, useUi } from '../../store/langStore';

/**
 * Desktop map zoom control (desktop handoff → Shared components): a glass column «+» / current
 * level («×2,6», one decimal) / «−», with the «Колесо мыши — масштаб карты» hint to its left.
 * Desktop only — phones pinch.
 */
export function ZoomControl({ level, onZoomIn, onZoomOut, className = '' }: { level: number; onZoomIn: () => void; onZoomOut: () => void; className?: string }) {
  const ui = useUi();
  const lang = useLang((s) => s.lang);
  return (
    <div className={`pointer-events-auto hidden items-center gap-dp-16 desktop:flex ${className}`}>
      <span className="text-right text-dp-15 leading-[1.35] whitespace-pre-line text-(--muted)">{ui.map.zoomHint}</span>
      <div className="glass flex flex-col items-center rounded-dp-18 py-dp-4">
        <button type="button" className="press flex h-dp-52 w-dp-60 items-center justify-center text-dp-28" onClick={onZoomIn} aria-label={ui.map.zoomIn}>
          +
        </button>
        <span className="num text-dp-15 text-(--muted)" aria-live="polite">
          ×{level.toLocaleString(lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
        <button type="button" className="press flex h-dp-52 w-dp-60 items-center justify-center text-dp-28" onClick={onZoomOut} aria-label={ui.map.zoomOut}>
          −
        </button>
      </div>
    </div>
  );
}
