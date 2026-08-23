import { useLayoutEffect, useRef } from 'react';
import type { StatKey } from '../../core/types';
import { useUi } from '../../store/langStore';

const STAT_KEYS: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

export type HelpSection = 'stats' | 'vector' | 'elections' | 'defeats' | 'reforms';

function CrossIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <path d="M5 5 L15 15 M15 5 L5 15" />
    </svg>
  );
}

/**
 * Settings' "Справка" — a static reference over already-localized ui strings (not the GDD
 * directly), for a player who wants to re-read the rules mid-game without replaying the
 * scripted tutorial. Same full-screen panel shell as ReformsPanel/EventModal.
 *
 * `initialSection`, when set, scrolls straight to that section on open — Settings' four
 * reference-topic buttons all open this same modal, so without it every one of them landed on
 * an identical view (the top of the whole list) regardless of which topic was actually clicked.
 */
export function HelpModal({ onClose, initialSection }: { onClose: () => void; initialSection?: HelpSection }) {
  const ui = useUi();
  const scrollRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<Partial<Record<HelpSection, HTMLElement | null>>>({});

  // Runs once on mount (a fresh HelpModal instance per open — see SettingsScreen) before paint,
  // so the jump to section is never visible as a scroll animation.
  useLayoutEffect(() => {
    if (!initialSection) return;
    const el = sectionRefs.current[initialSection];
    const container = scrollRef.current;
    if (el && container) container.scrollTop = el.offsetTop;
  }, [initialSection]);

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-sp-3" role="dialog" aria-modal="true">
      <div className="panel flex max-h-[90dvh] w-full max-w-150 flex-col p-sp-3">
        <div className="mb-sp-2 flex shrink-0 items-center justify-between gap-sp-2">
          <h2 className="text-heading font-bold">{ui.help.title}</h2>
          <button
            type="button"
            aria-label={ui.help.close}
            onClick={onClose}
            className="flex h-11 w-11 shrink-0 items-center justify-center hover:bg-(--paper-dim) desktop:h-8 desktop:w-8"
          >
            <CrossIcon />
          </button>
        </div>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto text-body leading-relaxed">
          <section
            ref={(el) => {
              sectionRefs.current.stats = el;
            }}
            className="mb-sp-3"
          >
            <p className="eyebrow">{ui.help.stats.heading}</p>
            <ul className="mt-sp-1 flex flex-col gap-sp-1">
              {STAT_KEYS.map((k) => (
                <li key={k}>
                  <span className="font-bold">{ui.stats[k]}</span> — {ui.help.stats[k]}
                </li>
              ))}
            </ul>
          </section>

          <section
            ref={(el) => {
              sectionRefs.current.vector = el;
            }}
            className="mb-sp-3"
          >
            <p className="eyebrow">{ui.help.vector.heading}</p>
            <ul className="mt-sp-1 flex flex-col gap-sp-1">
              <li>
                <span className="font-bold">{ui.vector.scale.democracy}</span> — {ui.help.vector.democratic}
              </li>
              <li>
                <span className="font-bold">{ui.vector.scale.authoritarianism}</span> — {ui.help.vector.authoritarian}
              </li>
              <li>
                <span className="font-bold">{ui.vector.scale.totalitarianism}</span> — {ui.help.vector.totalitarian}
              </li>
            </ul>
          </section>

          <section
            ref={(el) => {
              sectionRefs.current.elections = el;
            }}
            className="mb-sp-3"
          >
            <p className="eyebrow">{ui.help.elections.heading}</p>
            <p className="mt-sp-1">{ui.help.elections.text}</p>
          </section>

          <section
            ref={(el) => {
              sectionRefs.current.defeats = el;
            }}
            className="mb-sp-3"
          >
            <p className="eyebrow">{ui.help.defeats.heading}</p>
            <ul className="mt-sp-1 flex flex-col gap-sp-1">
              <li>{ui.help.defeats.coup}</li>
              <li>{ui.help.defeats.revolution}</li>
              <li>{ui.help.defeats.default}</li>
              <li>{ui.help.defeats.elections}</li>
            </ul>
          </section>

          <section
            ref={(el) => {
              sectionRefs.current.reforms = el;
            }}
          >
            <p className="eyebrow">{ui.help.reforms.heading}</p>
            <p className="mt-sp-1">{ui.help.reforms.text}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
