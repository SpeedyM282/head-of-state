import { vectorZone } from '../../core';
import { useUi } from '../../store/langStore';

/** Signature element: the governance vector as an official gauge with the ruler's stamp. */
export function VectorScale({ vector }: { vector: number }) {
  const ui = useUi();
  const zone = vectorZone(vector);
  return (
    <div className="panel p-2 tablet:p-3">
      <div className="mb-1 flex items-center justify-between tablet:mb-2">
        <span className="eyebrow">{ui.vector.heading}</span>
        <span className="stamp text-[0.65rem] tablet:text-xs">{ui.vector.zones[zone]}</span>
      </div>
      <div className="relative h-2 w-full border border-(--paper-line) tablet:h-3"
        style={{ background: 'linear-gradient(90deg, #7d9c6a 0%, #c5a75a 50%, #a8352c 100%)' }}>
        <div
          className="absolute top-[-4px] h-[16px] w-[3px] bg-(--text-ink) tablet:top-[-5px] tablet:h-[22px]"
          style={{ left: `calc(${vector}% - 1px)`, transition: 'left 300ms' }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[0.55rem] uppercase tracking-wider text-(--text-faint) tablet:text-[0.6rem]">
        <span>{ui.vector.scale.democracy}</span>
        <span>{ui.vector.scale.authoritarianism}</span>
        <span>{ui.vector.scale.totalitarianism}</span>
      </div>
    </div>
  );
}
