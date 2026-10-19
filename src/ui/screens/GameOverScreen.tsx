import { vectorZone } from '../../core';
import { victoryRankKey } from '../../i18n';
import { averageGoodness } from '../../data/statMeta';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useCountUp } from '../hooks/useCountUp';
import { useMedalStore } from '../../store/medalStore';
import { MEDALS } from '../../data/medals';
import { loc } from '../../i18n';
import { useLang } from '../../store/langStore';

export function GameOverScreen() {
  const { state, toMenu, startGame, content } = useGameStore();
  const ui = useUi();
  const months = useCountUp(state?.outcome?.turn ?? 0);
  const lang = useLang((s) => s.lang);
  const newMedals = useMedalStore((s) => s.earnedThisGame);
  if (!state?.outcome || !content) return null;
  const o = state.outcome;

  const avg = averageGoodness(state.stats);
  const copy =
    o.result === 'victory'
      ? ui.victory[victoryRankKey(avg, vectorZone(state.vector))]
      : ui.defeat[o.defeat!];

  return (
    // «Кабинет» term summary (handoff screen 06): verdict on the left, months-in-power and the
    // actions in a ruled right column.
    <div className="flex min-h-0 flex-1 flex-col gap-sp-3 px-sp-6 py-sp-4">
      <p className="eyebrow shrink-0">{ui.gameOver.kicker}</p>

      <div className="flex min-h-0 flex-1 items-center gap-sp-5">
        <div className="min-w-0 flex-1">
          <span className="stamp thump text-caption">
            {o.result === 'victory' ? ui.gameOver.stampVictory : ui.gameOver.stampDefeat}
          </span>
          <h1
            className="mt-sp-4 font-serif font-light"
            // Verdict is a one-off size between --text-display and the menu title (40pt on the
            // 640pt canvas).
            style={{ fontSize: 'clamp(2.5rem, calc(2.5rem + 12 * (100vw - 640px) / 640), 3.25rem)', lineHeight: 1 }}
          >
            {copy.title}
          </h1>
          <p className="flavor mt-sp-3 max-w-[340px] text-label">{copy.text}</p>
          {newMedals.length > 0 && (
            <p className="mt-sp-3 max-w-[360px] text-caption text-(--muted)">
              {ui.medals.newOnGameOver}{' '}
              <span className="text-(--text)">
                {newMedals
                  .map((id) => MEDALS.find((m) => m.id === id))
                  .flatMap((m) => (m ? [`«${loc(m.name, lang)}»`] : []))
                  .join(', ')}
              </span>
            </p>
          )}
        </div>

        <div className="flex w-[200px] shrink-0 flex-col gap-sp-1 self-stretch border-l border-(--line) pl-sp-4 justify-center">
          <p className="eyebrow">{ui.gameOver.survived}</p>
          <p
            className="num font-light tabular-nums"
            // Hero number (72pt on the canvas) — far above any type role.
            style={{ fontSize: 'clamp(4.5rem, calc(4.5rem + 16 * (100vw - 640px) / 640), 5.5rem)', lineHeight: 1 }}
          >
            {months}
          </p>
          <div className="mt-sp-2 flex flex-col gap-sp-1">
            <button className="btn btn-primary min-h-11 text-label" onClick={() => startGame(content.country.id, content.difficulty.id)}>
              {ui.gameOver.playAgain}
            </button>
            <button className="btn btn-secondary min-h-11 text-label" onClick={toMenu}>
              {ui.gameOver.toMenu}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
