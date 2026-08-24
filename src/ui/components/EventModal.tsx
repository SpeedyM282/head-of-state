import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { EffectSummaryLine } from '../effectFormat';

export function EventModal() {
  const { state, content, answerEvent } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const scriptedStep = useTutorialStore((s) => s.scriptedStep);
  const activeTipId = useTutorialStore((s) => s.activeTipId);
  // The tutorial overlay (scripted steps or a one-time tip) takes priority — its "first event"
  // tip is intentionally shown while an event is pending (see tutorial/content.ts), so this
  // modal must step aside rather than stack underneath the advisor overlay.
  if (scriptedStep || activeTipId) return null;
  if (!state?.pendingEventId || !content) return null;
  const event = content.events.find((e) => e.id === state.pendingEventId);
  if (!event) return null;
  // Odd option counts (most commonly 3) get their last option spread across both columns of
  // the phone-landscape 2-column grid, instead of leaving one cell empty.
  const lastOptionSpans = event.options.length % 2 === 1;

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-(--ink)/55 p-sp-3" role="dialog" aria-modal="true">
      <div className="panel flex max-h-[90dvh] w-full max-w-[27.5rem] flex-col border-(--ink) p-sp-3 shadow-lg">
        {/* Text scrolls internally if it's long; the options below stay pinned and visible. */}
        <div className="min-h-0 overflow-y-auto">
          <h2 className="text-heading font-bold short:text-body">{loc(event.title, lang)}</h2>
          <p className="mt-sp-2 text-body leading-relaxed short:text-label">{loc(event.text, lang)}</p>
        </div>
        <div className="mt-sp-2 grid shrink-0 grid-cols-2 gap-sp-2">
          {event.options.map((opt, i) => (
            <button
              key={i}
              className={`btn btn-secondary flex min-h-11 flex-col items-center gap-0.5 text-center text-label ${lastOptionSpans && i === event.options.length - 1 ? 'col-span-2' : ''}`}
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
