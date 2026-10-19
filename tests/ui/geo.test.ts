import { describe, expect, it } from 'vitest';
import type { Feature, Geometry } from 'geojson';
import { hashUnit, mainlandCentroid, mainlandFeature } from '../../src/ui/map/geo';

// A big square around (10, 10) plus a tiny island around (100, -40). Rings wind clockwise —
// d3-geo's spherical convention (and world-atlas's), where counter-clockwise would mean "the
// whole globe except this square".
const square = (cx: number, cy: number, r: number) => [[[cx - r, cy - r], [cx - r, cy + r], [cx + r, cy + r], [cx + r, cy - r], [cx - r, cy - r]]];
const country: Feature<Geometry> = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'MultiPolygon', coordinates: [square(100, -40, 0.5), square(10, 10, 5)] },
};

describe('mainlandFeature', () => {
  it('keeps only the largest polygon of a MultiPolygon', () => {
    const main = mainlandFeature(country);
    expect(main.geometry.type).toBe('Polygon');
    expect(mainlandCentroid(country)[0]).toBeCloseTo(10, 0);
    expect(mainlandCentroid(country)[1]).toBeCloseTo(10, 0);
  });

  it('passes a plain Polygon through unchanged', () => {
    const poly: Feature<Geometry> = { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: square(0, 0, 1) } };
    expect(mainlandFeature(poly)).toBe(poly);
  });
});

describe('hashUnit', () => {
  it('is deterministic and within [0, 1]', () => {
    expect(hashUnit('rnd-crypto')).toBe(hashUnit('rnd-crypto'));
    expect(hashUnit('rnd-crypto')).not.toBe(hashUnit('rnd-drought'));
    for (const s of ['', 'a', 'event-123', 'Абсурдистан']) {
      expect(hashUnit(s)).toBeGreaterThanOrEqual(0);
      expect(hashUnit(s)).toBeLessThanOrEqual(1);
    }
  });
});
