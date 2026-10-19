import { useLang, useUi } from '../../store/langStore';
import { countries } from '../../data';
import { MeterRow } from './MeterRow';
import { formatArea, formatPopulation } from './CountryDossier';
import { regionCountryIds, type RegionKey } from './WorldMap';

function average(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Country select's card body for the gap between "a region is entered" and "a specific country
 * is picked" (CountryDossier takes over the same card once a country is selected). Regions have
 * no profile of their own in data/, only a display name (ui.map.continents) and membership
 * (WorldMap's REGION_ISO_MAPS via regionCountryIds), so this aggregates the members' profiles:
 * population/area summed, the four 0-100 levels averaged — same meter rows as the dossier.
 */
export function RegionInfo({ region }: { region: RegionKey }) {
  const ui = useUi();
  const lang = useLang((s) => s.lang);
  const ids = regionCountryIds(region);
  const members = countries.filter((c) => ids.has(c.id));
  if (members.length === 0) return null;

  const totalPopulation = members.reduce((sum, c) => sum + c.population, 0);
  const totalArea = members.reduce((sum, c) => sum + c.areaKm2, 0);
  const meta = [
    `${ui.map.regionInfo.countries}: ${members.length}`,
    formatPopulation(totalPopulation, ui.map.dossier.populationMillion),
    formatArea(totalArea, ui, lang),
  ].join(' · ');

  return (
    <>
      <h2 className="font-serif text-heading leading-none desktop:text-dp-64">{ui.map.continents[region]}</h2>
      <p className="text-caption leading-normal text-(--muted) desktop:text-dp-18 desktop:leading-[1.45]">{meta}</p>
      <div className="mt-0.5 flex flex-col gap-sp-1 desktop:mt-dp-6 desktop:gap-dp-20">
        <MeterRow label={ui.map.dossier.economy} value={Math.round(average(members.map((c) => c.economyLevel)))} />
        <MeterRow label={ui.map.dossier.corruption} value={Math.round(average(members.map((c) => c.corruptionLevel)))} warning />
        <MeterRow label={ui.map.dossier.democracy} value={Math.round(average(members.map((c) => c.democracyLevel)))} />
        <MeterRow label={ui.map.dossier.development} value={Math.round(average(members.map((c) => c.developmentLevel)))} />
      </div>
      <p className="flavor text-caption desktop:text-dp-23">{ui.map.regionInfo.hint}</p>
    </>
  );
}
