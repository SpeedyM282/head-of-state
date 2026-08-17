/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/africa.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Eastern Africa" map region — the UN M49 geoscheme's "Eastern Africa" subregion,
 * 15 of its members with a shape in the 110m topology: Comoros, Mauritius and Seychelles
 * have no shape and are excluded (same treatment as other unshaped island microstates —
 * see `africa.ts`'s doc comment), and Mayotte/Réunion/British Indian Ocean Territory/French
 * Southern Territories are non-sovereign and out of scope. Somaliland has geometry in the
 * topology but no `id` field, the same precedent as Kosovo/N. Cyprus in `europe.ts`/`asia.ts` —
 * it renders as non-interactive background within this region.
 */
export const EASTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '108': 'bi',
  '262': 'dj',
  '232': 'er',
  '231': 'et',
  '404': 'ke',
  '450': 'mg',
  '454': 'mw',
  '508': 'mz',
  '646': 'rw',
  '706': 'so',
  '728': 'ss',
  '834': 'tz',
  '800': 'ug',
  '894': 'zm',
  '716': 'zw',
};
