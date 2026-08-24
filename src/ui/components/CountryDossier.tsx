import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { countries } from '../../data';
import { LevelBar } from './LevelBar';

/** "34,000,000" -> "34 млн"-style abbreviation once a population crosses a million; below
 * that (a handful of small island states), the exact figure is short enough to show as-is.
 * Exported for RegionInfo, which formats the same way for a region's summed population. */
export function formatPopulation(population: number, millionUnit: string): string {
  if (population < 1_000_000) return population.toLocaleString();
  const millions = Math.round((population / 1_000_000) * 10) / 10;
  const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
  return `${text} ${millionUnit}`;
}

interface Props {
  countryId: string;
}

/**
 * Map screen's inline country dossier — docked to the right of the map pane as a permanent
 * column (see MapScreen), not a floating overlay. Was CountryDrawer (a slide-in panel with its
 * own backdrop/swipe-to-dismiss); the redesign's 184px-wide rail sits in the map's own flex
 * row instead, so all of that overlay machinery is gone — dismissing now just means picking a
 * different country, exiting the region, or Esc (see MapScreen's key handler).
 *
 * Difficulty is picked earlier, on its own DifficultyScreen (see ARCHITECTURE.md) — this only
 * reads the store's `pendingDifficulty` for a read-only readout above "Choose", it doesn't
 * offer a second, unrelated choice bundled into the same panel the way the old inline
 * Easy/Medium/Hard toggle did.
 */
export function CountryDossier({ countryId }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const startGame = useGameStore((s) => s.startGame);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);

  const country = countries.find((c) => c.id === countryId);
  if (!country) return null;

  return (
    <aside className="flex min-h-0 w-46 shrink-0 flex-col gap-sp-1 border-l border-(--paper-line) pl-sp-3 tablet:w-52">
      <div className="flex min-h-0 flex-1 flex-col gap-sp-1 overflow-y-auto">
        <h2 className="text-label font-bold leading-tight">{loc(country.name, lang)}</h2>
        <p className="text-caption italic leading-snug opacity-60">{loc(country.description, lang)}</p>

        <div className="mt-sp-1 flex flex-col gap-sp-1">
          <LevelBar label={ui.map.dossier.population} value={formatPopulation(country.population, ui.map.dossier.populationMillion)} />
          <LevelBar label={ui.map.dossier.area} value={`${country.areaKm2.toLocaleString()} km²`} />
          <LevelBar label={ui.map.dossier.economy} value={String(Math.round(country.economyLevel))} />
          <LevelBar label={ui.map.dossier.corruption} value={String(Math.round(country.corruptionLevel))} />
          <LevelBar label={ui.map.dossier.democracy} value={String(Math.round(country.democracyLevel))} />
          <LevelBar label={ui.map.dossier.development} value={String(Math.round(country.developmentLevel))} />
        </div>

        <div className="mt-sp-1 shrink-0">
          <LevelBar label={ui.map.dossier.difficulty} value={ui.menu.difficulties[pendingDifficulty].name} />
        </div>
      </div>

      <div className="shrink-0 border-t border-(--paper-line) pt-sp-1">
        <button
          type="button"
          className="btn btn-primary min-h-9 w-full text-label"
          onClick={() => startGame(country.id, pendingDifficulty)}
        >
          {ui.map.choose}
        </button>
      </div>
    </aside>
  );
}
