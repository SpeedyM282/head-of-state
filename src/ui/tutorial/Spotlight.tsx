import type { AnchorRect } from "./useAnchorRect";

const PAD = 6;
const DIM = "var(--scrim)";
/** Click-blocking bands around the cutout are invisible; the visible dimming is the ring's own
 * huge spread shadow, so the cutout keeps the panel's rounded corners. */
const BAND = "transparent";

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
				style={{ top: 0, left: 0, right: 0, height: top, background: BAND }}
			/>
			<div
				className="fixed z-40"
				style={{ top: bottom, left: 0, right: 0, bottom: 0, background: BAND }}
			/>
			<div
				className="fixed z-40"
				style={{ top, left: 0, width: left, height, background: BAND }}
			/>
			<div
				className="fixed z-40"
				style={{ top, left: right, right: 0, height, background: BAND }}
			/>
			{/* Decorative ring only — pointer-events-none so it never blocks clicks on the real
			    element inside the cutout (steps like reformsOpen/reformsBuy require the player to
			    actually click the spotlighted button/node to advance). */}
			<div
				className="pointer-events-none fixed z-40 rounded-card text-(--accent)"
				style={{ top, left, width, height, boxShadow: `0 0 0 2px var(--accent), 0 0 0 200vmax ${DIM}` }}
				aria-hidden
			>
				<span className="halo spot-halo" />
			</div>
		</>
	);
}
