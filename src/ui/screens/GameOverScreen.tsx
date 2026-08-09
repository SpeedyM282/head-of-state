import { vectorZone } from '../../core';
import { victoryRankKey } from '../../i18n';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function GameOverScreen() {
  const { state, toMenu, startGame, content } = useGameStore();
  const ui = useUi();
  if (!state?.outcome || !content) return null;
  const o = state.outcome;

  const avg =
    Object.values(state.stats).reduce((a, b) => a + b, 0) / Object.values(state.stats).length;
  const copy =
    o.result === 'victory'
      ? ui.victory[victoryRankKey(avg, vectorZone(state.vector))]
      : ui.defeat[o.defeat!];

  return (
    <div className="flex min-h-[80dvh] flex-col items-center justify-center gap-6 text-center">
      <span className="stamp text-xl">
        {o.result === 'victory' ? ui.gameOver.stampVictory : ui.gameOver.stampDefeat}
      </span>
      <div>
        <h1 className="text-3xl font-bold">{copy.title}</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed opacity-80">{copy.text}</p>
      </div>
      <p className="eyebrow">
        {ui.gameOver.survived}: <span className="num text-sm">{o.turn}</span>
      </p>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <button className="btn btn-primary" onClick={() => startGame(content.difficulty.id)}>
          {ui.gameOver.playAgain}
        </button>
        <button className="btn" onClick={toMenu}>
          {ui.gameOver.toMenu}
        </button>
      </div>
    </div>
  );
}
