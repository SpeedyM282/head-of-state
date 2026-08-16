/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/asia.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Eastern Asia" map region (the former "East Asia" content bucket) — one of four map
 * regions the Asian continent is split into, see `isoNumericCentralAsia.ts` for the
 * shared-file note.
 */
export const EASTERN_ASIA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '156': 'cn',
  '392': 'jp',
  '496': 'mn',
  '408': 'kp',
  '410': 'kr',
  '158': 'tw',
};
