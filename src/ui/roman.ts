const NUMERALS: ReadonlyArray<readonly [number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

/** Term numbers are shown as roman numerals («Срок II»). Non-positive or fractional input
 * falls back to the plain number rather than producing an empty string. */
export function toRoman(n: number): string {
  if (!Number.isInteger(n) || n <= 0) return String(n);
  let rest = n;
  let out = '';
  for (const [value, glyph] of NUMERALS) {
    while (rest >= value) {
      out += glyph;
      rest -= value;
    }
  }
  return out;
}
