import { useUi } from "../../store/langStore";

/** Signature element: the governance vector as an official gauge with the ruler's stamp. */
export function VectorScale({ vector }: { vector: number }) {
	const ui = useUi();
	return (
		<div className="panel p-sp-2">
			<div className="mb-sp-1 flex items-center justify-between">
				<span className="eyebrow">{ui.vector.heading}</span>
			</div>
			<div
				className="relative h-2 w-full border border-(--paper-line) tablet:h-3"
				style={{
					background:
						"linear-gradient(90deg, #7d9c6a 0%, #c5a75a 50%, #a8352c 100%)",
				}}
			>
				<div
					className="absolute -top-1 h-4 w-[3px] bg-(--text-ink) tablet:top-[-5px] tablet:h-[22px]"
					style={{ left: `calc(${vector}% - 1px)`, transition: "left 300ms" }}
				/>
			</div>
			{/* text-micro stays a step below text-caption (not one of the six fluid roles) —
			    three zone words (English "AUTHORITARIANISM"/"TOTALITARIANISM" are the long ones)
			    must fit side by side across this panel's width at 640px; text-caption is just
			    large enough to make them collide and clip at that width. */}
			<div className="mt-sp-1 flex justify-between text-micro uppercase tracking-wider text-(--text-faint) tablet:text-micro-lg">
				<span>{ui.vector.scale.democracy}</span>
				<span>{ui.vector.scale.authoritarianism}</span>
				<span>{ui.vector.scale.totalitarianism}</span>
			</div>
		</div>
	);
}
