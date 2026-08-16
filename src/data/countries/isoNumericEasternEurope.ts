/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/europe.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Eastern Europe" map region — one of two map regions the European continent is split
 * into, see `isoNumericWesternEurope.ts` for the shared-file note. Covers Central Europe,
 * the Baltics, the rest of Eastern Europe and the Balkans, plus Russia and Turkey — both
 * transcontinental, framed by (and selectable only from) their European portions, exactly as
 * before the region was split. Kosovo has no usable shape at this resolution and is
 * therefore not selectable.
 */
export const EASTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
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
