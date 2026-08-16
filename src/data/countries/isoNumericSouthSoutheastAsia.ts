/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/asia.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "South & Southeast Asia" map region — merges the former "South Asia" and
 * "Southeast Asia" content buckets into one map region (there was no separate "South Asia"
 * name among the three the region split was requested with). One of four map regions the
 * Asian continent is split into, see `isoNumericCentralAsia.ts` for the shared-file note.
 */
export const SOUTH_SOUTHEAST_ASIA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  // South Asia
  '004': 'af',
  '050': 'bd',
  '064': 'bt',
  '356': 'in',
  '524': 'np',
  '586': 'pk',
  '144': 'lk',
  // Southeast Asia
  '096': 'bn',
  '116': 'kh',
  '360': 'id',
  '418': 'la',
  '458': 'my',
  '104': 'mm',
  '608': 'ph',
  '764': 'th',
  '626': 'tl',
  '704': 'vn',
};
