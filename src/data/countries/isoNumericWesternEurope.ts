/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/europe.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Western Europe" map region — one of two map regions the European continent is split
 * into (see also `isoNumericEasternEurope.ts`); both share the single `europe.ts` profile
 * file, the same way `isoNumericNorthAmerica.ts`/`isoNumericSouthAmerica.ts` share
 * `americas.ts`. Covers the Nordics, British Isles, continental Western Europe and Southern
 * (Mediterranean) Europe. Micro-states (Andorra, Liechtenstein, Malta, Monaco, San Marino,
 * Vatican) have no usable shape at this resolution and are therefore not selectable.
 */
export const WESTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  // Nordics & British Isles
  '578': 'no',
  '752': 'se',
  '208': 'dk',
  '246': 'fi',
  '352': 'is',
  '372': 'ie',
  '826': 'gb',
  // Western Europe
  '276': 'de',
  '250': 'fr',
  '528': 'nl',
  '056': 'be',
  '442': 'lu',
  '756': 'ch',
  '040': 'at',
  // Southern Europe
  '380': 'it',
  '724': 'es',
  '620': 'pt',
  '300': 'gr',
  '196': 'cy',
};
