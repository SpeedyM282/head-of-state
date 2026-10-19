import { geoArea, geoCentroid } from 'd3-geo';
import type { Feature, Geometry, Polygon } from 'geojson';

/**
 * A country's "mainland": its largest polygon by spherical area. Used to frame and label a
 * country on the map without overseas islands or exclaves (Alaska, Kaliningrad, Pacific
 * atolls…) dragging the frame or the label point into the ocean. Non-multi shapes pass through.
 */
export function mainlandFeature(feature: Feature<Geometry>): Feature<Geometry> {
  const g = feature.geometry;
  if (g.type !== 'MultiPolygon' || g.coordinates.length === 0) return feature;
  let best: Polygon = { type: 'Polygon', coordinates: g.coordinates[0] };
  let bestArea = geoArea(best);
  for (const coords of g.coordinates.slice(1)) {
    const candidate: Polygon = { type: 'Polygon', coordinates: coords };
    const area = geoArea(candidate);
    if (area > bestArea) {
      best = candidate;
      bestArea = area;
    }
  }
  return { ...feature, geometry: best };
}

/** [lon, lat] of the country's mainland centroid — where its map marker and label sit. */
export function mainlandCentroid(feature: Feature<Geometry>): [number, number] {
  return geoCentroid(mainlandFeature(feature));
}

/** Stable 0..1 value from a string (FNV-1a) — places an event's map pin deterministically
 * around the country without touching the game rng. Presentation only. */
export function hashUnit(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0) / 0xffffffff;
}
