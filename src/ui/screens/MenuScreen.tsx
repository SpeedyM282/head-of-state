import { useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';

export function MenuScreen() {
  const { goToMap, goToSettings, continueGame, hasSave, startGame } = useGameStore();
  const tutorialCompleted = useTutorialStore((s) => s.completed);
  const skipTutorial = useTutorialStore((s) => s.skip);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const [showTutorialPrompt, setShowTutorialPrompt] = useState(false);

  // First-ever "Играть": offer the guided opening before the player picks a country. Once the
  // tutorial has been completed (or explicitly skipped once), this goes straight to the map.
  function handlePlay() {
    if (tutorialCompleted) goToMap();
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
    goToMap();
  }

  return (
    // Phone landscape: title block and button stack sit side by side (the shape landscape
    // gives us), so nothing needs to shrink onto one narrow column. Tablet/desktop revert to
    // the original centered vertical stack, where there's height to spare for it.
    <div className="flex min-h-0 flex-1 flex-row items-center justify-center gap-sp-5 text-center tablet:flex-col">
      <div className="min-w-0">
        <h1 className="text-display font-bold tracking-wide">{ui.menu.title}</h1>
        <p className="mt-sp-2 text-caption opacity-70">{ui.menu.subtitle}</p>
      </div>
      <div className="flex w-full max-w-[220px] shrink-0 flex-col gap-sp-2 tablet:max-w-xs">
        {hasSave && (
          <button className="btn btn-primary min-h-11" onClick={continueGame}>
            {ui.menu.continue}
          </button>
        )}
        <button className="btn min-h-11" onClick={handlePlay}>
          {ui.map.playCta}
        </button>
        <button className="btn min-h-11 text-label opacity-80" onClick={goToSettings}>
          {ui.settings.title}
        </button>
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
