import { useEffect, useRef } from 'react';
import { MEDALS } from '../../data/medals';
import { format, loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useMedalStore } from '../../store/medalStore';
import { TopBar } from '../components/TopBar';
import { MedalArt, hasMedalArt } from '../components/MedalArt';

/**
 * «Кабинет» medals (handoff screen 11): a four-column grid of every medal — earned ones as an
 * accent ring with a filled disc, locked ones as a dashed muted ring. Medals earned since the
 * last visit emit a halo for a few cycles; leaving the screen marks them seen.
 */
export function MedalsScreen() {
  const ui = useUi();
  const lang = useLang((s) => s.lang);
  const toMenu = useGameStore((s) => s.toMenu);
  const earned = useMedalStore((s) => s.earned);
  const markAllSeen = useMedalStore((s) => s.markAllSeen);
  // Snapshot of the unseen set on entry, so the halos keep running while the screen is open
  // even though the store is told they've been seen when it closes.
  const unseenOnEntry = useRef(useMedalStore.getState().unseen);

  useEffect(() => () => markAllSeen(), [markAllSeen]);

  // Esc mirrors the back button.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') toMenu();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [toMenu]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-4 px-sp-5 py-sp-3 desktop:gap-dp-86 desktop:pt-sp-4">
      <TopBar
        title={ui.medals.title}
        onBack={toMenu}
        backLabel={ui.gameOver.toMenu}
        meta={format(ui.medals.meta, { n: earned.length, total: MEDALS.length })}
      />
      <ul className="grid min-h-0 flex-1 grid-cols-4 content-start gap-x-sp-4 gap-y-sp-4 overflow-y-auto pb-sp-2 desktop:gap-x-dp-72 desktop:gap-y-dp-48">
        {MEDALS.map((m) => {
          const has = earned.includes(m.id);
          const isNew = has && unseenOnEntry.current.includes(m.id);
          return (
            // Mobile: circle over name over condition. Desktop: a row — 88px circle, then the text.
            <li key={m.id} className="flex flex-col items-start gap-1.5 desktop:flex-row desktop:items-center desktop:gap-dp-22">
              {hasMedalArt(m.id) ? (
                // Handoff artwork, 2:3 — ~54px tall on phones, 150 on desktop.
                <span className="relative shrink-0 text-(--accent)" aria-label={has ? undefined : ui.medals.locked}>
                  <MedalArt medalId={m.id} earned={has} className="h-[54px] w-9 desktop:h-dp-150 desktop:w-dp-100" />
                  {isNew && <span className="halo medal-halo medal-art-halo" aria-hidden />}
                </span>
              ) : (
                <span
                  className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full desktop:size-dp-88 ${has ? 'border-[1.5px] border-(--accent) text-(--accent) desktop:border-3' : 'border border-dashed border-(--muted) desktop:border-2'}`}
                  aria-label={has ? undefined : ui.medals.locked}
                >
                  {has && <span className="h-5 w-5 rounded-full bg-(--accent) desktop:size-dp-48" />}
                  {isNew && <span className="halo medal-halo" aria-hidden />}
                </span>
              )}
              <span className="flex min-w-0 flex-col gap-1.5 desktop:gap-dp-8">
                <span className={`text-label font-medium leading-tight desktop:text-dp-22 ${has ? '' : 'text-(--muted)'}`}>{loc(m.name, lang)}</span>
                <span className="text-caption leading-snug text-(--muted)">{loc(m.condition, lang)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
