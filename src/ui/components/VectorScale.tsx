import { vectorZone } from '../../core';
import { useUi } from '../../store/langStore';

/** The governance vector as a plain gradient gauge — cyan (democratic) through neutral
 * (authoritarian) to magenta (totalitarian), with an ink tick at the current position and the
 * player's current title as a caption above. Sits inline in MainScreen's right rail (no panel
 * chrome of its own — the rail already frames it), unlike the old boxed/stamped treatment. */
export function VectorScale({ vector }: { vector: number }) {
  const ui = useUi();
  const zone = vectorZone(vector);
  return (
    <div className="w-full">
      <p className="text-center text-micro uppercase tracking-wider text-(--text-faint)">{ui.vector.zones[zone]}</p>
      <div
        className="relative mt-sp-1 h-1.5 w-full border border-(--ink)"
        style={{
          background:
            'linear-gradient(90deg, color-mix(in srgb, var(--gold) 55%, var(--paper)) 0%, var(--paper-line) 50%, color-mix(in srgb, var(--stamp) 70%, var(--paper)) 100%)',
        }}
      >
        <div
          className="absolute -top-1 h-3.5 w-[2px] bg-(--ink)"
          style={{ left: `calc(${vector}% - 1px)`, transition: 'left 300ms' }}
        />
      </div>
    </div>
  );
}
