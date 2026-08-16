import { vectorZone } from '../../core';
import { victoryRankKey } from '../../i18n';
import { averageGoodness } from '../../data/statMeta';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function GameOverScreen() {
  const { state, toMenu, startGame, content } = useGameStore();
  const ui = useUi();
  if (!state?.outcome || !content) return null;
  const o = state.outcome;

  const avg = averageGoodness(state.stats);
  const copy =
    o.result === 'victory'
      ? ui.victory[victoryRankKey(avg, vectorZone(state.vector))]
      : ui.defeat[o.defeat!];

  return (
    <div className="flex min-h-0 flex-1 flex-row items-center justify-center gap-6 text-center tablet:flex-col tablet:gap-6">
      <div className="min-w-0 max-w-[19rem] tablet:max-w-sm">
        <span className="stamp text-sm tablet:text-xl">
          {o.result === 'victory' ? ui.gameOver.stampVictory : ui.gameOver.stampDefeat}
        </span>
        <h1 className="mt-2 text-lg font-bold tablet:mt-3 tablet:text-3xl">{copy.title}</h1>
        <p className="mt-2 text-xs leading-relaxed opacity-80 tablet:text-sm">{copy.text}</p>
      </div>
      <div className="flex w-full max-w-[220px] shrink-0 flex-col gap-2 tablet:max-w-xs">
        <p className="eyebrow">
          {ui.gameOver.survived}: <span className="num text-sm">{o.turn}</span>
        </p>
        <button className="btn btn-primary min-h-11" onClick={() => startGame(content.country.id, content.difficulty.id)}>
          {ui.gameOver.playAgain}
        </button>
        <button className="btn min-h-11" onClick={toMenu}>
          {ui.gameOver.toMenu}
        </button>
      </div>
    </div>
  );
}
