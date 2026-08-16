/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/asia.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Central Asia" map region — one of four map regions the Asian continent is split
 * into (see also `isoNumericMiddleEast.ts` / `isoNumericEasternAsia.ts` /
 * `isoNumericSouthSoutheastAsia.ts`); all four share the single `asia.ts` profile file,
 * the same way `isoNumericNorthAmerica.ts`/`isoNumericSouthAmerica.ts` share `americas.ts`.
 */
export const CENTRAL_ASIA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '398': 'kz',
  '417': 'kg',
  '762': 'tj',
  '795': 'tm',
  '860': 'uz',
};
