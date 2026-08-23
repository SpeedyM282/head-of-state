import type { Difficulty } from '../../core/types';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5 L7 10 L12 15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10.5 L8 14.5 L16 5.5" />
    </svg>
  );
}

/**
 * Between the main menu and the map: pick Easy/Medium/Hard on its own screen instead of inline
 * in the country dossier (see MapScreen/CountryDossier, and ARCHITECTURE.md) — the dossier now
 * only ever offers one action, "Choose [this country]", not a second, unrelated choice bundled
 * into the same panel. The picked value lives in the store (`pendingDifficulty`), not local
 * state, so it survives the phase change to 'map' and back if the player returns here via Esc/
 * the back chevron and changes their mind before actually picking a country.
 */
export function DifficultyScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
  const goToMap = useGameStore((s) => s.goToMap);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);
  const setPendingDifficulty = useGameStore((s) => s.setPendingDifficulty);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-3 p-sp-3">
      <div className="flex shrink-0 items-center gap-sp-3 border-b border-(--ink) pb-sp-1">
        <button
          type="button"
          onClick={toMenu}
          aria-label={ui.gameOver.toMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-(--paper-line) hover:bg-(--paper-dim)"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-heading font-bold">{ui.difficulty.title}</h1>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-sp-2 overflow-y-auto">
        {DIFFICULTY_ORDER.map((d) => {
          const active = d === pendingDifficulty;
          return (
            <button
              key={d}
              type="button"
              aria-pressed={active}
              className={`lang-row${active ? ' active' : ''}`}
              onClick={() => setPendingDifficulty(d)}
            >
              <span className="flex flex-1 flex-col gap-sp-1 py-sp-1 text-left">
                <span className="text-label font-bold">{ui.menu.difficulties[d].name}</span>
                <span className="text-caption opacity-70">{ui.menu.difficulties[d].tagline}</span>
              </span>
              {active && <CheckIcon />}
            </button>
          );
        })}
      </div>

      <button type="button" className="btn btn-primary min-h-11 w-full shrink-0 text-label" onClick={goToMap}>
        {ui.difficulty.next}
      </button>
    </div>
  );
}
