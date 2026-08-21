import { useEffect, useState } from "react";
import { useUi } from "../../store/langStore";
import { useGameStore } from "../../store/gameStore";
import { WorldMap, type RegionKey } from "../components/WorldMap";
import { CountryListModal } from "../components/CountryListModal";
import { CountryDrawer } from "../components/CountryDrawer";

export function MapScreen() {
	const ui = useUi();
	const toMenu = useGameStore((s) => s.toMenu);
	const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
	const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
		null,
	);
	const [listOpen, setListOpen] = useState(false);

	function selectFromList(id: string) {
		// The list stays open: picking a country shows its dossier drawer alongside it, so the
		// player can keep browsing/comparing other countries without reopening the list each time.
		setSelectedCountryId(id);
	}

	// Esc closes whichever overlay is open — the list modal first (it sits on top when both
	// could theoretically be set), then the country dossier drawer.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			if (e.key !== "Escape") return;
			if (listOpen) setListOpen(false);
			else if (selectedCountryId) setSelectedCountryId(null);
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [listOpen, selectedCountryId]);

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			{/* The map now fills the whole viewport on phone landscape — the back/region/list
			    controls that used to sit in a row above it are overlaid directly on the map
			    itself instead, so the map gets the full screen rather than losing a row's height
			    to chrome. `fixed inset-0` breaks out of App.tsx's padded/centered wrapper for
			    that; it reverts to a normal in-flow flex-1 panel at tablet/desktop, matching
			    App.tsx's "centered canvas, not stretched edge-to-edge" layout there — `relative`
			    (not `static`) is kept there too so the overlaid controls below still anchor to
			    the map's own box, not the app shell. */}
			<div
				className="fixed inset-0 overflow-hidden border border-(--paper-line) tablet:relative tablet:inset-auto tablet:h-auto tablet:min-h-0 tablet:flex-1"
				style={{ background: "var(--ink-soft)" }}
			>
				<WorldMap
					activeRegion={activeRegion}
					onEnterRegion={setActiveRegion}
					selectedCountryId={selectedCountryId}
					onSelectCountry={setSelectedCountryId}
				/>

				{/* Top overlay: back-to-menu, region back/heading, list-view fallback — each an
				    opaque chip (border+paper fill, like the region-name chip below) so it reads
				    over the map instead of blending into it. Safe-area-aware left/right padding
				    since this row now sits flush against the true screen edges on phone landscape. */}
				<div
					className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-sp-2 p-sp-2"
					style={{
						paddingLeft: "calc(var(--spacing-sp-2) + env(safe-area-inset-left, 0px))",
						paddingRight: "calc(var(--spacing-sp-2) + env(safe-area-inset-right, 0px))",
					}}
				>
					<div className="pointer-events-auto flex min-w-0 items-center gap-sp-2">
						<button
							type="button"
							onClick={toMenu}
							aria-label={ui.gameOver.toMenu}
							className="flex h-11 w-11 shrink-0 items-center justify-center border border-(--paper-line) bg-(--paper) shadow-sm hover:bg-(--paper-dim) desktop:h-9 desktop:w-9"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 20 20"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden
							>
								<path d="M12 5 L7 10 L12 15" />
							</svg>
						</button>
						{activeRegion ? (
							<button
								type="button"
								onClick={() => {
									setActiveRegion(null);
									setSelectedCountryId(null);
								}}
								className="flex min-h-11 shrink-0 items-center gap-sp-1 border border-(--paper-line) bg-(--paper) px-sp-2 text-caption shadow-sm hover:bg-(--paper-dim)"
							>
								<svg
									width="14"
									height="14"
									viewBox="0 0 20 20"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden
								>
									<path d="M12 5 L7 10 L12 15" />
								</svg>
								{ui.map.backToRegions}
							</button>
						) : (
							<span className="eyebrow truncate border border-(--paper-line) bg-(--paper) px-sp-2 py-sp-1 shadow-sm">
								{ui.map.chooseRegion}
							</span>
						)}
					</div>
					<button
						type="button"
						className="btn pointer-events-auto min-h-11 shrink-0 shadow-sm"
						onClick={() => setListOpen(true)}
					>
						{ui.map.listButton}
					</button>
				</div>

				{/* Active region's name, overlaid bottom-left of the map itself instead of the
            control row above — reads like a map label, out of the way of the shapes. */}
				{activeRegion && (
					<div
						className="pointer-events-none absolute bottom-2 border border-(--paper-line) bg-(--paper) px-sp-2 py-sp-1 text-caption font-bold text-(--text-ink) shadow-sm tablet:bottom-3"
						style={{ left: "calc(0.5rem + env(safe-area-inset-left, 0px))" }}
					>
						{ui.map.continents[activeRegion]}
					</div>
				)}
			</div>

			{listOpen && (
				<CountryListModal
					onSelect={selectFromList}
					onClose={() => setListOpen(false)}
				/>
			)}

			{selectedCountryId && (
				<CountryDrawer
					countryId={selectedCountryId}
					onClose={() => setSelectedCountryId(null)}
				/>
			)}
		</div>
	);
}
