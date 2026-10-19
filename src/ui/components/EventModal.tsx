import { useEffect, useState } from 'react';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { EffectInline } from '../effectFormat';

/** How long the «Подписано» stamp shows on the chosen option before the answer applies and the
 * dialog closes (the stamp thump itself is ~0.8s). Zero under reduced motion. */
const SIGN_DELAY_MS = 750;

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * «Кабинет» event dialog (handoff screen 04): kicker «Событие · …», Spectral title, the event
 * text as an italic quote, stacked option rows with their effects on the right, and a footer.
 * Picking an option thumps the «Подписано» stamp onto it, then the answer applies.
 *
 * `onMinimize`: tapping the scrim tucks the event into its map pin (MainScreen); the event
 * stays pending, so the clock stays auto-paused until it is answered.
 */
export function EventModal({ onMinimize }: { onMinimize?: () => void }) {
  const { state, content, answerEvent } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const scriptedStep = useTutorialStore((s) => s.scriptedStep);
  const activeTipId = useTutorialStore((s) => s.activeTipId);
  // The chosen option, keyed by event id so a following event always starts unpicked.
  const [picked, setPicked] = useState<{ eventId: string; index: number } | null>(null);

  const pendingId = state?.pendingEventId ?? null;
  const pickedIndex = picked && picked.eventId === pendingId ? picked.index : null;

  useEffect(() => {
    if (!picked || picked.eventId !== pendingId) return;
    const timer = setTimeout(() => answerEvent(picked.index), prefersReducedMotion() ? 0 : SIGN_DELAY_MS);
    return () => clearTimeout(timer);
  }, [picked, pendingId, answerEvent]);

  // The tutorial overlay (scripted steps or a one-time tip) takes priority — its "first event"
  // tip is intentionally shown while an event is pending (see tutorial/content.ts), so this
  // modal must step aside rather than stack underneath the coach card.
  if (scriptedStep || activeTipId) return null;
  if (!pendingId || !content) return null;
  const event = content.events.find((e) => e.id === pendingId);
  if (!event) return null;

  return (
    <div
      className="scrim fixed inset-0 z-20 flex items-center justify-center p-sp-3"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && pickedIndex === null) onMinimize?.();
      }}
    >
      <div className="dialog flex max-h-[92dvh] w-full max-w-[420px] flex-col gap-sp-2 px-sp-4 py-sp-3 tablet:max-w-[520px] desktop:max-w-dp-840 desktop:gap-dp-16 desktop:px-dp-56 desktop:py-dp-48">
        {/* Text scrolls internally if it's long; the options below stay pinned and visible. */}
        <div className="flex min-h-0 flex-col gap-sp-1 overflow-y-auto">
          <p className="eyebrow">
            {ui.event.kicker} · {ui.event.kinds[event.kind]}
          </p>
          <h2 className="font-serif text-display leading-[1.05] short:text-heading">{loc(event.title, lang)}</h2>
          <p className="flavor text-label short:text-caption desktop:mb-dp-8 desktop:text-dp-26">{loc(event.text, lang)}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-1.5 desktop:gap-dp-12">
          {event.options.map((opt, i) => {
            const chosen = pickedIndex === i;
            return (
              <button
                key={i}
                type="button"
                disabled={pickedIndex !== null}
                className={`option-row relative min-h-10 px-sp-3 py-sp-2 ${chosen ? 'selected' : ''} ${pickedIndex !== null && !chosen ? 'opacity-60' : ''}`}
                onClick={() => setPicked({ eventId: event.id, index: i })}
              >
                {chosen && <span className="halo" aria-hidden />}
                <span className="min-w-0 flex-1 text-label leading-tight desktop:text-dp-22">{loc(opt.text, lang)}</span>
                <span className="max-w-[55%] shrink-0 text-right text-caption font-normal leading-snug text-(--muted)">
                  <EffectInline effects={opt.effects} ui={ui} lang={lang} />
                </span>
                {chosen && (
                  <span className="stamp stamp-accent thump absolute right-[30%] -top-3 bg-(--surface) text-caption desktop:top-[calc(var(--dp)*-18)] desktop:text-dp-15" aria-live="polite">
                    {ui.event.signed}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <p className="shrink-0 text-caption text-(--muted)">{ui.event.footer}</p>
      </div>
    </div>
  );
}
