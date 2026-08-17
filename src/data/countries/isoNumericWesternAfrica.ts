/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/africa.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "Western Africa" map region — the UN M49 geoscheme's "Western Africa" subregion,
 * 15 of its 16 members (Cabo Verde has no shape in the 110m topology and is excluded,
 * the same treatment as other unshaped island microstates — see `africa.ts`'s doc comment).
 */
export const WESTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '204': 'bj',
  '854': 'bf',
  '384': 'ci',
  '270': 'gm',
  '288': 'gh',
  '324': 'gn',
  '624': 'gw',
  '430': 'lr',
  '466': 'ml',
  '478': 'mr',
  '562': 'ne',
  '566': 'ng',
  '686': 'sn',
  '694': 'sl',
  '768': 'tg',
};
