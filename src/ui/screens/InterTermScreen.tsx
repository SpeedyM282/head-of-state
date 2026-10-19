import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { toRoman } from '../roman';

const STAT_ORDER: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/** Shown after winning re-election: the new term number, a snapshot of the country, and
 * an «Инаугурация» flavor beat before play resumes (stats carry over — nothing is reset).
 * Not in the «Кабинет» handoff; laid out like the term summary (06) — verdict left, a ruled
 * right column with the stats and the action. */
export function InterTermScreen() {
  const { state, inaugurate } = useGameStore();
  const ui = useUi();
  if (!state) return null;
  return (
    <div className="flex min-h-0 flex-1 items-center gap-sp-5 px-sp-6 py-sp-4">
      <div className="min-w-0 flex-1">
        <span className="stamp stamp-accent thump text-caption">{ui.interTerm.stamp}</span>
        <h1 className="mt-sp-4 font-serif text-display font-light leading-none">
          {ui.main.term} {toRoman(state.term)}
        </h1>
        <p className="flavor mt-sp-3 max-w-[340px] text-label">{ui.interTerm.flavor}</p>
      </div>
      <div className="flex w-[220px] shrink-0 flex-col gap-sp-2 self-stretch justify-center border-l border-(--line) pl-sp-4">
        <div className="min-h-0 overflow-y-auto">
          {STAT_ORDER.map((k) => (
            <div key={k} className="flex items-baseline justify-between gap-sp-2 py-0.5">
              <span className={`text-caption ${k === 'corruption' ? 'text-(--warning)' : 'text-(--muted)'}`}>{ui.stats[k]}</span>
              <span className={`num text-num ${k === 'corruption' ? 'text-(--warning)' : ''}`}>{Math.round(state.stats[k])}</span>
            </div>
          ))}
        </div>
        <button className="btn btn-primary min-h-11 w-full text-label" onClick={inaugurate}>
          {ui.interTerm.continue}
        </button>
      </div>
    </div>
  );
}
