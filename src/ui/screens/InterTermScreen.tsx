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
    <div className="flex min-h-0 flex-1 flex-row items-center justify-center gap-6 text-center tablet:flex-col tablet:gap-6">
      <div className="min-w-0 max-w-[19rem] tablet:max-w-sm">
        <span className="stamp text-sm tablet:text-xl">{ui.interTerm.stamp}</span>
        <h1 className="mt-2 text-lg font-bold tablet:mt-3 tablet:text-3xl">{ui.main.term} {state.term}</h1>
        <p className="mt-2 text-xs leading-relaxed opacity-80 tablet:text-sm">{ui.interTerm.flavor}</p>
      </div>
      <div className="flex w-full max-w-[240px] shrink-0 flex-col gap-2 tablet:max-w-xs">
        <div className="panel max-h-[40dvh] overflow-y-auto p-2 text-left tablet:max-h-none tablet:p-3">
          {STAT_ORDER.map((k) => (
            <div key={k} className="flex items-center justify-between gap-2 py-0.5 text-sm">
              <span className="text-(--text-faint)">{ui.stats[k]}</span>
              <span className="num">{Math.round(state.stats[k])}</span>
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
