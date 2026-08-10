import { useState } from "react";
import { canBuyReformReason } from "../../core";
import type { ReformBlock } from "../../core";
import type { Reform } from "../../core/types";
import { loc } from "../../i18n";
import type { Ui } from "../../i18n";
import { useLang, useUi } from "../../store/langStore";
import { useGameStore } from "../../store/gameStore";
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

export function ReformsPanel({ onClose }: { onClose: () => void }) {
	const { state, content, buyReform } = useGameStore();
	const lang = useLang((s) => s.lang);
	const ui = useUi();
	const [activeBranch, setActiveBranch] = useState<Branch>("economy");
	const [selectedId, setSelectedId] = useState<string | null>(null);
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

	function renderDetail(r: Reform) {
		const reason = canBuyReformReason(state!, content!, r.id);
		const owned = reason === "owned";
		const line = reasonLine(reason, ui);
		// Two panes: scrollable details above, an approve footer pinned to the drawer's bottom
		// (aside is the flex-col container — see below — so this footer never needs scrolling to reach).
		return (
			<>
				<div className="flex-1 overflow-y-auto p-4">
					<p className="eyebrow">
						{ui.reformsPanel.tier} {r.tier + 1}
					</p>
					<h3 className="text-lg font-bold leading-tight">
						{loc(r.title, lang)}
					</h3>

					<p className="mt-2 text-sm leading-snug text-(--text-faint)">
						{loc(r.description, lang)}
					</p>

					<p className="eyebrow mt-3">
						{ui.reformsPanel.influencePoints}:{" "}
						<span className="num text-(--gold)">{r.costInfluence}</span>
						{" · "}
						{ui.reformsPanel.treasury}:{" "}
						<span className="num text-(--gold)">{r.costTreasury}</span>
					</p>

					<div className="mt-3">
						<p className="eyebrow">{ui.reformsPanel.effectsInstant}</p>
						<EffectLines effects={r.instant} ui={ui} />
					</div>
					{r.perTurn.length > 0 && (
						<div className="mt-3">
							<p className="eyebrow">{ui.reformsPanel.effectsPerMonth}</p>
							<EffectLines effects={r.perTurn} ui={ui} />
						</div>
					)}
				</div>

				<div className="shrink-0 border-t border-(--paper-line) p-4">
					{owned ? (
						<span className="stamp text-sm">{ui.reformsPanel.adopted}</span>
					) : (
						<>
							<button
								type="button"
								className="btn btn-primary w-full"
								disabled={reason !== null}
								onClick={() => buyReform(r.id)}
							>
								{ui.reformsPanel.approve}
							</button>
							{line && (
								<p className="mt-1 text-center text-xs text-(--stamp)">
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
		<div className="fixed inset-0 z-10 flex flex-col bg-(--ink)">
			{/* Pinned header */}
			<header className="shrink-0 border-b border-(--paper-line)">
				<div className="mx-auto flex max-w-150 items-center gap-3 px-3 py-2">
					<h2 className="text-lg font-bold">{ui.reformsPanel.title}</h2>
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
						className="-mr-1 flex h-8 w-8 shrink-0 items-center justify-center text-(--paper)"
					>
						<CrossIcon />
					</button>
				</div>
			</header>

			{/* Branch tabs */}
			<nav
				className="mx-auto flex w-full max-w-150 shrink-0 border-b border-(--paper-line)"
				aria-label={ui.reformsPanel.title}
			>
				{BRANCHES.map((b) => {
					const active = b === activeBranch;
					return (
						<button
							key={b}
							type="button"
							aria-pressed={active}
							onClick={() => {
								setActiveBranch(b);
								setSelectedId(null);
							}}
							className="flex min-h-11 flex-1 items-center justify-center px-1 text-center text-[0.7rem] uppercase leading-tight tracking-wide"
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

			{/* Node chain + detail drawer: side-by-side on ≥768px, stacked with the drawer
          docked at the bottom on narrow screens. The drawer is always on screen (see
          effectiveId above) — no click needed to reveal it. */}
			<div className="mx-auto flex w-full max-w-150 flex-1 flex-col overflow-hidden md:flex-row">
				<div className="min-h-0 flex-1 overflow-y-auto p-3">
					<div className="flex flex-col items-stretch">
						{branchReforms.map((r, i) => {
							const reason = canBuyReformReason(state, content, r.id);
							const owned = reason === "owned";
							const locked = reason === "needsPrevious";
							const available = reason === null;
							const isSelected = effectiveId === r.id;
							const opacity = owned ? 0.9 : available ? 1 : locked ? 0.45 : 0.7;
							return (
								<div key={r.id}>
									{i > 0 && (
										<div className="mx-auto h-4 w-0.5 bg-(--paper-line)" />
									)}
									<button
										type="button"
										onClick={() => setSelectedId(r.id)}
										className="panel w-full p-3 text-left"
										style={{
											opacity,
											boxShadow: isSelected
												? "0 0 0 2px var(--gold)"
												: undefined,
										}}
									>
										<div className="flex items-center justify-between gap-2">
											<div className="min-w-0">
												<p className="eyebrow">
													{ui.reformsPanel.tier} {r.tier + 1}
												</p>
												<p className="font-bold">{loc(r.title, lang)}</p>
											</div>
											{owned ? (
												<span className="stamp shrink-0 text-[0.6rem]">
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
												<span className="num shrink-0 text-xs text-(--text-faint)">
													{r.costInfluence} {ui.reformsPanel.costInfluence} ·{" "}
													{r.costTreasury} {ui.reformsPanel.costTreasury}
												</span>
											)}
										</div>
										<p className="mt-1 text-xs leading-snug text-(--text-faint)">
											{loc(r.description, lang)}
										</p>
									</button>
								</div>
							);
						})}
					</div>
				</div>

				{selected && (
					<aside className="flex max-h-[42vh] my-3 shrink-0 flex-col overflow-hidden rounded-t-2xl border-t border-(--paper-line) bg-(--paper) text-(--text-ink) md:max-h-none md:w-80 md:rounded-none md:border-l md:border-t-0">
						{renderDetail(selected)}
					</aside>
				)}
			</div>
		</div>
	);
}
