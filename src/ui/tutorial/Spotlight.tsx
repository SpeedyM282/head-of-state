import type { AnchorRect } from "./useAnchorRect";

const PAD = 6;
const DIM = "rgba(10,8,4,0.72)";

/**
 * Dims the whole screen except a cutout around `rect`, using four solid bands rather than a
 * box-shadow cutout — box-shadow can't be made to block pointer events outside its own box, so
 * a single-div "spotlight" would leave every band outside the hole clickable too. A `null` rect
 * (no anchor, or anchor not yet mounted) dims edge-to-edge with no hole.
 */
export function Spotlight({ rect }: { rect: AnchorRect | null }) {
	if (!rect) {
		return <div className="fixed inset-0 z-40" style={{ background: DIM }} />;
	}

	const top = Math.max(0, rect.top - PAD);
	const left = Math.max(0, rect.left - PAD);
	const width = rect.width + PAD * 2;
	const height = rect.height + PAD * 2;
	const bottom = top + height;
	const right = left + width;

	return (
		<>
			<div
				className="fixed z-40"
				style={{ top: 0, left: 0, right: 0, height: top, background: DIM }}
			/>
			<div
				className="fixed z-40"
				style={{ top: bottom, left: 0, right: 0, bottom: 0, background: DIM }}
			/>
			<div
				className="fixed z-40"
				style={{ top, left: 0, width: left, height, background: DIM }}
			/>
			<div
				className="fixed z-40"
				style={{ top, left: right, right: 0, height, background: DIM }}
			/>
			<div
				className="fixed z-40 rounded-sm"
				style={{ top, left, width, height, boxShadow: "0 0 0 2px var(--gold)" }}
				aria-hidden
			/>
		</>
	);
}
