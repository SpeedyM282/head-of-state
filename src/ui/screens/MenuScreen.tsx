import { useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';

export function MenuScreen() {
  const { goToDifficulty, goToSettings, continueGame, hasSave, startGame } = useGameStore();
  const tutorialCompleted = useTutorialStore((s) => s.completed);
  const skipTutorial = useTutorialStore((s) => s.skip);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);

  // First-ever "Играть": offer the guided opening before the player picks a country. Once the
  // tutorial has been completed (or explicitly skipped once), this goes to the difficulty
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

  return (
    // The gazette front page: masthead pinned top, subtitle+buttons pinned bottom, exactly
    // as the 640×360 mock lays it out — this reads fine at every form factor as-is (fluid
    // tokens grow the type/spacing), so unlike other screens there's no separate phone-
    // landscape-vs-tablet structure here, just one column that gets more air.
    <div className="flex min-h-0 flex-1 flex-col justify-between py-sp-2">
      <div className="text-center">
        <p className="eyebrow">{ui.menu.kicker}</p>
        <div className="mt-sp-1 h-[3px] bg-(--ink)" />
        <h1
          className="mt-sp-1 font-bold uppercase tracking-[0.04em]"
          style={{
            fontSize: 'clamp(2.5rem, calc(2.5rem + 14 * (100vw - 640px) / 640), 3.375rem)',
            lineHeight: 0.95,
          }}
        >
          {ui.menu.title}
        </h1>
        <div className="mt-sp-1 flex items-stretch justify-center gap-0 border-y border-(--ink) py-sp-1 text-caption uppercase opacity-60">
          <span className="px-sp-2">{ui.menu.colophon.price}</span>
          <span className="border-x border-(--paper-line) px-sp-2">{ui.menu.colophon.print}</span>
          <span className="px-sp-2">{ui.menu.colophon.number}</span>
        </div>
      </div>

      <div className="flex items-end gap-sp-5">
        <p className="flex-1 text-label italic leading-snug opacity-[0.78]">{ui.menu.subtitle}</p>
        <div className="flex w-[214px] shrink-0 flex-col gap-sp-1">
          {hasSave && (
            <button className="btn btn-primary min-h-11 text-label" onClick={continueGame}>
              {ui.menu.continue}
            </button>
          )}
          <button className="btn btn-secondary min-h-11 text-label" onClick={handlePlay}>
            {ui.map.playCta}
          </button>
          <button className="btn btn-ghost min-h-10 text-label" onClick={goToSettings}>
            {ui.settings.title}
          </button>
        </div>
      </div>

      {showTutorialPrompt && (
        <div
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-sp-3"
          role="dialog"
          aria-modal="true"
        >
          <div className="panel w-full max-w-xs p-sp-4 text-center">
            <p className="text-heading font-bold">{ui.tutorial.prompt.title}</p>
            <div className="mt-sp-4 flex flex-col gap-sp-2">
              <button type="button" className="btn btn-primary min-h-11" onClick={startTutorial}>
                {ui.tutorial.prompt.start}
              </button>
              <button type="button" className="btn min-h-11" onClick={declineTutorial}>
                {ui.tutorial.prompt.skip}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
