import { useUi } from '../../store/langStore';
import { countries } from '../../data';
import { LevelBar } from './LevelBar';
import { formatPopulation } from './CountryDossier';
import { regionCountryIds, type RegionKey } from './WorldMap';

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

interface Props {
  region: RegionKey;
}

/**
 * Map screen's inline right rail, for the gap between "a region is entered" and "a specific
 * country is picked" (see MapScreen — CountryDossier takes over the same rail once a country is
 * selected). Regions have no profile of their own in data/, only a display name
 * (ui.map.continents) and membership (WorldMap's REGION_ISO_MAPS via regionCountryIds), so this
 * aggregates the region's member countries' own profiles instead: population/area summed, the
 * four 0-100 levels averaged — same LevelBar rows CountryDossier uses, so the two states read
 * as one consistent rail rather than two different widgets swapping in and out.
 */
export function RegionInfo({ region }: Props) {
  const ui = useUi();
  const ids = regionCountryIds(region);
  const members = countries.filter((c) => ids.has(c.id));
  if (members.length === 0) return null;

  const totalPopulation = members.reduce((sum, c) => sum + c.population, 0);
  const totalArea = members.reduce((sum, c) => sum + c.areaKm2, 0);
  const avgEconomy = average(members.map((c) => c.economyLevel));
  const avgCorruption = average(members.map((c) => c.corruptionLevel));
  const avgDemocracy = average(members.map((c) => c.democracyLevel));
  const avgDevelopment = average(members.map((c) => c.developmentLevel));

  return (
    <aside className="flex min-h-0 w-46 shrink-0 flex-col gap-sp-1 border-l border-(--paper-line) pl-sp-3 tablet:w-52">
      <p className="eyebrow">{ui.map.regionInfo.kicker}</p>
      <h2 className="text-label font-bold leading-tight">{ui.map.continents[region]}</h2>
      <p className="text-caption italic leading-snug opacity-60">{ui.map.regionInfo.hint}</p>

      <div className="mt-sp-1 flex min-h-0 flex-1 flex-col gap-sp-1 overflow-y-auto">
        <LevelBar label={ui.map.regionInfo.countries} value={String(members.length)} />
        <LevelBar label={ui.map.dossier.population} value={formatPopulation(totalPopulation, ui.map.dossier.populationMillion)} />
        <LevelBar label={ui.map.dossier.area} value={`${totalArea.toLocaleString()} km²`} />
        <LevelBar label={ui.map.dossier.economy} value={String(Math.round(avgEconomy))} />
        <LevelBar label={ui.map.dossier.corruption} value={String(Math.round(avgCorruption))} />
        <LevelBar label={ui.map.dossier.democracy} value={String(Math.round(avgDemocracy))} />
        <LevelBar label={ui.map.dossier.development} value={String(Math.round(avgDevelopment))} />
      </div>
    </aside>
  );
}
