import { vectorZone } from '../../core';
import { useUi } from '../../store/langStore';

/** Signature element: the governance vector as an official gauge with the ruler's stamp. */
export function VectorScale({ vector }: { vector: number }) {
  const ui = useUi();
  const zone = vectorZone(vector);
  return (
    <div className="panel p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="eyebrow">{ui.vector.heading}</span>
        <span className="stamp text-xs">{ui.vector.zones[zone]}</span>
      </div>
      <div className="relative h-3 w-full border border-[var(--paper-line)]"
        style={{ background: 'linear-gradient(90deg, #7d9c6a 0%, #c5a75a 50%, #a8352c 100%)' }}>
        <div
          className="absolute top-[-5px] h-[22px] w-[3px] bg-[var(--text-ink)]"
          style={{ left: `calc(${vector}% - 1px)`, transition: 'left 300ms' }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[0.6rem] uppercase tracking-wider text-[var(--text-faint)]">
        <span>{ui.vector.scale.democracy}</span>
        <span>{ui.vector.scale.authoritarianism}</span>
        <span>{ui.vector.scale.totalitarianism}</span>
      </div>
    </div>
  );
}
