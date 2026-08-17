import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

const STAT_ORDER: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/** Shown after winning re-election: the new term number, a snapshot of the country, and
 * an «Инаугурация» flavor beat before play resumes (stats carry over — nothing is reset). */
export function InterTermScreen() {
  const { state, inaugurate } = useGameStore();
  const ui = useUi();
  if (!state) return null;
  return (
    <div className="flex min-h-0 flex-1 flex-row items-center justify-center gap-sp-5 text-center tablet:flex-col">
      <div className="min-w-0 max-w-[19rem] tablet:max-w-sm">
        <span className="stamp text-heading">{ui.interTerm.stamp}</span>
        <h1 className="mt-sp-2 text-display font-bold">{ui.main.term} {state.term}</h1>
        <p className="mt-sp-2 text-body leading-relaxed opacity-80">{ui.interTerm.flavor}</p>
      </div>
      <div className="flex w-full max-w-[240px] shrink-0 flex-col gap-sp-2 tablet:max-w-xs">
        <div className="panel max-h-[40dvh] overflow-y-auto p-sp-2 text-left tablet:max-h-none">
          {STAT_ORDER.map((k) => (
            <div key={k} className="flex items-center justify-between gap-sp-2 py-0.5 text-label">
              <span className="text-(--text-faint)">{ui.stats[k]}</span>
              <span className="num text-num">{Math.round(state.stats[k])}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary min-h-11 w-full" onClick={inaugurate}>
          {ui.interTerm.continue}
        </button>
      </div>
    </div>
  );
}
