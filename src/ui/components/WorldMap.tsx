import {
  memo,
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import { ComposableMap, Geographies, Geography, ZoomableGroup, useMapContext, useZoomPanContext } from 'react-simple-maps';
import { feature, merge } from 'topojson-client';
import type { GeometryObject, MultiPolygon as TopoMultiPolygon, Polygon as TopoPolygon, Topology } from 'topojson-specification';
import type { Feature, Geometry, MultiPolygon as GeoMultiPolygon } from 'geojson';
import { mainlandCentroid } from '../map/geo';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { countries } from '../../data';
import { classifyFormFactor, useViewport, type Viewport } from '../hooks/useViewport';
import { WESTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericWesternEurope';
import { EASTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericEasternEurope';
import { NORTH_AMERICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericNorthAmerica';
import { SOUTH_AMERICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericSouthAmerica';
import { CENTRAL_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericCentralAsia';
import { MIDDLE_EAST_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericMiddleEast';
import { EASTERN_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericEasternAsia';
import { SOUTH_SOUTHEAST_ASIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericSouthSoutheastAsia';
import { OCEANIA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericOceania';
import { NORTH_AFRICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericNorthAfrica';
import { WESTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericWesternAfrica';
import { CENTRAL_AFRICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericCentralAfrica';
import { EASTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericEasternAfrica';
import { SOUTHERN_AFRICA_ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumericSouthernAfrica';
import worldTopologyJson from '../../assets/world-110m.json';

// TS's JSON-module inference widens string literals (e.g. "type": "Topology") to `string`,
// so it can't structurally satisfy topojson-specification's Topology on its own — this
// asserts the accurate, verified-correct nominal type for an opaque vendored asset (its
// real shape genuinely is a Topology; RSM's own <Geographies> already treats it as one).
const rawWorldTopology = worldTopologyJson as unknown as Topology;

/**
 * Drops specific polygon parts (by index into the country's MultiPolygon `arcs`) from one
 * country's geometry, once at load time. Used below for countries whose Natural Earth shape
 * bundles in a genuine, far-flung exclave alongside the mainland the map actually cares
 * about — not to redraw any border, just to stop that exclave from rendering as a
 * disconnected dot thousands of km from everything else, and from skewing merge()'d region
 * silhouettes and their numerically-fit center/zoom. Safe for neighboring countries that
 * happen to share arcs with the dropped part (e.g. Suriname/Brazil bordering French Guiana):
 * arc indices are shared pointers into the topology's arc pool, not owned by any one
 * geometry, so this only removes this one country's own reference to them.
 */
function dropMultiPolygonParts(topology: Topology, id: string, partIndices: readonly number[]): Topology {
  const countriesObject = topology.objects.countries;
  if (countriesObject.type !== 'GeometryCollection') return topology;
  const drop = new Set(partIndices);
  const geometries = countriesObject.geometries.map((g) => {
    if (g.id !== id || g.type !== 'MultiPolygon') return g;
    return { ...g, arcs: g.arcs.filter((_, i) => !drop.has(i)) };
  });
  return { ...topology, objects: { ...topology.objects, countries: { ...countriesObject, geometries } } };
}

/**
 * Drops one whole top-level geometry (a standalone country entry in the topology) by id —
 * unlike dropMultiPolygonParts above, this isn't for carving an exclave out of a country the
 * game DOES use, it's for a landmass the game never assigns to any region at all and doesn't
 * want rendered as inert background context either.
 */
function dropGeometry(topology: Topology, id: string): Topology {
  const countriesObject = topology.objects.countries;
  if (countriesObject.type !== 'GeometryCollection') return topology;
  const geometries = countriesObject.geometries.filter((g) => g.id !== id);
  return { ...topology, objects: { ...topology.objects, countries: { ...countriesObject, geometries } } };
}

// France (id "250"): part 0 of its 3-part MultiPolygon is French Guiana, thousands of km
// away in South America — legally an integral part of France, not a separate country in
// Natural Earth's data. Verified by inspection: bbox lon -54.5..-51.7, lat 2.1..5.8. Parts
// 1/2 (kept) are mainland France and Corsica. This is why WESTERN_EUROPE's fit below looks
// nothing like a naive guess would — it's numerically fit on the corrected geometry.
const withoutFrenchGuiana = dropMultiPolygonParts(rawWorldTopology, '250', [0]);
// United States (id "840"): parts 1-5 of its 10-part MultiPolygon are the Hawaiian islands,
// ~4000km from the mainland — bundled in the same way, unlike e.g. Puerto Rico, which gets
// its own (unselected) topology entry rather than being folded into the US's shape. Verified
// by inspection: bbox lon -159.8..-154.7, lat 18.9..22.2. Part 0 (kept) is the CONUS
// mainland; parts 6-9 (kept) are Alaska, including the Aleutians — still North America,
// unlike Hawaii, so not dropped.
const withoutHawaii = dropMultiPolygonParts(withoutFrenchGuiana, '840', [1, 2, 3, 4, 5]);
// Antarctica (id "010"): not part of any map region — it used to render as ordinary
// unclaimed background context (the same muted, non-interactive style as e.g. the parts of
// Africa outside all 14 regions were before v0.19), showing up as an inert silhouette along
// the bottom edge of the world overview. Dropped outright rather than left as background,
// since a frozen, uninhabited, unplayable continent doesn't read as "map context" the way an
// unclaimed-but-populated territory does.
const worldTopology = dropGeometry(withoutHawaii, '010');

export type RegionKey =
  | 'westernEurope'
  | 'easternEurope'
  | 'northAmerica'
  | 'southAmerica'
  | 'centralAsia'
  | 'middleEast'
  | 'southSoutheastAsia'
  | 'easternAsia'
  | 'oceania'
  | 'northAfrica'
  | 'westernAfrica'
  | 'centralAfrica'
  | 'easternAfrica'
  | 'southernAfrica';
const REGION_KEYS: RegionKey[] = [
  'westernEurope',
  'easternEurope',
  'northAmerica',
  'southAmerica',
  'centralAsia',
  'middleEast',
  'southSoutheastAsia',
  'easternAsia',
  'oceania',
  'northAfrica',
  'westernAfrica',
  'centralAfrica',
  'easternAfrica',
  'southernAfrica',
];

/** Offset (px) of the hover tooltip from the cursor so it doesn't sit under the pointer. */
const TOOLTIP_OFFSET = 14;

const REGION_ISO_MAPS: Record<RegionKey, Record<string, string>> = {
  westernEurope: WESTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2,
  easternEurope: EASTERN_EUROPE_ISO_NUMERIC_TO_ALPHA2,
  northAmerica: NORTH_AMERICA_ISO_NUMERIC_TO_ALPHA2,
  southAmerica: SOUTH_AMERICA_ISO_NUMERIC_TO_ALPHA2,
  centralAsia: CENTRAL_ASIA_ISO_NUMERIC_TO_ALPHA2,
  middleEast: MIDDLE_EAST_ISO_NUMERIC_TO_ALPHA2,
  southSoutheastAsia: SOUTH_SOUTHEAST_ASIA_ISO_NUMERIC_TO_ALPHA2,
  easternAsia: EASTERN_ASIA_ISO_NUMERIC_TO_ALPHA2,
  oceania: OCEANIA_ISO_NUMERIC_TO_ALPHA2,
  northAfrica: NORTH_AFRICA_ISO_NUMERIC_TO_ALPHA2,
  westernAfrica: WESTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2,
  centralAfrica: CENTRAL_AFRICA_ISO_NUMERIC_TO_ALPHA2,
  easternAfrica: EASTERN_AFRICA_ISO_NUMERIC_TO_ALPHA2,
  southernAfrica: SOUTHERN_AFRICA_ISO_NUMERIC_TO_ALPHA2,
};

/** Alpha-2 `CountryProfile.id` values belonging to a map region — lets MapScreen scope the
 * country list modal to the active region instead of always listing every playable country. */
export function regionCountryIds(region: RegionKey): Set<string> {
  return new Set(Object.values(REGION_ISO_MAPS[region]));
}

/** Reverse of regionCountryIds: which region (if any) a given country belongs to. Built once —
 * REGION_ISO_MAPS is static. Absurdistan (list view only, not part of any of the 14 map
 * regions) is the one playable country with no entry here. */
const COUNTRY_TO_REGION: Record<string, RegionKey> = (() => {
  const map: Record<string, RegionKey> = {};
  for (const region of REGION_KEYS) {
    for (const alpha2 of Object.values(REGION_ISO_MAPS[region])) map[alpha2] = region;
  }
  return map;
})();

/** Used by MapScreen's country-list modal: picking a country from the full (non-region-scoped)
 * list needs to know which region to zoom the map into, the same way clicking its shape
 * directly on an already-active region would. */
export function regionForCountry(countryId: string): RegionKey | undefined {
  return COUNTRY_TO_REGION[countryId];
}

interface RegionFrame {
  /** [lon, lat] that centers this region under this bucket's world projection scale. */
  center: [number, number];
  zoom: number;
}

/**
 * One "bucket" is a fixed-aspect-ratio SVG viewBox (width/height) plus the whole-world
 * projection scale and every region's numerically-fit center/zoom for THAT box — the exact
 * same "fit bbox into box with a 12% margin, invert the bbox center" method the original
 * single 560×560-square bucket was fit with (see git history), just re-run once per bucket via
 * a one-off script (not shipped) using the same d3-geo react-simple-maps itself renders with,
 * so the numbers are guaranteed to match what's actually on screen. A bucket's aspect ratio is
 * only a representative for its form factor (real viewports vary continuously) — the
 * `<ComposableMap>`'s `preserveAspectRatio="xMidYMid meet"` letterboxes any mismatch between a
 * bucket's fixed aspect and the live container's actual aspect evenly on both sides (centered),
 * so nothing is ever cropped or distorted, only (mildly) letterboxed. South America is the one region whose
 * hardcoded zoom was historically tightened beyond the generic fit (its N-S-elongated shape
 * leaves excess side margin under the generic formula) — that same relative tightening
 * (×1.1513) is reproduced in every bucket below, not just re-derived once. North America's
 * frame was refit after Greenland joined its member set (see isoNumericNorthAmerica.ts):
 * Greenland's east coast sits well east of anything else in the region, which widens the
 * fitted bbox enough that width (not height) becomes the binding dimension in every bucket —
 * hence tabletPortrait/tabletLandscape/desktop sharing one zoom value where they used to
 * differ, the same coincidence already visible in easternAsia's own numbers below.
 */
type MapFrameBucket = 'phoneLandscape' | 'tabletPortrait' | 'tabletLandscape' | 'desktop';

interface MapFrameConfig {
  width: number;
  height: number;
  /** geoEqualEarth scale fitting the whole sphere into [width, height] (fitSize semantics). */
  worldScale: number;
  regions: Record<RegionKey, RegionFrame>;
}

const MAP_FRAMES: Record<MapFrameBucket, MapFrameConfig> = {
  // ~1.9 aspect: covers 640×360 up to ~926×428, the phone-landscape test range.
  phoneLandscape: {
    width: 772,
    height: 406,
    worldScale: 142.613,
    regions: {
      westernEurope: { center: [8.522, 52.784], zoom: 3.737 },
      easternEurope: { center: [29.837, 46.898], zoom: 5.997 },
      northAmerica: { center: [-76.774, 37.24], zoom: 1.98 },
      southAmerica: { center: [-59.548, -19.343], zoom: 2.069 },
      centralAsia: { center: [64.829, 44.798], zoom: 6.89 },
      middleEast: { center: [48.598, 27.456], zoom: 3.945 },
      southSoutheastAsia: { center: [99.564, 13.359], zoom: 2.398 },
      easternAsia: { center: [105.788, 34.715], zoom: 3.647 },
      oceania: { center: [140.582, -23.501], zoom: 2.744 },
      northAfrica: { center: [10.889, 22.369], zoom: 4.09 },
      westernAfrica: { center: [-0.978, 15.642], zoom: 5.014 },
      centralAfrica: { center: [19.829, 2.645], zoom: 2.775 },
      easternAfrica: { center: [36.098, -4.194], zoom: 2.572 },
      southernAfrica: { center: [22.375, -25.697], zoom: 6.724 },
    },
  },
  // ~0.695 aspect (820×1180 test case): tablet held portrait.
  tabletPortrait: {
    width: 467,
    height: 672,
    worldScale: 86.27,
    regions: {
      westernEurope: { center: [8.522, 52.784], zoom: 6.007 },
      easternEurope: { center: [29.837, 46.898], zoom: 9.585 },
      northAmerica: { center: [-76.774, 37.24], zoom: 2.352 },
      southAmerica: { center: [-59.548, -19.343], zoom: 5.66 },
      centralAsia: { center: [64.829, 44.798], zoom: 8.601 },
      middleEast: { center: [48.598, 27.456], zoom: 10.302 },
      southSoutheastAsia: { center: [99.564, 13.359], zoom: 3.403 },
      easternAsia: { center: [105.788, 34.715], zoom: 4.652 },
      oceania: { center: [140.582, -23.501], zoom: 4.909 },
      northAfrica: { center: [10.889, 22.369], zoom: 5.374 },
      westernAfrica: { center: [-0.978, 15.642], zoom: 8.859 },
      centralAfrica: { center: [19.829, 2.645], zoom: 7.592 },
      easternAfrica: { center: [36.098, -4.194], zoom: 7.037 },
      southernAfrica: { center: [22.375, -25.697], zoom: 14.767 },
    },
  },
  // ~1.334 aspect (1024×768 test case): tablet/small-laptop landscape.
  tabletLandscape: {
    width: 647,
    height: 485,
    worldScale: 119.521,
    regions: {
      westernEurope: { center: [8.522, 52.784], zoom: 5.327 },
      easternEurope: { center: [29.837, 46.898], zoom: 8.549 },
      northAmerica: { center: [-76.774, 37.24], zoom: 2.352 },
      southAmerica: { center: [-59.548, -19.343], zoom: 2.949 },
      centralAsia: { center: [64.829, 44.798], zoom: 8.601 },
      middleEast: { center: [48.598, 27.456], zoom: 5.623 },
      southSoutheastAsia: { center: [99.564, 13.359], zoom: 3.403 },
      easternAsia: { center: [105.788, 34.715], zoom: 4.652 },
      oceania: { center: [140.582, -23.501], zoom: 3.911 },
      northAfrica: { center: [10.889, 22.369], zoom: 5.374 },
      westernAfrica: { center: [-0.978, 15.642], zoom: 7.147 },
      centralAfrica: { center: [19.829, 2.645], zoom: 3.955 },
      easternAfrica: { center: [36.098, -4.194], zoom: 3.666 },
      southernAfrica: { center: [22.375, -25.697], zoom: 9.584 },
    },
  },
  // ~1.6 aspect (1440×900 test case): wide desktop.
  desktop: {
    width: 708,
    height: 443,
    worldScale: 130.79,
    regions: {
      westernEurope: { center: [8.522, 52.784], zoom: 4.446 },
      easternEurope: { center: [29.837, 46.898], zoom: 7.136 },
      northAmerica: { center: [-76.774, 37.24], zoom: 2.352 },
      southAmerica: { center: [-59.548, -19.343], zoom: 2.461 },
      centralAsia: { center: [64.829, 44.798], zoom: 8.197 },
      middleEast: { center: [48.598, 27.456], zoom: 4.694 },
      southSoutheastAsia: { center: [99.564, 13.359], zoom: 2.854 },
      easternAsia: { center: [105.788, 34.715], zoom: 4.339 },
      oceania: { center: [140.582, -23.501], zoom: 3.264 },
      northAfrica: { center: [10.889, 22.369], zoom: 4.866 },
      westernAfrica: { center: [-0.978, 15.642], zoom: 5.965 },
      centralAfrica: { center: [19.829, 2.645], zoom: 3.301 },
      easternAfrica: { center: [36.098, -4.194], zoom: 3.060 },
      southernAfrica: { center: [22.375, -25.697], zoom: 8.0 },
    },
  },
};

/** Highest zoom any bucket's regions need (14.767, tabletPortrait's Southern Africa — its 5
 * countries cluster into a comparatively small angular span, so filling the same tall/narrow
 * viewport needs more zoom than a wider-spanning region like North Africa or Middle East)
 * plus headroom for the user's own pinch-zoom past the auto-fit frame — mirrors the old
 * single-bucket maxZoom's ~4% headroom over its own highest frame (10/9.585). */
const MAX_ZOOM = 16.5;

/** Same breakpoints as the `tablet:`/`desktop:` CSS custom variants in index.css, so the map's
 * chosen frame bucket always matches whichever layout is actually on screen. */
function pickMapFrameBucket(viewport: Viewport): MapFrameBucket {
  const formFactor = classifyFormFactor(viewport);
  if (formFactor === 'desktop') return 'desktop';
  if (formFactor === 'tablet') return viewport.height > viewport.width ? 'tabletPortrait' : 'tabletLandscape';
  return 'phoneLandscape';
}

/** Identity view: shows the whole fitted world with no additional pan/zoom. */
const WORLD_VIEW = { center: [0, 0] as [number, number], zoom: 1 };

function isPolygonal(g: GeometryObject): g is TopoPolygon | TopoMultiPolygon {
  return g.type === 'Polygon' || g.type === 'MultiPolygon';
}

/**
 * One dissolved shape per region — every member country merged into a single outline with
 * internal borders removed (topojson-client's `merge`, which resolves shared arcs in the
 * topology; this is exactly what it's for). Computed once at module load: `worldTopology`
 * is a static import, so this never needs to re-run.
 */
const REGION_MERGED_GEOMETRY: Record<RegionKey, GeoMultiPolygon> = (() => {
  const countriesObject = worldTopology.objects.countries;
  const geometries = countriesObject.type === 'GeometryCollection' ? countriesObject.geometries : [];
  const result = {} as Record<RegionKey, GeoMultiPolygon>;
  for (const region of REGION_KEYS) {
    const ids = new Set(Object.keys(REGION_ISO_MAPS[region]));
    // `@types/topojson-specification`'s Properties (via Topology's default generic) allows
    // `null`, but `@types/topojson-client`'s merge() is hard-typed to its own default
    // (non-null) Properties — a cross-package generic mismatch between two DefinitelyTyped
    // packages, not a real runtime concern: merge() never reads `.properties`, only
    // `.type`/`.arcs`/`.id`, all of which are verified by the filter below.
    const members = (geometries as unknown as GeometryObject[]).filter(
      (g): g is TopoPolygon | TopoMultiPolygon => g.id !== undefined && ids.has(String(g.id)) && isPolygonal(g),
    );
    result[region] = merge(worldTopology, members);
  }
  return result;
})();

/** Every country in the vendored topology as a GeoJSON feature (id = ISO numeric) — the
 * main screen's CountryMap draws the whole world around the player's country from these. */
export const WORLD_FEATURES: Feature<Geometry>[] = (() => {
  const countriesObject = worldTopology.objects.countries;
  if (countriesObject.type !== 'GeometryCollection') return [];
  return feature(worldTopology, countriesObject).features;
})();

const ALPHA2_TO_NUMERIC: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const region of REGION_KEYS) {
    for (const [numericId, alpha2] of Object.entries(REGION_ISO_MAPS[region])) map[alpha2] = numericId;
  }
  return map;
})();

/** The map shape of a playable country by its alpha-2 `CountryProfile.id`; null for
 * Absurdistan (fictional, no shape) or any id without one. */
export function countryFeature(countryId: string): Feature<Geometry> | null {
  const numericId = ALPHA2_TO_NUMERIC[countryId];
  if (!numericId) return null;
  return WORLD_FEATURES.find((f) => String(f.id) === numericId) ?? null;
}

type GeographyStyle = { default: CSSProperties; hover: CSSProperties; pressed: CSSProperties };

const STYLE_CONTEXT: GeographyStyle = {
  default: { fill: 'var(--map-ocean)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  hover: { fill: 'var(--map-ocean)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  pressed: { fill: 'var(--map-ocean)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
};
/** Fully invisible and non-interactive: a region's member country while that region is NOT
 * the active one, or (once any region is active) any country outside the map's 14 regions
 * entirely. Selecting a region hides everything else on the map, not just the other regions'
 * borders — the region overlay (world view) is what represents non-active regions instead. */
const STYLE_HIDDEN: GeographyStyle = {
  default: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
  hover: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
  pressed: { fill: 'none', stroke: 'none', outline: 'none', pointerEvents: 'none' },
};
// Hover/pressed reuse the exact same border as default (no emphasis, no width change) —
// only the fill shifts, so hovering never draws a new/thicker outline around the shape.
const STYLE_SELECTABLE: GeographyStyle = {
  default: { fill: 'var(--map-land)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
  hover: { fill: 'var(--gold-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
  pressed: { fill: 'var(--gold)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', cursor: 'pointer' },
};
// Selected: a soft accent tint with an accent border, not a solid fill — the accent dot and
// ring of SelectedMarker sit on top and must stay readable (handoff screen 02).
const SELECTED_FILL = 'color-mix(in srgb, var(--accent) 28%, var(--map-land))';
const STYLE_SELECTED: GeographyStyle = {
  default: { fill: SELECTED_FILL, stroke: 'var(--accent)', strokeWidth: 1, outline: 'none', cursor: 'pointer' },
  hover: { fill: SELECTED_FILL, stroke: 'var(--accent)', strokeWidth: 1, outline: 'none', cursor: 'pointer' },
  pressed: { fill: SELECTED_FILL, stroke: 'var(--accent)', strokeWidth: 1, outline: 'none', cursor: 'pointer' },
};
/** Same as STYLE_SELECTABLE but hover === default — used on coarse (touch) pointers, where
 * react-simple-maps' onMouseEnter/onMouseLeave fire from taps and would otherwise leave a
 * gold-tinted shape "stuck" hovered until the next tap elsewhere. `pressed` still differs (a
 * real tap-driven state), matching the `hover: hover` guard the rest of the app's CSS hover
 * states use — see index.css. */
const STYLE_SELECTABLE_NO_HOVER: GeographyStyle = {
  ...STYLE_SELECTABLE,
  hover: STYLE_SELECTABLE.default,
};

/** The subset of a react-simple-maps prepared feature that this component reads directly. */
interface RsmFeature {
  rsmKey: string;
  id?: string;
}

interface MapGeographyProps {
  geo: RsmFeature;
  /** Belongs to one of the map regions at all (regardless of which is currently active). */
  isRegionMember: boolean;
  /** True only at the world overview (no active region) — the only time a non-region country
   * should render as muted background context instead of disappearing entirely. */
  showBackgroundContext: boolean;
  alpha2: string | null;
  isSelected: boolean;
  label: string | undefined;
  /** STYLE_SELECTABLE on a fine pointer, STYLE_SELECTABLE_NO_HOVER on touch — see its comment. */
  selectableStyle: GeographyStyle;
  onActivate: (alpha2: string) => void;
  onHoverStart: (label: string) => void;
  onHoverEnd: () => void;
}

/**
 * Memoized so panning/zooming (which re-invokes the <Geographies> children render-prop
 * every frame) only re-renders the one or two geographies whose state actually changed,
 * not all ~180 world shapes.
 */
const MapGeography = memo(function MapGeography({
  geo,
  isRegionMember,
  showBackgroundContext,
  alpha2,
  isSelected,
  label,
  selectableStyle,
  onActivate,
  onHoverStart,
  onHoverEnd,
}: MapGeographyProps) {
  const handleClick = useCallback(() => {
    if (alpha2) onActivate(alpha2);
  }, [alpha2, onActivate]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGPathElement>) => {
      if (!alpha2) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(alpha2);
      }
    },
    [alpha2, onActivate],
  );

  const handleMouseEnter = useCallback(() => {
    if (alpha2 && label) onHoverStart(label);
  }, [alpha2, label, onHoverStart]);

  const style = !isRegionMember
    ? (showBackgroundContext ? STYLE_CONTEXT : STYLE_HIDDEN)
    : alpha2
      ? isSelected
        ? STYLE_SELECTED
        : selectableStyle
      : STYLE_HIDDEN;

  return (
    <Geography
      geography={geo}
      style={style}
      tabIndex={alpha2 ? 0 : -1}
      role={alpha2 ? 'button' : undefined}
      aria-pressed={alpha2 ? isSelected : undefined}
      aria-label={label}
      onClick={alpha2 ? handleClick : undefined}
      onKeyDown={alpha2 ? handleKeyDown : undefined}
      onMouseEnter={alpha2 ? handleMouseEnter : undefined}
      onMouseLeave={alpha2 ? onHoverEnd : undefined}
    >
      {label ? <title>{label}</title> : null}
    </Geography>
  );
});
MapGeography.displayName = 'MapGeography';

interface RegionGeographyProps {
  svgPath: string;
  region: RegionKey;
  label: string;
  selectableStyle: GeographyStyle;
  onActivate: (region: RegionKey) => void;
}

/** One region blob at the world overview — a dissolved shape (no member-country borders),
 * clicking it enters that region. */
const RegionGeography = memo(function RegionGeography({ svgPath, region, label, selectableStyle, onActivate }: RegionGeographyProps) {
  const handleClick = useCallback(() => onActivate(region), [region, onActivate]);
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGPathElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onActivate(region);
      }
    },
    [region, onActivate],
  );
  return (
    <Geography geography={{ svgPath }} style={selectableStyle} tabIndex={0} role="button" aria-label={label} onClick={handleClick} onKeyDown={handleKeyDown}>
      <title>{label}</title>
    </Geography>
  );
});
RegionGeography.displayName = 'RegionGeography';

interface RegionOverlayProps {
  labels: Record<RegionKey, string>;
  selectableStyle: GeographyStyle;
  onEnterRegion: (region: RegionKey) => void;
}

/** Renders the dissolved region shapes, one per REGION_KEYS entry. Needs `path` from the
 * live projection context, so it must live inside <ComposableMap> — that's the only reason
 * this is a separate component. */
function RegionOverlay({ labels, selectableStyle, onEnterRegion }: RegionOverlayProps) {
  const { path } = useMapContext();
  const shapes = useMemo(
    () => REGION_KEYS.map((region) => ({ region, svgPath: path(REGION_MERGED_GEOMETRY[region]) ?? '' })),
    [path],
  );
  return (
    <>
      {shapes.map(({ region, svgPath }) => (
        <RegionGeography key={region} svgPath={svgPath} region={region} label={labels[region]} selectableStyle={selectableStyle} onActivate={onEnterRegion} />
      ))}
    </>
  );
}

interface Props {
  activeRegion: RegionKey | null;
  onEnterRegion: (region: RegionKey) => void;
  selectedCountryId: string | null;
  onSelectCountry: (id: string) => void;
}

/**
 * One world map. By default it's divided into dissolved regions (no country borders
 * showing yet) — click one and the camera zooms into it (2D pan/scale over a fixed
 * projection, see MAP_FRAMES) and it splits into its individual, selectable countries. A
 * "‹ Regions" affordance (rendered by the parent) zooms back out.
 */
/**
 * «Кабинет» selected-country marker (handoff screen 02): an accent dot with a 40pt ring and two
 * rings pulsing out of it, at the country's mainland centroid. Lives inside <ZoomableGroup>
 * (needs the live projection), so every size is divided by the current zoom `k` to stay a
 * constant on-screen size whatever the region zoom.
 */
function SelectedMarker({ countryId }: { countryId: string }) {
  const { projection } = useMapContext();
  const { k } = useZoomPanContext();
  const shape = useMemo(() => countryFeature(countryId), [countryId]);
  if (!shape) return null;
  const point = projection(mainlandCentroid(shape));
  if (!point) return null;
  const [x, y] = point;
  const s = 1 / (k || 1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} pointerEvents="none" aria-hidden>
      <circle r={20} fill="none" stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={1} />
      <circle className="ping" r={20} fill="none" stroke="var(--accent)" strokeWidth={1} />
      <circle className="ping ping-late" r={20} fill="none" stroke="var(--accent)" strokeWidth={1} />
      <circle r={4} fill="var(--accent)" className="marker-dot" />
    </g>
  );
}

export function WorldMap({ activeRegion, onEnterRegion, selectedCountryId, onSelectCountry }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const byId = useMemo(() => new Map(countries.map((c) => [c.id, c])), []);

  // numeric topology id -> which region (if any) owns that geography, and its alpha2.
  const geoIndex = useMemo(() => {
    const index: Record<string, { alpha2: string; region: RegionKey }> = {};
    for (const region of REGION_KEYS) {
      for (const [numericId, alpha2] of Object.entries(REGION_ISO_MAPS[region])) {
        index[numericId] = { alpha2, region };
      }
    }
    return index;
  }, []);

  const regionLabels = useMemo(() => {
    const labels = {} as Record<RegionKey, string>;
    for (const region of REGION_KEYS) labels[region] = ui.map.continents[region];
    return labels;
  }, [ui]);

  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleHoverStart = useCallback((label: string) => {
    setHoverLabel(label);
  }, []);
  const handleHoverEnd = useCallback(() => {
    setHoverLabel(null);
  }, []);

  // Tooltip follows the cursor via a direct style write (not React state) so
  // dragging the mouse across a large country doesn't re-render the whole map.
  const handlePointerMove = useCallback((e: ReactMouseEvent<HTMLDivElement>) => {
    const tooltip = tooltipRef.current;
    const container = containerRef.current;
    if (!tooltip || !container) return;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left + TOOLTIP_OFFSET;
    const y = e.clientY - rect.top + TOOLTIP_OFFSET;
    tooltip.style.transform = `translate(${x}px, ${y}px)`;
  }, []);

  // The one JS-driven layout decision in this component (see useViewport's doc comment): the
  // SVG viewBox's aspect ratio, the base projection's scale, and every region's center/zoom
  // all come from the current form factor's precomputed bucket — see MAP_FRAMES above. The
  // container fills its parent (`h-full w-full`) rather than forcing a square; `ComposableMap`'s
  // `preserveAspectRatio="xMidYMid meet"` (below) letterboxes any residual aspect mismatch
  // between the bucket and the live container evenly on both sides, so the world/region frame
  // is centered and never cropped.
  const viewport = useViewport();
  const bucket = MAP_FRAMES[pickMapFrameBucket(viewport)];
  const worldProjectionConfig = useMemo(
    () => ({ rotate: [0, 0, 0] as [number, number, number], scale: bucket.worldScale }),
    [bucket.worldScale],
  );
  const view = activeRegion ? bucket.regions[activeRegion] : WORLD_VIEW;
  // See STYLE_SELECTABLE_NO_HOVER's comment: no lingering gold hover tint on touch pointers.
  const selectableStyle = viewport.pointerFine ? STYLE_SELECTABLE : STYLE_SELECTABLE_NO_HOVER;

  return (
    <div ref={containerRef} className="relative h-full w-full" onMouseMove={handlePointerMove}>
      <ComposableMap
        projection="geoEqualEarth"
        projectionConfig={worldProjectionConfig}
        width={bucket.width}
        height={bucket.height}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        style={{ background: 'var(--map-ocean)' }}
      >
        <ZoomableGroup
          center={view.center}
          zoom={view.zoom}
          minZoom={1}
          maxZoom={MAX_ZOOM}
          translateExtent={[
            [0, 0],
            [bucket.width, bucket.height],
          ]}
        >
          <Geographies geography={worldTopology}>
            {({ geographies }: { geographies: RsmFeature[] }) =>
              geographies.map((geo) => {
                const entry = geoIndex[geo.id ?? ''];
                // A country is individually visible/interactive only once its region is
                // the active one — otherwise it's either represented by the region overlay
                // (world view) or simply off-screen (a different region is zoomed in).
                const isActiveCountry = entry !== undefined && entry.region === activeRegion;
                const alpha2 = isActiveCountry ? entry.alpha2 : null;
                const country = isActiveCountry ? byId.get(entry.alpha2) : undefined;
                const label = country ? loc(country.name, lang) : undefined;
                return (
                  <MapGeography
                    key={geo.rsmKey}
                    geo={geo}
                    isRegionMember={entry !== undefined}
                    showBackgroundContext={activeRegion === null}
                    alpha2={alpha2}
                    isSelected={activeRegion !== null && alpha2 === selectedCountryId}
                    label={label}
                    selectableStyle={selectableStyle}
                    onActivate={onSelectCountry}
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                  />
                );
              })
            }
          </Geographies>

          {activeRegion !== null && selectedCountryId && <SelectedMarker countryId={selectedCountryId} />}

          {activeRegion === null && (
            <RegionOverlay labels={regionLabels} selectableStyle={selectableStyle} onEnterRegion={onEnterRegion} />
          )}
        </ZoomableGroup>
      </ComposableMap>

      <div
        ref={tooltipRef}
        className="glass pointer-events-none absolute left-0 top-0 whitespace-nowrap rounded-chip px-sp-2 py-sp-1 text-caption font-medium text-(--text)"
        style={{ opacity: hoverLabel ? 1 : 0, transition: 'opacity 100ms ease' }}
      >
        {hoverLabel}
      </div>
    </div>
  );
}
