import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function MenuScreen() {
  const { goToMap, goToSettings, continueGame, hasSave } = useGameStore();
  const ui = useUi();
  return (
    // Phone landscape: title block and button stack sit side by side (the shape landscape
    // gives us), so nothing needs to shrink onto one narrow column. Tablet/desktop revert to
    // the original centered vertical stack, where there's height to spare for it.
    <div className="flex min-h-0 flex-1 flex-row items-center justify-center gap-6 text-center tablet:flex-col tablet:gap-8">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-wide tablet:text-4xl desktop:text-5xl">{ui.menu.title}</h1>
        <p className="mt-1 text-xs opacity-70 tablet:mt-3 tablet:text-sm">{ui.menu.subtitle}</p>
      </div>
      <div className="flex w-full max-w-[220px] shrink-0 flex-col gap-2 tablet:max-w-xs">
        {hasSave && (
          <button className="btn btn-primary min-h-11" onClick={continueGame}>
            {ui.menu.continue}
          </button>
        )}
        <button className="btn min-h-11" onClick={goToMap}>
          {ui.map.playCta}
        </button>
        <button className="btn min-h-11 text-sm opacity-80" onClick={goToSettings}>
          {ui.settings.title}
        </button>
      </div>
    </div>
  );
}
