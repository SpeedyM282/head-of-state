import type { Difficulty } from '../../core/types';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

export function MenuScreen() {
  const { startGame, continueGame, hasSave } = useGameStore();
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
        {DIFFICULTY_ORDER.map((d) => (
          <button key={d} className="btn" onClick={() => startGame(d)}>
            {ui.menu.difficulties[d].name} — «{ui.menu.difficulties[d].tagline}»
          </button>
        ))}
      </div>
    </div>
  );
}
