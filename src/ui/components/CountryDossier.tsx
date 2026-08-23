import type { Difficulty } from '../../core/types';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { countries } from '../../data';
import { LevelBar } from './LevelBar';

const DIFFICULTY_ORDER: Difficulty[] = ['easy', 'normal', 'hard'];

/** "34,000,000" -> "34 млн"-style abbreviation once a population crosses a million; below
 * that (a handful of small island states), the exact figure is short enough to show as-is. */
function formatPopulation(population: number, millionUnit: string): string {
  if (population < 1_000_000) return population.toLocaleString();
  const millions = Math.round((population / 1_000_000) * 10) / 10;
  const text = Number.isInteger(millions) ? String(millions) : millions.toFixed(1);
  return `${text} ${millionUnit}`;
}

interface Props {
  countryId: string;
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
}

/**
 * Map screen's inline country dossier — docked to the right of the map pane as a permanent
 * column (see MapScreen), not a floating overlay. Was CountryDrawer (a slide-in panel with its
 * own backdrop/swipe-to-dismiss); the redesign's 184px-wide rail sits in the map's own flex
 * row instead, so all of that overlay machinery is gone — dismissing now just means picking a
 * different country, exiting the region, or Esc (see MapScreen's key handler).
 */
export function CountryDossier({ countryId, difficulty, onDifficultyChange }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const startGame = useGameStore((s) => s.startGame);

  const country = countries.find((c) => c.id === countryId);
  if (!country) return null;

  return (
    <aside className="flex w-46 shrink-0 flex-col gap-sp-1 border-l border-(--paper-line) pl-sp-3 tablet:w-52">
      <p className="eyebrow">{ui.map.dossierKicker}</p>
      <h2 className="text-label font-bold leading-tight">{loc(country.name, lang)}</h2>
      <p className="text-caption italic leading-snug opacity-60">{loc(country.description, lang)}</p>

      <div className="mt-sp-1 flex min-h-0 flex-1 flex-col gap-sp-1 overflow-y-auto">
        <LevelBar label={ui.map.dossier.population} value={formatPopulation(country.population, ui.map.dossier.populationMillion)} />
        <LevelBar label={ui.map.dossier.area} value={`${country.areaKm2.toLocaleString()} km²`} />
        <LevelBar label={ui.map.dossier.economy} value={String(Math.round(country.economyLevel))} />
        <LevelBar label={ui.map.dossier.corruption} value={String(Math.round(country.corruptionLevel))} />
        <LevelBar label={ui.map.dossier.democracy} value={String(Math.round(country.democracyLevel))} />
        <LevelBar label={ui.map.dossier.development} value={String(Math.round(country.developmentLevel))} />
      </div>

      <div className="mt-sp-1 flex shrink-0 gap-sp-1">
        {DIFFICULTY_ORDER.map((d) => (
          <button
            key={d}
            type="button"
            aria-pressed={d === difficulty}
            onClick={() => onDifficultyChange(d)}
            className="min-h-9 flex-1 border border-(--paper-line) text-micro"
            style={{
              background: d === difficulty ? 'var(--gold)' : 'transparent',
              color: d === difficulty ? 'var(--paper)' : 'var(--text-ink)',
              fontWeight: d === difficulty ? 700 : 400,
            }}
          >
            {ui.menu.difficulties[d].name}
          </button>
        ))}
      </div>
      <button type="button" className="btn btn-primary min-h-9 w-full shrink-0 text-label" onClick={() => startGame(country.id, difficulty)}>
        {ui.map.choose}
      </button>
    </aside>
  );
}
