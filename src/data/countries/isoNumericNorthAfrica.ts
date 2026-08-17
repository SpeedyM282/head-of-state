/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/africa.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "North Africa" map region — the UN M49 geoscheme's "Northern Africa" subregion
 * (Algeria, Egypt, Libya, Morocco, Sudan, Tunisia, Western Sahara). The rest of the African
 * continent (Sub-Saharan Africa) is split into four further map regions — "Western Africa",
 * "Central Africa", "Eastern Africa" and "Southern Africa" — each with its own iso-numeric
 * map file; see `africa.ts`'s doc comment for the full shared-file picture.
 */
export const NORTH_AFRICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '012': 'dz',
  '818': 'eg',
  '434': 'ly',
  '504': 'ma',
  '729': 'sd',
  '788': 'tn',
  '732': 'eh',
};
