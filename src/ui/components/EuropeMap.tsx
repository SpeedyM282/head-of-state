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
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'react-simple-maps';
import { loc } from '../../i18n';
import { useLang } from '../../store/langStore';
import { countries } from '../../data';
import { ISO_NUMERIC_TO_ALPHA2 } from '../../data/countries/isoNumeric';
import worldTopology from '../../assets/world-110m.json';

const MAP_WIDTH = 560;
const MAP_HEIGHT = 640;
// Centers the 18-country Europe set (see data/countries/isoNumeric.ts) inside the
// viewBox: rotate/scale were fit numerically against the vendored topology so the
// selectable countries fill the frame with even padding, not eyeballed.
const PROJECTION_CONFIG = { rotate: [-9, -58.5, 0] as [number, number, number], scale: 735.5 };
/** Offset (px) of the hover tooltip from the cursor so it doesn't sit under the pointer. */
const TOOLTIP_OFFSET = 14;

type GeographyStyle = { default: CSSProperties; hover: CSSProperties; pressed: CSSProperties };

const STYLE_CONTEXT: GeographyStyle = {
  default: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  hover: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
  pressed: { fill: 'var(--ink-soft)', stroke: 'var(--paper-line)', strokeWidth: 0.5, outline: 'none', pointerEvents: 'none' },
};
const STYLE_SELECTABLE: GeographyStyle = {
  default: { fill: 'var(--paper-dim)', stroke: 'var(--paper-line)', strokeWidth: 0.75, outline: 'none', cursor: 'pointer' },
  hover: { fill: 'var(--paper-dim)', stroke: 'var(--gold)', strokeWidth: 2, outline: 'none', cursor: 'pointer' },
  pressed: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 2, outline: 'none', cursor: 'pointer' },
};
const STYLE_SELECTED: GeographyStyle = {
  default: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 2, outline: 'none', cursor: 'pointer' },
  hover: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 2, outline: 'none', cursor: 'pointer' },
  pressed: { fill: 'var(--gold)', stroke: 'var(--gold)', strokeWidth: 2, outline: 'none', cursor: 'pointer' },
};

/** The subset of a react-simple-maps prepared feature that this component reads directly. */
interface RsmFeature {
  rsmKey: string;
  id?: string;
}

interface MapGeographyProps {
  geo: RsmFeature;
  alpha2: string | null;
  isSelected: boolean;
  label: string | undefined;
  onSelect: (id: string) => void;
  onHoverStart: (alpha2: string, label: string) => void;
  onHoverEnd: () => void;
}

/**
 * Memoized so panning/zooming (which re-invokes the <Geographies> children
 * render-prop every frame) only re-renders the one or two geographies whose
 * selection state actually changed, not all ~180 world shapes.
 */
const MapGeography = memo(function MapGeography({
  geo,
  alpha2,
  isSelected,
  label,
  onSelect,
  onHoverStart,
  onHoverEnd,
}: MapGeographyProps) {
  const handleClick = useCallback(() => {
    if (alpha2) onSelect(alpha2);
  }, [alpha2, onSelect]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<SVGPathElement>) => {
      if (!alpha2) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(alpha2);
      }
    },
    [alpha2, onSelect],
  );

  const handleMouseEnter = useCallback(() => {
    if (alpha2 && label) onHoverStart(alpha2, label);
  }, [alpha2, label, onHoverStart]);

  const style = alpha2 ? (isSelected ? STYLE_SELECTED : STYLE_SELECTABLE) : STYLE_CONTEXT;

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

interface Props {
  selectedCountryId: string | null;
  onSelect: (id: string) => void;
}

export function EuropeMap({ selectedCountryId, onSelect }: Props) {
  const lang = useLang((s) => s.lang);
  const byId = useMemo(() => new Map(countries.map((c) => [c.id, c])), []);

  const [hoverLabel, setHoverLabel] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleHoverStart = useCallback((_alpha2: string, label: string) => {
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

  return (
    <div ref={containerRef} className="relative" onMouseMove={handlePointerMove}>
      <ComposableMap
        projection="geoAzimuthalEqualArea"
        projectionConfig={PROJECTION_CONFIG}
        width={MAP_WIDTH}
        height={MAP_HEIGHT}
        className="h-auto w-full"
        style={{ background: 'var(--ink-soft)' }}
      >
        <ZoomableGroup
          minZoom={1}
          maxZoom={8}
          translateExtent={[
            [0, 0],
            [MAP_WIDTH, MAP_HEIGHT],
          ]}
        >
          <Geographies geography={worldTopology}>
            {({ geographies }: { geographies: RsmFeature[] }) =>
              geographies.map((geo) => {
                const alpha2 = ISO_NUMERIC_TO_ALPHA2[geo.id ?? ''] ?? null;
                const country = alpha2 ? byId.get(alpha2) : undefined;
                return (
                  <MapGeography
                    key={geo.rsmKey}
                    geo={geo}
                    alpha2={country ? alpha2 : null}
                    isSelected={alpha2 === selectedCountryId}
                    label={country ? loc(country.name, lang) : undefined}
                    onSelect={onSelect}
                    onHoverStart={handleHoverStart}
                    onHoverEnd={handleHoverEnd}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      <div
        ref={tooltipRef}
        className="pointer-events-none absolute left-0 top-0 whitespace-nowrap border border-(--paper-line) bg-(--paper) px-2 py-1 text-xs font-bold text-(--text-ink) shadow-sm"
        style={{ opacity: hoverLabel ? 1 : 0, transition: 'opacity 100ms ease' }}
      >
        {hoverLabel}
      </div>
    </div>
  );
}
