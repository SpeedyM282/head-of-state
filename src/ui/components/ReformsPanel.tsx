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

/** The reform the detail pane shows when the player hasn't tapped a node yet: the next
 * actionable one in the chain (first not-yet-owned tier), or the last tier once the whole
 * branch is owned. Keeps the pane populated by default. */
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
			width="12"
			height="12"
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

// One duotone-style stroke icon per branch, for the always-on-left rail — same austere line
// style as the rest of the chrome (CrossIcon/LockIcon above).
const BRANCH_ICONS: Record<Branch, ReactElement> = {
	economy: (
		<svg
			width="17"
			height="17"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<circle cx="10" cy="10" r="7" />
			<path d="M10 6.5v7M8 8.2c0-1 .8-1.7 2-1.7s2 .6 2 1.5c0 2-4 1.3-4 3.3 0 .9.9 1.5 2 1.5s2-.6 2-1.6" />
		</svg>
	),
	force: (
		<svg
			width="17"
			height="17"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d="M10 3 L16 5.5 V10 c0 4-2.7 6.3-6 7.5-3.3-1.2-6-3.5-6-7.5V5.5 Z" />
		</svg>
	),
	social: (
		<svg
			width="17"
			height="17"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
			<path d="M10 17s-6-3.7-6-8.3C4 6 5.8 4.3 8 4.3c.9 0 1.7.4 2 1 .3-.6 1.1-1 2-1 2.2 0 4 1.7 4 4.4 0 4.6-6 8.3-6 8.3Z" />
		</svg>
	),
	propaganda: (
		<svg
			width="17"
			height="17"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.6"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden
		>
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
	const tutorialTabsAnchor =
		scriptedStep === "reformsBuy" ? "reforms-tabs" : undefined;
	const [activeBranch, setActiveBranch] = useState<Branch>("economy");
	const [selectedId, setSelectedId] = useState<string | null>(null);
	const chainScrollRef = useRef<HTMLDivElement>(null);

	// Switching branch resets the chain's scroll position and clears the manual selection —
	// the detail pane falls back to the new branch's next actionable node (see effectiveId).
	useEffect(() => {
		if (chainScrollRef.current) chainScrollRef.current.scrollLeft = 0;
	}, [activeBranch]);

	if (!state || !content) return null;

	const branchReforms = content.reforms
		.filter((r) => r.branch === activeBranch)
		.sort((a, b) => a.tier - b.tier);

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
		return (
			<>
				<div className="flex-1 overflow-y-auto p-sp-2">
					<h3 className="text-label font-bold leading-tight">
						{loc(r.title, lang)}
					</h3>

					<p className="mt-sp-1 text-caption leading-snug opacity-62">
						{loc(r.description, lang)}
					</p>

					<p className="eyebrow mt-sp-2">
						{ui.reformsPanel.influencePoints}:{" "}
						<span className="num text-(--gold)">{r.costInfluence}</span>
						{" · "}
						{ui.reformsPanel.treasury}:{" "}
						<span className="num text-(--gold)">{r.costTreasury}</span>
					</p>

					<div className="mt-sp-2">
						<p className="eyebrow">{ui.reformsPanel.effectsInstant}</p>
						<EffectLines effects={r.instant} ui={ui} />
					</div>
					{r.perTurn.length > 0 && (
						<div className="mt-sp-2">
							<p className="eyebrow">{ui.reformsPanel.effectsPerMonth}</p>
							<EffectLines effects={r.perTurn} ui={ui} />
						</div>
					)}
				</div>

				<div className="shrink-0 border-t border-(--paper-line) p-sp-2 text-center">
					{owned ? (
						<span className="badge">{ui.reformsPanel.adopted}</span>
					) : (
						<>
							<button
								type="button"
								className="btn btn-primary min-h-9 w-full text-label"
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
		<div className="safe-area-x fixed inset-0 z-10 flex flex-col bg-(--paper)">
			<header className="flex shrink-0 items-baseline gap-sp-2 border-b border-(--ink) px-sp-3 py-sp-1">
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
					className="flex h-11 w-11 shrink-0 items-center justify-center text-(--text-ink) hover:bg-(--paper-dim)"
				>
					<CrossIcon />
				</button>
			</header>

			<div className="flex min-h-0 flex-1">
				{/* Branch rail — always a left icon column, at every form factor (see the
				    redesign's "same structure everywhere" philosophy in ARCHITECTURE.md §7a). */}
				<nav
					className="flex w-[78px] shrink-0 flex-col border-r border-(--ink)"
					aria-label={ui.reformsPanel.title}
					data-tutorial={tutorialTabsAnchor}
				>
					{BRANCHES.map((b, i) => {
						const active = b === activeBranch;
						return (
							<button
								key={b}
								type="button"
								aria-pressed={active}
								onClick={() => selectBranch(b)}
								className={`flex min-h-11 flex-col items-center justify-center gap-0.5 px-0.5 py-sp-2 text-center text-micro uppercase leading-tight tracking-wide hover:opacity-80${i > 0 ? " border-t border-(--paper-line)" : ""}`}
								style={{
									background: active ? "var(--gold-tint)" : "transparent",
									borderLeft: `3px solid ${active ? "var(--gold)" : "transparent"}`,
									color: active ? "var(--gold-deep)" : "var(--text-ink)",
									fontWeight: 600,
								}}
							>
								<span className={active ? undefined : "text-(--gold)"}>
									{BRANCH_ICONS[b]}
								</span>
								{ui.branches[b]}
							</button>
						);
					})}
				</nav>

				{/* Node chain — a horizontal-scrolling row of compact cards at every form factor
				    (matching the mock's single fixed layout; only the detail pane's default node
				    changes on branch switch, see effectiveId). */}
				<div
					ref={chainScrollRef}
					className="flex min-w-0 flex-1 items-center overflow-x-auto overflow-y-hidden p-sp-2"
				>
					<div className="flex items-stretch gap-sp-2">
						{branchReforms.map((r, i) => {
							const reason = canBuyReformReason(state, content, r.id);
							const owned = reason === "owned";
							const locked = reason === "needsPrevious";
							const available = reason === null;
							const isSelected = effectiveId === r.id;
							const opacity = owned ? 0.9 : available ? 1 : locked ? 0.5 : 0.7;
							const isTutorialFirstNode =
								scriptedStep === "reformsBuy" && r.tier === 0 && available;
							return (
								<div key={r.id} className="flex items-stretch">
									{i > 0 && (
										<div className="my-auto h-0.5 w-3 shrink-0 bg-(--paper-line)" />
									)}
									<button
										type="button"
										onClick={() => setSelectedId(r.id)}
										data-tutorial={
											isTutorialFirstNode ? "reforms-first-node" : undefined
										}
										className="relative w-33 shrink-0 border border-(--paper-line) bg-(--paper) p-sp-2 text-left hover:bg-(--paper-dim)"
										style={{
											opacity,
											borderColor: isSelected ? "var(--gold)" : undefined,
											boxShadow: isSelected
												? "0 0 0 2px var(--gold)"
												: undefined,
										}}
									>
										{locked && (
											<span
												className="absolute right-1.5 top-1.5 text-(--text-faint)"
												aria-label={ui.reformsPanel.locked}
											>
												<LockIcon />
											</span>
										)}
										<p className="eyebrow absolute left-1.5 top-1.5">
											{ui.reformsPanel.tier} {r.tier + 1}
										</p>
										<p className="mt-sp-3 text-label font-bold leading-tight">
											{loc(r.title, lang)}
										</p>
										<div className="mt-sp-1">
											{owned ? (
												<span className="badge">{ui.reformsPanel.adopted}</span>
											) : !locked ? (
												<span className="num text-caption opacity-65">
													{r.costInfluence} {ui.reformsPanel.costInfluence} ·{" "}
													{r.costTreasury} {ui.reformsPanel.costTreasury}
												</span>
											) : null}
										</div>
									</button>
								</div>
							);
						})}
					</div>
				</div>

				{selected && (
					<aside className="flex w-52 shrink-0 flex-col overflow-hidden border-l border-(--ink)">
						{renderDetail(selected)}
					</aside>
				)}
			</div>
		</div>
	);
}
