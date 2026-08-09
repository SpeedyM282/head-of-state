import { gameDate, loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function EventModal() {
  const { state, content, answerEvent } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  if (!state?.pendingEventId || !content) return null;
  const event = content.events.find((e) => e.id === state.pendingEventId);
  if (!event) return null;
  const { month, year } = gameDate(state.turn, ui);
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
      <div className="panel w-full max-w-[600px] p-4">
        <p className="eyebrow mb-1">{ui.event.dispatch} · {month} {year}</p>
        <h2 className="text-xl font-bold">{loc(event.title, lang)}</h2>
        <p className="mt-2 text-sm leading-relaxed">{loc(event.text, lang)}</p>
        <div className="mt-4 flex flex-col gap-2">
          {event.options.map((opt, i) => (
            <button key={i} className="btn text-left text-sm" onClick={() => answerEvent(i)}>
              {loc(opt.text, lang)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
