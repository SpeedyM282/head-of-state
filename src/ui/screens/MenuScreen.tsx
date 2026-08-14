import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function MenuScreen() {
  const { goToMap, goToSettings, continueGame, hasSave } = useGameStore();
  const ui = useUi();
  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-8 text-center">
      <div>
        <p className="eyebrow mb-3">{ui.menu.eyebrow}</p>
        <h1 className="text-5xl font-bold tracking-wide">{ui.menu.title}</h1>
        <p className="mt-3 text-sm opacity-70">{ui.menu.subtitle}</p>
      </div>
      <span className="stamp text-lg">{ui.menu.stamp}</span>
      <div className="flex w-full max-w-xs flex-col gap-2">
        {hasSave && (
          <button className="btn btn-primary" onClick={continueGame}>
            {ui.menu.continue}
          </button>
        )}
        <button className="btn" onClick={goToMap}>
          {ui.map.playCta}
        </button>
        <button className="btn text-sm opacity-80" onClick={goToSettings}>
          {ui.settings.title}
        </button>
      </div>
    </div>
  );
}
