/**
 * Maps ISO 3166-1 numeric country codes (as used by the `id` field of features
 * in `src/assets/world-110m.json`) to the lowercase alpha-2 `CountryProfile.id`
 * values used throughout the game. Only countries with a profile in
 * `data/countries/oceania.ts` are listed — geographies without an entry here
 * render as non-interactive map context.
 *
 * The full set of Oceania sovereign states with a shape in the 110m topology: Australia,
 * New Zealand, Papua New Guinea, Fiji, Solomon Islands, Vanuatu. Smaller Pacific island
 * nations have no usable shape at this resolution and are therefore not selectable — see
 * `oceania.ts` for the full list of exclusions. New Caledonia has a shape but is a French
 * territory, not a sovereign state, and is excluded on the same basis as French Guiana in
 * `isoNumericSouthAmerica.ts`.
 */
export const OCEANIA_ISO_NUMERIC_TO_ALPHA2: Record<string, string> = {
  '036': 'au',
  '554': 'nz',
  '598': 'pg',
  '242': 'fj',
  '090': 'sb',
  '548': 'vu',
};
