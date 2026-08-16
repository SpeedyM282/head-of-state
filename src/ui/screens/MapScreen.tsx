import { useState } from 'react';
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
    setListOpen(false);
    setSelectedCountryId(id);
  }

  return (
    <div className="flex min-h-[80dvh] flex-col gap-4">
      <div className="flex items-center justify-between">
        <button type="button" className="btn" onClick={toMenu}>
          {ui.gameOver.toMenu}
        </button>
        <button type="button" className="btn" onClick={() => setListOpen(true)}>
          {ui.map.listButton}
        </button>
      </div>

      {/* Region heading + back button, only while a region is zoomed in. Choosing a
          country happens by clicking it on the map — this row is orientation, not a picker. */}
      <div className="flex min-h-9 items-center justify-between">
        {activeRegion ? (
          <>
            <button
              type="button"
              onClick={() => setActiveRegion(null)}
              className="flex items-center gap-1 border border-(--paper-line) px-2 py-1 text-xs"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5 L7 10 L12 15" />
              </svg>
              {ui.map.backToRegions}
            </button>
            <span className="eyebrow">{ui.map.continents[activeRegion]}</span>
          </>
        ) : (
          <span className="eyebrow">{ui.map.chooseRegion}</span>
        )}
      </div>

      <div className="panel p-3">
        <WorldMap
          activeRegion={activeRegion}
          onEnterRegion={setActiveRegion}
          selectedCountryId={selectedCountryId}
          onSelectCountry={setSelectedCountryId}
        />
      </div>

      {listOpen && <CountryListModal onSelect={selectFromList} onClose={() => setListOpen(false)} />}

      {selectedCountryId && (
        <CountryDrawer countryId={selectedCountryId} onClose={() => setSelectedCountryId(null)} />
      )}
    </div>
  );
}
