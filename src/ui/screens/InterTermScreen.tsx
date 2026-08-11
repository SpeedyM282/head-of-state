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
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-6 text-center">
      <span className="stamp text-xl">{ui.interTerm.stamp}</span>
      <div>
        <h1 className="text-3xl font-bold">{ui.main.term} {state.term}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed opacity-80">{ui.interTerm.flavor}</p>
      </div>
      <div className="panel w-full max-w-xs p-3 text-left">
        {STAT_ORDER.map((k) => (
          <div key={k} className="flex items-center justify-between gap-2 py-0.5 text-sm">
            <span className="text-(--text-faint)">{ui.stats[k]}</span>
            <span className="num">{Math.round(state.stats[k])}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-primary w-full max-w-xs" onClick={inaugurate}>
        {ui.interTerm.continue}
      </button>
    </div>
  );
}
