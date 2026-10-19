import type { Difficulty } from '../../core/types';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { TopBar } from '../components/TopBar';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

/**
 * Between the main menu and the map: pick Easy/Medium/Hard on its own screen instead of inline
 * in the country dossier (see MapScreen/CountryDossier, and ARCHITECTURE.md) — the dossier now
 * only ever offers one action, "Choose [this country]", not a second, unrelated choice bundled
 * into the same panel. The picked value lives in the store (`pendingDifficulty`), not local
 * state, so it survives the phase change to 'map' and back if the player returns here via Esc/
 * the back button and changes their mind before actually picking a country.
 *
 * Not in the «Кабинет» handoff; styled like Settings → Язык (top bar + choice rows).
 */
export function DifficultyScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
  const goToMap = useGameStore((s) => s.goToMap);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);
  const setPendingDifficulty = useGameStore((s) => s.setPendingDifficulty);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-4 px-sp-5 py-sp-3">
      <TopBar title={ui.difficulty.title} onBack={toMenu} backLabel={ui.gameOver.toMenu} />

      <div className="flex min-h-0 flex-1 items-start gap-sp-5 overflow-y-auto">
        <div className="flex w-[300px] shrink-0 flex-col gap-sp-1">
          {DIFFICULTY_ORDER.map((d) => {
            const active = d === pendingDifficulty;
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active}
                className={`choice-row press${active ? ' active' : ''}`}
                onClick={() => setPendingDifficulty(d)}
              >
                <span className="flex flex-1 flex-col py-sp-1 text-left">
                  <span className="text-label">{ui.menu.difficulties[d].name}</span>
                  <span className="text-caption font-normal text-(--muted)">{ui.menu.difficulties[d].tagline}</span>
                </span>
                {active && <span aria-hidden>✓</span>}
              </button>
            );
          })}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-end self-stretch">
          <button type="button" className="btn btn-primary min-h-11 self-end text-label" onClick={goToMap}>
            {ui.difficulty.next}
          </button>
        </div>
      </div>
    </div>
  );
}
