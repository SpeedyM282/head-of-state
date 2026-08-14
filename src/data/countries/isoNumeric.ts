/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/europe.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 */
export const ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '578': 'no',
  '752': 'se',
  '208': 'dk',
  '246': 'fi',
  '276': 'de',
  '250': 'fr',
  '826': 'gb',
  '756': 'ch',
  '528': 'nl',
  '380': 'it',
  '724': 'es',
  '620': 'pt',
  '300': 'gr',
  '616': 'pl',
  '348': 'hu',
  '642': 'ro',
  '100': 'bg',
  '688': 'rs',
};
