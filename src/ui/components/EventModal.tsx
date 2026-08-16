import { gameDate, loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { EffectSummaryLine } from '../effectFormat';

export function EventModal() {
  const { state, content, answerEvent } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  if (!state?.pendingEventId || !content) return null;
  const event = content.events.find((e) => e.id === state.pendingEventId);
  if (!event) return null;
  const { month, year } = gameDate(state.turn, ui);
  // Odd option counts (most commonly 3) get their last option spread across both columns of
  // the phone-landscape 2-column grid, instead of leaving one cell empty.
  const lastOptionSpans = event.options.length % 2 === 1;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-3 tablet:p-4" role="dialog" aria-modal="true">
      <div className="panel flex max-h-[90dvh] w-full max-w-150 flex-col p-3 tablet:p-4">
        {/* Text scrolls internally if it's long; the options below stay pinned and visible. */}
        <div className="min-h-0 overflow-y-auto">
          <p className="eyebrow mb-1">{ui.event.dispatch} · {month} {year}</p>
          <h2 className="text-lg font-bold tablet:text-xl">{loc(event.title, lang)}</h2>
          <p className="mt-2 text-sm leading-relaxed">{loc(event.text, lang)}</p>
        </div>
        <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 tablet:mt-4 tablet:grid-cols-1">
          {event.options.map((opt, i) => (
            <button
              key={i}
              className={`btn min-h-11 text-left text-sm ${lastOptionSpans && i === event.options.length - 1 ? 'col-span-2 tablet:col-span-1' : ''}`}
              onClick={() => answerEvent(i)}
            >
              <span className="block">{loc(opt.text, lang)}</span>
              <EffectSummaryLine effects={opt.effects} ui={ui} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
