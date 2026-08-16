/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/americas.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "South America" map region — everything south of the Colombia/Panama
 * border; see `isoNumericNorthAmerica.ts` for Central America/Caribbean/North
 * America. Non-sovereign territories (Falkland Islands, French Guiana) have no
 * usable shape at this resolution, or aren't sovereign states, and are
 * therefore not selectable.
 */
export const SOUTH_AMERICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '170': 'co',
  '862': 've',
  '328': 'gy',
  '740': 'sr',
  '218': 'ec',
  '604': 'pe',
  '076': 'br',
  '068': 'bo',
  '600': 'py',
  '152': 'cl',
  '032': 'ar',
  '858': 'uy',
};
