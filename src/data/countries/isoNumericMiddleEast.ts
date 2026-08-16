/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/asia.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Middle East" map region (the former "Western Asia" content bucket, renamed for the
 * map only — country data/descriptions are unchanged) — one of four map regions the Asian
 * continent is split into, see `isoNumericCentralAsia.ts` for the shared-file note. Includes
 * the South Caucasus (Armenia, Azerbaijan, Georgia), grouped here rather than a fifth region.
 */
export const MIDDLE_EAST_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '051': 'am',
  '031': 'az',
  '268': 'ge',
  '364': 'ir',
  '368': 'iq',
  '376': 'il',
  '400': 'jo',
  '414': 'kw',
  '422': 'lb',
  '512': 'om',
  '275': 'ps',
  '634': 'qa',
  '682': 'sa',
  '760': 'sy',
  '784': 'ae',
  '887': 'ye',
};
