import { useEffect, useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { WorldMap, type RegionKey } from '../components/WorldMap';
import { CountryListModal } from '../components/CountryListModal';
import { CountryDrawer } from '../components/CountryDrawer';

export function MapScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  function selectFromList(id: string) {
    // The list stays open: picking a country shows its dossier drawer alongside it, so the
    // player can keep browsing/comparing other countries without reopening the list each time.
    setSelectedCountryId(id);
  }

  // Esc closes whichever overlay is open — the list modal first (it sits on top when both
  // could theoretically be set), then the country dossier drawer.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (listOpen) setListOpen(false);
      else if (selectedCountryId) setSelectedCountryId(null);
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listOpen, selectedCountryId]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 tablet:gap-3">
      {/* One compact row: back-to-menu, region back/heading, and the list-view fallback —
          keeps the map itself as tall as possible in phone landscape's scarce vertical space. */}
      <div className="flex shrink-0 items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <button
            type="button"
            onClick={toMenu}
            aria-label={ui.gameOver.toMenu}
            className="flex h-11 w-11 shrink-0 items-center justify-center border border-(--paper-line) hover:bg-(--paper-dim) desktop:h-9 desktop:w-9"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M12 5 L7 10 L12 15" />
            </svg>
          </button>
          {activeRegion ? (
            <button
              type="button"
              onClick={() => setActiveRegion(null)}
              className="flex min-h-11 shrink-0 items-center gap-1 border border-(--paper-line) px-2 text-xs hover:bg-(--paper-dim)"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5 L7 10 L12 15" />
              </svg>
              {ui.map.backToRegions}
            </button>
          ) : (
            <span className="eyebrow truncate">{ui.map.chooseRegion}</span>
          )}
        </div>
        <button type="button" className="btn min-h-11 shrink-0" onClick={() => setListOpen(true)}>
          {ui.map.listButton}
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden border border-(--paper-line)" style={{ background: 'var(--ink-soft)' }}>
        <WorldMap
          activeRegion={activeRegion}
          onEnterRegion={setActiveRegion}
          selectedCountryId={selectedCountryId}
          onSelectCountry={setSelectedCountryId}
        />
        {/* Active region's name, overlaid bottom-left of the map itself instead of the
            control row above — reads like a map label, out of the way of the shapes. */}
        {activeRegion && (
          <div
            className="pointer-events-none absolute bottom-2 border border-(--paper-line) bg-(--paper) px-2 py-1 text-xs font-bold text-(--text-ink) shadow-sm tablet:bottom-3"
            style={{ left: 'calc(0.5rem + env(safe-area-inset-left, 0px))' }}
          >
            {ui.map.continents[activeRegion]}
          </div>
        )}
      </div>

      {listOpen && <CountryListModal onSelect={selectFromList} onClose={() => setListOpen(false)} />}

      {selectedCountryId && (
        <CountryDrawer countryId={selectedCountryId} onClose={() => setSelectedCountryId(null)} />
      )}
    </div>
  );
}
