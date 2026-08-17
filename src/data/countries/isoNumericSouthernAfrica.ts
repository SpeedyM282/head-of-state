/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/africa.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Southern Africa" map region — the UN M49 geoscheme's "Southern Africa" subregion,
 * all 5 members (Botswana, Eswatini, Lesotho, Namibia, South Africa). Note this is the
 * region name; the country South Africa is one of its five members, the same relationship
 * "Southern Europe" has to no single country there.
 */
export const SOUTHERN_AFRICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '072': 'bw',
  '748': 'sz',
  '426': 'ls',
  '516': 'na',
  '710': 'za',
};
