import { vectorZone } from '../../core';
import { victoryRankKey } from '../../i18n';
import { averageGoodness } from '../../data/statMeta';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { CmykNumeral } from '../components/CmykNumeral';

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
    <div className="flex min-h-0 flex-1 flex-col justify-between gap-sp-2 p-sp-3">
      <div className="text-center">
        <p className="eyebrow">{ui.gameOver.kicker}</p>
        <div className="mt-sp-1 h-[3px] bg-(--ink)" />
      </div>

      <div className="flex flex-1 items-center gap-sp-5">
        <div className="min-w-0 flex-1">
          <span className="stamp text-label">
            {o.result === 'victory' ? ui.gameOver.stampVictory : ui.gameOver.stampDefeat}
          </span>
          <h1 className="mt-sp-2 text-display font-bold leading-none">{copy.title}</h1>
          <p className="mt-sp-2 text-body leading-relaxed opacity-[0.78]">{copy.text}</p>
        </div>

        <div className="flex w-[214px] shrink-0 flex-col items-center gap-sp-1 border-l border-(--paper-line) pl-sp-4">
          <p className="eyebrow self-start">{ui.gameOver.survived}</p>
          <CmykNumeral
            value={o.turn}
            className="font-bold leading-[0.85]"
            style={{ fontSize: 'clamp(3.25rem, calc(3.25rem + 18 * (100vw - 640px) / 640), 4.25rem)' }}
          />
          <div className="mt-sp-2 flex w-full flex-col gap-sp-1">
            <button className="btn btn-primary min-h-10 text-label" onClick={() => startGame(content.country.id, content.difficulty.id)}>
              {ui.gameOver.playAgain}
            </button>
            <button className="btn btn-secondary min-h-9 text-label" onClick={toMenu}>
              {ui.gameOver.toMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
