import { useEffect, useRef, useState, type ReactElement } from "react";
import { canBuyReformReason } from "../../core";
import type { ReformBlock } from "../../core";
import type { Reform } from "../../core/types";
import { loc } from "../../i18n";
import type { Ui } from "../../i18n";
import { useLang, useUi } from "../../store/langStore";
import { useGameStore } from "../../store/gameStore";
import { useTutorialStore } from "../../store/tutorialStore";
import { EffectLines } from "../effectFormat";

const BRANCHES = ["economy", "force", "social", "propaganda"] as const;
type Branch = (typeof BRANCHES)[number];

/** The reform the detail drawer shows when the player hasn't tapped a node yet:
 * the next actionable one in the chain (first not-yet-owned tier), or the last
 * tier once the whole branch is owned. Keeps the drawer populated by default. */
function nextReformId(
	reforms: Reform[],
	ownedReforms: string[],
): string | null {
	if (reforms.length === 0) return null;
	const nextUnowned = reforms.find((r) => !ownedReforms.includes(r.id));
	return (nextUnowned ?? reforms[reforms.length - 1]).id;
}

function reasonLine(reason: ReformBlock | null, ui: Ui): string | null {
	switch (reason) {
		case "needsPrevious":
			return ui.reformsPanel.reason.needsPrevious;
		case "notEnoughInfluence":
			return ui.reformsPanel.reason.notEnoughInfluence;
		case "notEnoughTreasury":
			return ui.reformsPanel.reason.notEnoughTreasury;
		default:
			return null;
	}
}

function CrossIcon() {
	return (
		<svg
			width="18"
			height="18"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			aria-hidden
		>
			<path d="M5 5 L15 15 M15 5 L5 15" />
		</svg>
	);
}

function LockIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinejoin="round"
			aria-hidden
		>
			<rect x="4" y="9" width="12" height="8" rx="1" />
			<path d="M7 9 V6.5 a3 3 0 0 1 6 0 V9" />
		</svg>
	);
}

// One small line icon per branch, for the phone-landscape vertical rail — same austere
// stroke style as the rest of the chrome (CrossIcon/LockIcon above), not a decorative set.
const BRANCH_ICONS: Record<Branch, ReactElement> = {
	economy: (
		<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<circle cx="10" cy="10" r="7" />
			<path d="M10 6.5v7M8 8.2c0-1 .8-1.7 2-1.7s2 .6 2 1.5c0 2-4 1.3-4 3.3 0 .9.9 1.5 2 1.5s2-.6 2-1.6" />
		</svg>
	),
	force: (
		<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
			<path d="M10 3 L16 5.5 V10 c0 4-2.7 6.3-6 7.5-3.3-1.2-6-3.5-6-7.5V5.5 Z" />
		</svg>
	),
	social: (
		<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<path d="M10 17s-6-3.7-6-8.3C4 6 5.8 4.3 8 4.3c.9 0 1.7.4 2 1 .3-.6 1.1-1 2-1 2.2 0 4 1.7 4 4.4 0 4.6-6 8.3-6 8.3Z" />
		</svg>
	),
	propaganda: (
		<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
			<path d="M3 8.5v3l11 3.5v-10Z" />
			<path d="M14 6.5v7c1.7 0 3-1.6 3-3.5s-1.3-3.5-3-3.5Z" />
			<path d="M6.5 12v3.5c0 .8.7 1.5 1.5 1.5s1.5-.7 1.5-1.5V13" />
		</svg>
	),
};

export function ReformsPanel({ onClose }: { onClose: () => void }) {
	const { state, content, buyReform } = useGameStore();
	const scriptedStep = useTutorialStore((s) => s.scriptedStep);
	const lang = useLang((s) => s.lang);
	const ui = useUi();
	const tutorialTabsAnchor = scriptedStep === "reformsBuy" ? "reforms-tabs" : undefined;
	const [activeBranch, setActiveBranch] = useState<Branch>("economy");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const chainScrollRef = useRef<HTMLDivElement>(null);

	// Switching branch tabs shows a different node chain — jump its scroll area back to
	// the start instead of keeping the previous tab's scroll position (top on the tablet+
	// vertical chain, left on the phone-landscape horizontal one — reset both axes).
	useEffect(() => {
		if (chainScrollRef.current) {
			chainScrollRef.current.scrollTop = 0;
			chainScrollRef.current.scrollLeft = 0;
		}
	}, [activeBranch]);

	if (!state || !content) return null;

	const branchReforms = content.reforms
		.filter((r) => r.branch === activeBranch)
		.sort((a, b) => a.tier - b.tier);

	// The drawer is visible by default: until the player taps a node, it shows the
	// chain's next actionable reform instead of staying empty.
	const effectiveId =
		selectedId ?? nextReformId(branchReforms, state.ownedReforms);
	const selected = effectiveId
		? (branchReforms.find((r) => r.id === effectiveId) ?? null)
		: null;

	function selectBranch(b: Branch) {
		setActiveBranch(b);
		setSelectedId(null);
	}

	function renderDetail(r: Reform) {
		const reason = canBuyReformReason(state!, content!, r.id);
		const owned = reason === "owned";
		const line = reasonLine(reason, ui);
		// Two panes: scrollable details above, an approve footer pinned to the drawer's bottom
		// (aside is the flex-col container — see below — so this footer never needs scrolling to reach).
		return (
			<>
				<div className="flex-1 overflow-y-auto p-sp-3">
					<p className="eyebrow">
						{ui.reformsPanel.tier} {r.tier + 1}
					</p>
					<h3 className="text-heading font-bold leading-tight">
						{loc(r.title, lang)}
					</h3>

					<p className="mt-sp-2 text-body leading-snug text-(--text-faint)">
						{loc(r.description, lang)}
					</p>

					<p className="eyebrow mt-sp-3">
						{ui.reformsPanel.influencePoints}:{" "}
						<span className="num text-(--gold)">{r.costInfluence}</span>
						{" · "}
						{ui.reformsPanel.treasury}:{" "}
						<span className="num text-(--gold)">{r.costTreasury}</span>
					</p>

					<div className="mt-sp-3">
						<p className="eyebrow">{ui.reformsPanel.effectsInstant}</p>
						<EffectLines effects={r.instant} ui={ui} />
					</div>
					{r.perTurn.length > 0 && (
						<div className="mt-sp-3">
							<p className="eyebrow">{ui.reformsPanel.effectsPerMonth}</p>
							<EffectLines effects={r.perTurn} ui={ui} />
						</div>
					)}
				</div>

				<div className="shrink-0 border-t border-(--paper-line) p-sp-3">
					{owned ? (
						<span className="stamp text-label">{ui.reformsPanel.adopted}</span>
					) : (
						<>
							<button
								type="button"
								className="btn btn-primary min-h-11 w-full"
								disabled={reason !== null}
								onClick={() => buyReform(r.id)}
							>
								{ui.reformsPanel.approve}
							</button>
							{line && (
								<p className="mt-sp-1 text-center text-caption text-(--stamp)">
									{line}
								</p>
							)}
						</>
					)}
				</div>
			</>
		);
	}

	return (
		<div className="safe-area-x fixed inset-0 z-10 flex flex-col bg-(--ink)">
			{/* Pinned header */}
			<header className="shrink-0 border-b border-(--paper-line)">
				<div className="mx-auto flex items-center gap-sp-3 px-sp-3 py-sp-1 desktop:max-w-[1150px]">
					<h2 className="text-heading font-bold">{ui.reformsPanel.title}</h2>
					<p className="eyebrow flex-1 truncate">
						{ui.reformsPanel.influencePoints}:{" "}
						<span className="num text-(--gold)">
							{Math.floor(state.influence)}
						</span>
						{" · "}
						{ui.reformsPanel.treasury}:{" "}
						<span className="num text-(--gold)">
							{Math.round(state.stats.treasury)}
						</span>
					</p>
					<button
						type="button"
						aria-label={ui.reformsPanel.close}
						onClick={onClose}
						className="flex h-11 w-11 shrink-0 items-center justify-center text-(--paper) hover:bg-(--ink-soft) desktop:h-8 desktop:w-8"
					>
						<CrossIcon />
					</button>
				</div>
			</header>

			{/* Tablet/desktop: branch tabs as a top row (unchanged from the original design). */}
			<nav
				className="mx-auto hidden w-full shrink-0 border-b border-(--paper-line) tablet:flex desktop:max-w-[1150px]"
				aria-label={ui.reformsPanel.title}
				data-tutorial={tutorialTabsAnchor}
			>
				{BRANCHES.map((b) => {
					const active = b === activeBranch;
					return (
						<button
							key={b}
							type="button"
							aria-pressed={active}
							onClick={() => selectBranch(b)}
							className="flex min-h-11 flex-1 items-center justify-center gap-1.5 px-1 text-center text-label uppercase leading-tight tracking-wide hover:opacity-80"
							style={{
								background: active ? "var(--gold)" : "transparent",
								color: active ? "var(--ink)" : "var(--paper)",
								fontWeight: active ? 700 : 400,
							}}
						>
							{ui.branches[b]}
						</button>
					);
				})}
			</nav>

			{/* Phone landscape: branch tabs as a left vertical rail alongside everything else,
			    instead of a top row — keeps vertical space for the node chain. text-caption here
			    (not text-label, despite being a button) is deliberate: at w-16 two-word branch
			    names (e.g. ru "Силовой блок") already wrap to 2 lines, and label-size text would
			    push a 3rd line past the min-h-11 row. */}
			<div className="mx-auto flex w-full min-h-0 flex-1 desktop:max-w-[1150px]">
				<nav
					className="flex w-16 shrink-0 flex-col border-r border-(--paper-line) tablet:hidden"
					aria-label={ui.reformsPanel.title}
					data-tutorial={tutorialTabsAnchor}
				>
					{BRANCHES.map((b) => {
						const active = b === activeBranch;
						return (
							<button
								key={b}
								type="button"
								aria-pressed={active}
								onClick={() => selectBranch(b)}
								className="flex min-h-11 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center text-caption uppercase leading-tight tracking-wide hover:opacity-80"
								style={{
									background: active ? "var(--gold)" : "transparent",
									color: active ? "var(--ink)" : "var(--paper)",
									fontWeight: active ? 700 : 400,
								}}
							>
								{BRANCH_ICONS[b]}
								{ui.branches[b]}
							</button>
						);
					})}
				</nav>

				{/* Node chain + detail pane: horizontal-scrolling row of compact cards on phone
				    landscape (vertical space is scarce there), a vertical stack with a sidebar
				    detail pane from tablet up (more room). The detail pane is always visible
				    (see effectiveId above) — no click needed to reveal it; there is no bottom-
				    sheet variant anymore since phone portrait never reaches this screen. */}
				<div
					ref={chainScrollRef}
					className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden p-sp-2 tablet:overflow-x-visible tablet:overflow-y-auto"
				>
					<div className="flex h-full items-stretch gap-sp-2 tablet:h-auto tablet:flex-col tablet:items-stretch tablet:gap-0">
						{branchReforms.map((r, i) => {
							const reason = canBuyReformReason(state, content, r.id);
							const owned = reason === "owned";
							const locked = reason === "needsPrevious";
							const available = reason === null;
							const isSelected = effectiveId === r.id;
							const opacity = owned ? 0.9 : available ? 1 : locked ? 0.45 : 0.7;
							const isTutorialFirstNode = scriptedStep === "reformsBuy" && r.tier === 0 && available;
							return (
								<div key={r.id} className="flex items-stretch tablet:block">
									{i > 0 && (
										<div className="my-auto h-0.5 w-3 shrink-0 bg-(--paper-line) tablet:mx-auto tablet:h-4 tablet:w-0.5" />
									)}
									<button
										type="button"
										onClick={() => setSelectedId(r.id)}
										data-tutorial={isTutorialFirstNode ? "reforms-first-node" : undefined}
										className="panel w-44 shrink-0 p-sp-2 text-left hover:bg-(--paper-dim) tablet:w-full"
										style={{
											opacity,
											boxShadow: isSelected
												? "0 0 0 2px var(--gold)"
												: undefined,
										}}
									>
										<div className="flex items-center justify-between gap-sp-2">
											<div className="min-w-0">
												<p className="eyebrow">
													{ui.reformsPanel.tier} {r.tier + 1}
												</p>
												<p className="font-bold">{loc(r.title, lang)}</p>
											</div>
											{owned ? (
												<span className="stamp shrink-0 text-caption">
													{ui.reformsPanel.adopted}
												</span>
											) : locked ? (
												<span
													className="shrink-0 text-(--text-faint)"
													aria-label={ui.reformsPanel.locked}
												>
													<LockIcon />
												</span>
											) : (
												<span className="num shrink-0 text-num text-(--text-faint)">
													{r.costInfluence} {ui.reformsPanel.costInfluence} ·{" "}
													{r.costTreasury} {ui.reformsPanel.costTreasury}
												</span>
											)}
										</div>
										<p className="mt-sp-1 text-caption leading-snug text-(--text-faint)">
											{loc(r.description, lang)}
										</p>
									</button>
								</div>
							);
						})}
					</div>
				</div>

				{selected && (
					<aside className="flex w-[38%] shrink-0 flex-col overflow-hidden border-l border-(--paper-line) bg-(--paper) text-(--text-ink) tablet:w-80 desktop:w-96">
						{renderDetail(selected)}
					</aside>
				)}
			</div>
		</div>
	);
}
