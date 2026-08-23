import { useEffect, useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { WorldMap, regionCountryIds, type RegionKey } from '../components/WorldMap';
import { CountryListModal } from '../components/CountryListModal';
import { CountryDossier } from '../components/CountryDossier';
import { RegionInfo } from '../components/RegionInfo';

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5 L7 10 L12 15" />
    </svg>
  );
}

/** Purely decorative print-registration mark, top-left of the map pane — the gazette's CMYK
 * plate-alignment furniture, echoing the numeral treatment elsewhere (see CmykNumeral). */
function RegistrationMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="var(--ink)" strokeWidth="1" aria-hidden className="opacity-50">
      <circle cx="8" cy="8" r="5" />
      <path d="M8 0v16M0 8h16" />
    </svg>
  );
}

export function MapScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  function selectFromList(id: string) {
    // The list stays open: picking a country shows its dossier alongside it, so the player
    // can keep browsing/comparing other countries without reopening the list each time.
    setSelectedCountryId(id);
  }

  // One contextual back control, same pattern as Settings' back chevron: a region exits to the
  // world overview; the overview itself exits to the main menu.
  function goBack() {
    if (activeRegion) {
      setActiveRegion(null);
      setSelectedCountryId(null);
    } else {
      toMenu();
    }
  }

  // Esc closes whichever overlay is open first — the list modal, then the country dossier —
  // before falling back to the contextual back navigation above.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      if (listOpen) setListOpen(false);
      else if (selectedCountryId) setSelectedCountryId(null);
      else goBack();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listOpen, selectedCountryId, activeRegion, toMenu]);

  return (
    <div className="flex min-h-0 flex-1 gap-sp-3 p-sp-2">
      {/* Back/list controls are overlaid on the map pane itself rather than a separate header
          row above it, so the pane fills the full height the screen has to give it. */}
      <div className="relative min-h-0 flex-1 overflow-hidden border border-(--ink)" style={{ background: 'var(--map-ocean)' }}>
        <WorldMap
          activeRegion={activeRegion}
          onEnterRegion={setActiveRegion}
          selectedCountryId={selectedCountryId}
          onSelectCountry={setSelectedCountryId}
        />

        <div className="pointer-events-none absolute left-2 top-2 flex items-center gap-sp-2">
          <button
            type="button"
            onClick={goBack}
            aria-label={activeRegion ? ui.map.backToRegions : ui.gameOver.toMenu}
            className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center border border-(--paper-line) bg-(--paper) hover:bg-(--paper-dim)"
          >
            <ChevronLeftIcon />
          </button>
          {!activeRegion && (
            <span className="truncate border border-(--paper-line) bg-(--paper) px-sp-2 py-sp-1 text-caption font-bold text-(--text-ink) shadow-sm">
              {ui.map.chooseRegion}
            </span>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary absolute right-2 top-2 min-h-11 shrink-0 text-caption"
          onClick={() => setListOpen(true)}
        >
          {ui.map.listButton}
        </button>

        <div className="pointer-events-none absolute bottom-2 right-2">
          <RegistrationMark />
        </div>
        {activeRegion && (
          <div
            className="pointer-events-none absolute bottom-2 border border-(--paper-line) bg-(--paper) px-sp-2 py-sp-1 text-caption font-bold text-(--text-ink) shadow-sm"
            style={{ left: 'calc(0.5rem + env(safe-area-inset-left, 0px))' }}
          >
            {ui.map.continents[activeRegion]}
          </div>
        )}
      </div>

      {selectedCountryId ? <CountryDossier countryId={selectedCountryId} /> : activeRegion && <RegionInfo region={activeRegion} />}

      {listOpen && (
        <CountryListModal
          onSelect={selectFromList}
          onClose={() => setListOpen(false)}
          regionCountryIds={activeRegion ? regionCountryIds(activeRegion) : undefined}
        />
      )}
    </div>
  );
}
