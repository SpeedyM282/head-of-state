/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/americas.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The "North America" map region: Northern America, Central America and the
 * Caribbean (everything north of the Colombia/Panama border) — see
 * `isoNumericSouthAmerica.ts` for the rest of the continent. Small Caribbean
 * island states (Antigua and Barbuda, Barbados, Dominica, Grenada, Saint Kitts
 * and Nevis, Saint Lucia, Saint Vincent and the Grenadines) have no usable
 * shape at this resolution; Puerto Rico isn't a sovereign state. Neither is
 * Greenland, but it's included anyway (a fictional-satire game's one real
 * exception to "sovereign states only") — it DOES have a usable shape,
 * unlike its neighbors above; its inclusion is also why this region's
 * WorldMap.tsx frame is noticeably wider than a Canada/US/Mexico/Central
 * America/Caribbean bbox alone would need, see MAP_FRAMES's comment there.
 */
export const NORTH_AMERICA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  // North America
  '124': 'ca',
  '840': 'us',
  '484': 'mx',
  '304': 'gl',
  // Central America
  '084': 'bz',
  '320': 'gt',
  '340': 'hn',
  '222': 'sv',
  '558': 'ni',
  '188': 'cr',
  '591': 'pa',
  // Caribbean
  '044': 'bs',
  '192': 'cu',
  '388': 'jm',
  '332': 'ht',
  '214': 'do',
  '780': 'tt',
};
