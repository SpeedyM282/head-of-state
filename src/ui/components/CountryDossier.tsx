import { loc } from '../../i18n';
import type { Lang } from '../../core/types';
import type { Ui } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { countries } from '../../data';
import { MeterRow } from './MeterRow';

/** "34,000,000" -> "34 млн"-style abbreviation once a population crosses a million; below
 * that (a handful of small island states), the exact figure is short enough to show as-is.
 * Exported for RegionInfo and the main screen's country label. */
export function formatPopulation(population: number, millionUnit: string): string {
  if (population < 1_000_000) return population.toLocaleString();
  const millions = Math.round((population / 1_000_000) * 10) / 10;
  const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
  return `${text} ${millionUnit}`;
}

/** «447 тыс. км²» above 10 000 km², the exact figure below. */
export function formatArea(areaKm2: number, ui: Ui, lang: Lang): string {
  if (areaKm2 < 10_000) return `${areaKm2.toLocaleString(lang)} ${ui.map.meta.km2}`;
  return `${Math.round(areaKm2 / 1000).toLocaleString(lang)} ${ui.map.meta.thousandKm2}`;
}

/**
 * Country select's card body (handoff screen 02) for a picked country: Spectral name, a meta
 * line, the four profile levels as meter rows (corruption in warning), the italic description
 * and «Выбрать». Difficulty was picked earlier on DifficultyScreen — shown here read-only.
 */
export function CountryDossier({ countryId }: { countryId: string }) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const startGame = useGameStore((s) => s.startGame);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);

  const country = countries.find((c) => c.id === countryId);
  if (!country) return null;

  const meta = [
    formatPopulation(country.population, ui.map.dossier.populationMillion),
    formatArea(country.areaKm2, ui, lang),
    country.hasSeaAccess ? ui.map.meta.seaAccess : ui.map.meta.landlocked,
    `${ui.map.meta.resources} ${Math.round(country.resources)}`,
  ].join(' · ');

  return (
    <>
      <h2 className="font-serif text-heading leading-none">{loc(country.name, lang)}</h2>
      <p className="text-caption leading-normal text-(--muted)">{meta}</p>
      <div className="mt-0.5 flex flex-col gap-sp-1">
        <MeterRow label={ui.map.dossier.economy} value={Math.round(country.economyLevel)} />
        <MeterRow label={ui.map.dossier.corruption} value={Math.round(country.corruptionLevel)} warning />
        <MeterRow label={ui.map.dossier.democracy} value={Math.round(country.democracyLevel)} />
        <MeterRow label={ui.map.dossier.development} value={Math.round(country.developmentLevel)} />
      </div>
      <p className="flavor line-clamp-3 text-caption" title={loc(country.description, lang)}>
        {loc(country.description, lang)}
      </p>
      <button type="button" className="btn btn-primary mt-sp-1 min-h-11 w-full text-label" onClick={() => startGame(country.id, pendingDifficulty)}>
        {ui.map.choose}
      </button>
      <p className="text-center text-caption text-(--muted)">
        {ui.map.dossier.difficulty} · {ui.menu.difficulties[pendingDifficulty].name}
      </p>
    </>
  );
}
