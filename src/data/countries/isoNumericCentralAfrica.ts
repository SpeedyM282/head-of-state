/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/africa.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Central Africa" map region — the UN M49 geoscheme calls this subregion "Middle
 * Africa"; renamed here for the same reason "Middle East" is used over "Western Asia" in
 * `asia.ts`. 8 of its 9 members (São Tomé and Príncipe has no shape in the 110m topology
 * and is excluded, the same treatment as other unshaped island microstates — see
 * `africa.ts`'s doc comment).
 */
export const CENTRAL_AFRICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '024': 'ao',
  '120': 'cm',
  '140': 'cf',
  '148': 'td',
  '178': 'cg',
  '180': 'cd',
  '226': 'gq',
  '266': 'ga',
};
