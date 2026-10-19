import { useState, type ReactNode } from 'react';
import { canBuyReformReason } from '../../core';
import type { ReformBlock } from '../../core';
import type { Reform } from '../../core/types';
import { loc } from '../../i18n';
import type { Ui } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { EffectInline } from '../effectFormat';
import { TopBar } from './TopBar';
import { VectorPanel } from './VectorPanel';

const BRANCHES = ['economy', 'force', 'social', 'propaganda'] as const;
type Branch = (typeof BRANCHES)[number];

/** The reform the detail pane shows when the player hasn't tapped a node yet: the next
 * actionable one in the chain (first not-yet-owned tier), or the last tier once the whole
 * branch is owned. Keeps the pane populated by default. */
function nextReformId(reforms: Reform[], ownedReforms: string[]): string | null {
  if (reforms.length === 0) return null;
  const nextUnowned = reforms.find((r) => !ownedReforms.includes(r.id));
  return (nextUnowned ?? reforms[reforms.length - 1]).id;
}

function reasonLine(reason: ReformBlock | null, ui: Ui): string | null {
  switch (reason) {
    case 'needsPrevious':
      return ui.reformsPanel.reason.needsPrevious;
    case 'notEnoughInfluence':
      return ui.reformsPanel.reason.notEnoughInfluence;
    case 'notEnoughTreasury':
      return ui.reformsPanel.reason.notEnoughTreasury;
    default:
      return null;
  }
}

/**
 * «Кабинет» reforms screen (handoff screen 05): a full-screen view over the main screen with
 * the branch rail, the branch's level chain, the selected level's detail with «Принять», and
 * the governance vector panel along the bottom (the vector lives here, not on the main screen).
 */
export function ReformsPanel({ onClose }: { onClose: () => void }) {
  const { state, content, buyReform, vectorTrail } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const [activeBranch, setActiveBranch] = useState<Branch>('economy');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!state || !content) return null;

  const branchReforms = content.reforms.filter((r) => r.branch === activeBranch).sort((a, b) => a.tier - b.tier);
  const effectiveId = selectedId ?? nextReformId(branchReforms, state.ownedReforms);
  const selected = effectiveId ? (branchReforms.find((r) => r.id === effectiveId) ?? null) : null;
  const cost = (r: Reform) => `${r.costInfluence} ${ui.reformsPanel.costInfluence} · ${r.costTreasury} ${ui.reformsPanel.costTreasury}`;

  function selectBranch(b: Branch) {
    setActiveBranch(b);
    setSelectedId(null);
  }

  const previewShift = selected ? (selected.instant.find((e) => e.target === 'vector')?.delta ?? 0) : null;

  return (
    <div
      className="fixed inset-0 z-10 flex flex-col gap-sp-3 overflow-hidden bg-(--bg) py-sp-3 desktop:gap-dp-56 desktop:pb-dp-48 desktop:pt-sp-4"
      style={{ paddingLeft: 'max(var(--spacing-sp-5), env(safe-area-inset-left))', paddingRight: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
    >
      <div className="lamp-glow" aria-hidden />
      <TopBar
        title={ui.reformsPanel.title}
        onBack={onClose}
        backLabel={ui.reformsPanel.close}
        meta={
          <>
            <span className="lowercase">{ui.reformsPanel.influencePoints}</span>{' '}
            <span className="num text-num text-(--text)">{Math.floor(state.influence)}</span>
            {' · '}
            <span className="lowercase">{ui.reformsPanel.treasury}</span> <span className="num text-num text-(--text)">{Math.round(state.stats.treasury)}</span>
          </>
        }
      />

      <div className="relative flex min-h-0 flex-1 gap-sp-3 desktop:gap-dp-60">
        {/* Branch rail. */}
        <nav className="flex w-[116px] shrink-0 flex-col gap-0.5 desktop:w-dp-280 desktop:gap-dp-6" aria-label={ui.reformsPanel.title}>
          {BRANCHES.map((b) => {
            const active = b === activeBranch;
            return (
              <button
                key={b}
                type="button"
                aria-pressed={active}
                onClick={() => selectBranch(b)}
                className={`press min-h-9 rounded-btn px-2.5 text-left text-label font-medium desktop:px-dp-22 desktop:py-dp-20 desktop:text-dp-23 ${active ? 'bg-(--selected) text-(--accent)' : ''}`}
              >
                {ui.branches[b]}
              </button>
            );
          })}
        </nav>

        {/* Level chain. */}
        <div className="flex w-[226px] shrink-0 flex-col overflow-y-auto pb-1 tablet:w-[280px] desktop:w-dp-560">
          {branchReforms.map((r, i) => {
            const reason = canBuyReformReason(state, content, r.id);
            const owned = reason === 'owned';
            const locked = reason === 'needsPrevious';
            const isSelected = effectiveId === r.id;
            const prevOwned = i > 0 && state.ownedReforms.includes(branchReforms[i - 1].id);
            return (
              <div key={r.id} className="flex flex-col">
                {i > 0 && (
                  <div className="relative ml-[18px] h-2 w-px shrink-0 bg-(--line) desktop:ml-[calc(var(--dp)*44)] desktop:h-dp-24 desktop:w-dp-2" aria-hidden>
                    {prevOwned && isSelected && !owned && <span className="flow-dot" />}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedId(r.id)}
                  aria-pressed={isSelected}
                  className={`press relative flex flex-col gap-0.5 rounded-row border px-sp-3 py-1 text-left desktop:gap-dp-10 desktop:px-dp-26 desktop:py-dp-22 ${isSelected ? 'border-(--accent) bg-(--selected) text-(--accent)' : 'border-(--line)'}`}
                  style={{ opacity: locked && !isSelected ? 0.45 : 1 }}
                >
                  {isSelected && <span className="halo" aria-hidden />}
                  <span className="text-micro uppercase leading-none tracking-[0.12em] text-(--muted)">
                    {ui.reformsPanel.tier} {r.tier + 1}
                  </span>
                  <span className="flex items-baseline gap-sp-2">
                    <span className="min-w-0 flex-1 truncate text-label font-medium leading-tight desktop:text-dp-23">{loc(r.title, lang)}</span>
                    <span className={`shrink-0 whitespace-nowrap text-caption ${owned ? 'text-(--accent)' : 'text-(--muted)'}`}>
                      {owned ? `✓ ${ui.reformsPanel.adopted}` : locked ? ui.reformsPanel.lockedShort : cost(r)}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Detail. */}
        {selected && renderDetail(selected, activeBranch)}
      </div>

      <VectorPanel vector={state.vector} trail={vectorTrail} previewShift={previewShift} />
    </div>
  );

  function renderDetail(r: Reform, branch: Branch) {
    const reason = canBuyReformReason(state!, content!, r.id);
    const owned = reason === 'owned';
    const line = reasonLine(reason, ui);
    return (
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-sp-1 desktop:gap-dp-16 desktop:pl-dp-20 desktop:pt-dp-6">
        {/* Text scrolls; «Принять» stays pinned below it. */}
        <div className="flex min-h-0 flex-col gap-1 overflow-y-auto desktop:gap-dp-16">
          <p className="eyebrow truncate">
            {ui.reformsPanel.tier} {r.tier + 1} · {ui.branches[branch]}
          </p>
          <h3 className="font-serif text-heading leading-[1.05] desktop:text-dp-52">{loc(r.title, lang)}</h3>
          <p className="flavor text-caption desktop:max-w-dp-640 desktop:text-dp-24">{loc(r.description, lang)}</p>
          <dl className="mt-0.5 flex flex-col text-caption desktop:grid desktop:grid-cols-[calc(var(--dp)*200)_1fr] desktop:gap-x-dp-24 desktop:gap-y-dp-14 desktop:text-dp-19">
            <DetailRow label={ui.reformsPanel.cost}>{cost(r)}</DetailRow>
            <DetailRow label={ui.reformsPanel.effectsInstant}>
              <EffectInline effects={r.instant} ui={ui} lang={lang} />
            </DetailRow>
            {r.perTurn.length > 0 && (
              <DetailRow label={ui.reformsPanel.effectsPerMonth}>
                <EffectInline effects={r.perTurn} ui={ui} lang={lang} />
              </DetailRow>
            )}
          </dl>
        </div>
        <div className="shrink-0">
          {owned ? (
            <span className="stamp stamp-accent text-caption">{ui.reformsPanel.adopted}</span>
          ) : (
            <>
              <button type="button" className="btn btn-primary min-h-9 w-full text-label desktop:w-dp-320" disabled={reason !== null} onClick={() => buyReform(r.id)}>
                {ui.reformsPanel.approve}
              </button>
              {line && <p className="mt-1 text-center text-caption text-(--warning)">{line}</p>}
            </>
          )}
        </div>
      </div>
    );
  }
}

function DetailRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    // Desktop: the row dissolves into the parent 200 / 1fr grid (label column, value column).
    <div className="flex items-baseline gap-sp-2 py-1 desktop:contents">
      <dt className="shrink-0 text-(--muted)">{label}</dt>
      <dd className="ml-auto text-right desktop:ml-0 desktop:text-left">{children}</dd>
    </div>
  );
}
