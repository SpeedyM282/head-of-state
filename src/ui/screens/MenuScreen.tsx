import { useState, type ReactNode } from 'react';
import { loc } from '../../i18n';
import { getCountryById } from '../../data/countries';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { useMedalStore } from '../../store/medalStore';
import { MEDALS } from '../../data/medals';
import { format } from '../../i18n';
import { toRoman } from '../roman';

export function MenuScreen() {
  const { goToDifficulty, goToSettings, goToMedals, continueGame, savedGame, startGame } = useGameStore();
  const earnedCount = useMedalStore((s) => s.earned.length);
  const tutorialCompleted = useTutorialStore((s) => s.completed);
  const skipTutorial = useTutorialStore((s) => s.skip);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const lang = useLang((s) => s.lang);
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);

  // First-ever "Новая игра": offer the guided opening before the player picks a country. Once
  // the tutorial has been completed (or explicitly skipped once), this goes to the difficulty
  // picker first, then the map.
  function handlePlay() {
    if (tutorialCompleted) goToDifficulty();
    else setShowTutorialPrompt(true);
  }

  function startTutorial() {
    setShowTutorialPrompt(false);
    startGame('absurdistan', 'easy');
    beginScripted();
  }

  function declineTutorial() {
    setShowTutorialPrompt(false);
    skipTutorial();
    goToDifficulty();
  }

  const continueValue = savedGame
    ? `${loc(getCountryById(savedGame.countryId).name, lang)}, ${ui.menu.termShort} ${toRoman(savedGame.term)}`
    : null;

  return (
    // «Кабинет» menu (handoff screen 01): title block on the left, a ruled menu list on the
    // right, footer pinned bottom-left. The right column takes a fixed width; extra width on
    // wider screens goes to the gap between the columns, never to the text.
    <div className="flex min-h-0 flex-1 gap-sp-5 px-sp-6 py-sp-4">
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="eyebrow">{ui.menu.kicker}</p>
        <h1
          className="mt-sp-5 font-serif font-light"
          // The menu title is the one display size above --text-display (46pt on the 640pt
          // canvas); a one-off clamp rather than a seventh global role.
          style={{ fontSize: 'clamp(2.875rem, calc(2.875rem + 14 * (100vw - 640px) / 640), 3.75rem)', lineHeight: 1 }}
        >
          {ui.menu.title[0]}
          <br />
          {ui.menu.title[1]}
        </h1>
        <p className="flavor mt-sp-4 max-w-[280px] text-label">{ui.menu.subtitle}</p>
        <p className="mt-auto pt-sp-3 text-caption text-(--muted)">{ui.menu.footer}</p>
      </div>

      <nav className="flex w-[240px] shrink-0 flex-col justify-center">
        <div className="flex flex-col">
          <MenuRow onClick={handlePlay} accent trailing={<span className="nudge inline-block" aria-hidden>→</span>}>
            {ui.menu.newGame}
          </MenuRow>
          {continueValue && (
            <MenuRow onClick={continueGame} trailing={<span className="min-w-0 text-right text-caption text-(--muted)">{continueValue}</span>}>
              {ui.menu.continue}
            </MenuRow>
          )}
          <MenuRow onClick={goToMedals} trailing={<span className="text-caption text-(--muted)">{format(ui.medals.count, { n: earnedCount, total: MEDALS.length })}</span>}>
            {ui.medals.title}
          </MenuRow>
          <MenuRow onClick={goToSettings}>{ui.settings.title}</MenuRow>
        </div>
      </nav>

      {showTutorialPrompt && (
        <div className="scrim fixed inset-0 z-30 flex items-center justify-center p-sp-3" role="dialog" aria-modal="true">
          <div className="dialog w-full max-w-xs p-sp-4">
            <p className="font-serif text-heading leading-tight">{ui.tutorial.prompt.title}</p>
            <div className="mt-sp-4 flex flex-col gap-sp-2">
              <button type="button" className="btn btn-primary min-h-11 text-label" onClick={startTutorial}>
                {ui.tutorial.prompt.start}
              </button>
              <button type="button" className="btn btn-secondary min-h-11 text-label" onClick={declineTutorial}>
                {ui.tutorial.prompt.skip}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** One menu-list row: label left, optional trailing value/glyph right. Rows separate by spacing,
 * not rules (handoff → Lines). */
function MenuRow({ children, onClick, trailing, accent }: { children: ReactNode; onClick: () => void; trailing?: ReactNode; accent?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`press flex min-h-11 w-full items-center justify-between gap-sp-2 py-sp-3 text-left text-label font-medium ${accent ? 'text-(--accent)' : ''}`}
    >
      <span className="whitespace-nowrap">{children}</span>
      {trailing}
    </button>
  );
}
