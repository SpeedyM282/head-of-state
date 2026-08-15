/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/europe.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * Covers the full set of European sovereign states present in the 110m topology.
 * Micro-states (Andorra, Liechtenstein, Malta, Monaco, San Marino, Vatican) and
 * Kosovo have no usable shape at this resolution and are therefore not selectable.
 */
export const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
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
  // Central Europe
  '616': 'pl',
  '203': 'cz',
  '703': 'sk',
  '348': 'hu',
  '705': 'si',
  // Baltics & Eastern Europe
  '233': 'ee',
  '428': 'lv',
  '440': 'lt',
  '112': 'by',
  '804': 'ua',
  '498': 'md',
  // Balkans
  '642': 'ro',
  '100': 'bg',
  '688': 'rs',
  '191': 'hr',
  '070': 'ba',
  '499': 'me',
  '807': 'mk',
  '008': 'al',
  // Transcontinental (framed by their European portions)
  '643': 'ru',
  '792': 'tr',
};
