import { useEffect } from "react";
import type { StatKey } from "../../core/types";
import { gameDate, loc } from "../../i18n";
import { isDangerous } from "../../data/statMeta";
import { useLang, useUi } from "../../store/langStore";
import { useGameStore } from "../../store/gameStore";
import { StatRow } from "../components/StatRow";
import { VectorScale } from "../components/VectorScale";
import { EventModal } from "../components/EventModal";
import { ReformsPanel } from "../components/ReformsPanel";
import { SpeedControls } from "../components/SpeedControls";

const STAT_ORDER: StatKey[] = [
	"economy",
	"treasury",
	"approval",
	"eliteLoyalty",
	"stability",
	"development",
	"corruption",
];

function BackIcon() {
	return (
		<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<path d="M12 5 L7 10 L12 15" />
		</svg>
	);
}

/**
 * The gazette's turn-loop screen: a masthead (title + dateline), a two-column body (the stat
 * ledger on the left, an influence/vector rail on the right), and a footer (election countdown,
 * clock, reforms). Same structure at every form factor — the fluid type/spacing tokens carry
 * the growth, not a different layout per breakpoint.
 */
export function MainScreen() {
	const {
		state,
		content,
		prevStats,
		reformsOpen,
		openReforms,
		closeReforms,
		startClock,
		stopClock,
		toMenu,
		speed,
		setSpeed,
	} = useGameStore();
	const lang = useLang((s) => s.lang);
	const ui = useUi();

	// The real-time clock runs only while the game screen is mounted (cleaned up on unmount).
	useEffect(() => {
		startClock();
		return () => stopClock();
	}, [startClock, stopClock]);

	// Keyboard: Space toggles pause/resume (manual pause — same "manual pause wins" priority as
	// the speed buttons), Esc closes the reforms panel. Ignored while a form control has focus
	// so it doesn't fight the browser's own Space-activates-focused-button behavior.
	useEffect(() => {
		function onKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement | null;
			const isFormControl =
				target &&
				["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(target.tagName);
			if (e.code === "Space" && !isFormControl) {
				e.preventDefault();
				setSpeed(speed === "paused" ? "normal" : "paused");
			} else if (e.key === "Escape" && reformsOpen) {
				closeReforms();
			}
		}
		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [speed, setSpeed, reformsOpen, closeReforms]);

	if (!state || !content) return null;

	const { month, year } = gameDate(state.turn, ui);
	const dangerThreshold = content.difficulty.defeatThreshold + 10;
	// The term/election cycle: elections land at the end of each 48-month term.
	const termLength = content.difficulty.turnsToWin;
	const monthsUntilElection = state.term * termLength - state.turn;

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-sp-2 p-sp-3">
			{/* Masthead */}
			<header className="flex shrink-0 items-baseline justify-between gap-sp-2 border-b border-(--ink) pb-sp-1">
				<div className="flex min-w-0 items-baseline gap-sp-2">
					<button
						type="button"
						onClick={toMenu}
						aria-label={ui.gameOver.toMenu}
						className="-mb-0.5 flex h-11 w-11 shrink-0 translate-y-1 items-center justify-center border border-(--paper-line) hover:bg-(--paper-dim) desktop:h-8 desktop:w-8"
					>
						<BackIcon />
					</button>
					<h1 className="truncate text-heading font-bold">{ui.main.mastheadTitle}</h1>
				</div>
				<p className="shrink-0 text-caption uppercase tracking-wider opacity-60">
					{loc(content.country.name, lang)} · {month} {year} · {ui.main.term} {state.term}
				</p>
			</header>

			{/* Body */}
			<div className="flex min-h-0 flex-1 gap-sp-4">
				<div data-tutorial="stats-panel" className="flex min-h-0 flex-1 flex-col justify-between overflow-y-auto">
					{STAT_ORDER.map((k) => (
						<StatRow
							key={k}
							statKey={k}
							value={state.stats[k]}
							prev={prevStats ? prevStats[k] : null}
							danger={isDangerous(k, state.stats[k], dangerThreshold)}
						/>
					))}
				</div>

				<div className="flex w-[150px] shrink-0 flex-col items-center border-l border-(--paper-line) pl-sp-3">
					<p className="eyebrow self-start">{ui.main.influence}</p>
					<p
						className="num mt-sp-1 leading-[0.85] text-(--text-ink)"
						style={{ fontSize: "clamp(3.5rem, calc(3.5rem + 20 * (100vw - 640px) / 640), 4.5rem)" }}
					>
						{Math.floor(state.influence)}
					</p>
					<p className="mt-sp-1 text-center text-caption opacity-55">{ui.main.influenceCaption}</p>
					<div data-tutorial="vector-scale" className="mt-auto w-full">
						<VectorScale vector={state.vector} />
					</div>
				</div>
			</div>

			{/* Footer */}
			<div className="flex shrink-0 items-center gap-sp-2 border-t border-(--ink) pt-sp-1">
				<span className="text-caption uppercase opacity-55">
					{ui.main.untilElection} <span className="num">{monthsUntilElection}</span> {ui.main.monthsShort}
				</span>
				<div className="ml-auto flex items-center gap-sp-2" data-tutorial="clock-controls">
					<SpeedControls />
				</div>
				<button
					className="btn btn-primary min-h-9 shrink-0 text-label"
					onClick={openReforms}
					data-tutorial="reforms-button"
				>
					{ui.main.reforms}
				</button>
			</div>

			{reformsOpen && <ReformsPanel onClose={closeReforms} />}
			<EventModal />
		</div>
	);
}
