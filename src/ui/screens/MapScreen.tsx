import { useEffect, useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { WorldMap, regionCountryIds, regionForCountry, type RegionKey } from '../components/WorldMap';
import { CountryListModal } from '../components/CountryListModal';
import { CountryDossier } from '../components/CountryDossier';
import { RegionInfo } from '../components/RegionInfo';

/**
 * «Кабинет» country select (handoff screen 02): the whole-world map fills the screen; a floating
 * card at the top-left carries the back button, the «Выбор страны» kicker and — depending on
 * the drill-down — a hint, the active region's summary, or the picked country's dossier with
 * «Выбрать». The region pan/zoom drill-down and the list search are unchanged.
 */
export function MapScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
  const [activeRegion, setActiveRegion] = useState<RegionKey | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
  const [listOpen, setListOpen] = useState(false);

  function selectFromList(id: string) {
    // Closing the list and jumping the map to the picked country's region keeps the search
    // path in sync with clicking a shape directly — the country ends up highlighted/zoomed on
    // the map, not just named in the card. Absurdistan (list view only, no map region)
    // leaves activeRegion untouched, matching how it already has no map presence.
    const region = regionForCountry(id);
    if (region) setActiveRegion(region);
    setSelectedCountryId(id);
    setListOpen(false);
  }

  // One contextual back control: a region (or a list-picked country) exits to the world
  // overview; the overview itself exits to the main menu.
  function goBack() {
    if (activeRegion || selectedCountryId) {
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
      else if (selectedCountryId && activeRegion) setSelectedCountryId(null);
      else goBack();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [listOpen, selectedCountryId, activeRegion, toMenu]);

  return (
    <div className="fixed inset-0 overflow-hidden bg-(--map-ocean)">
      <WorldMap
        activeRegion={activeRegion}
        onEnterRegion={setActiveRegion}
        selectedCountryId={selectedCountryId}
        onSelectCountry={setSelectedCountryId}
      />

      {/* Floating chrome, inset by the safe area (landscape phones: notch on the left/right). */}
      <div
        className="pointer-events-none absolute inset-0 px-sp-5 py-sp-4"
        style={{ paddingLeft: 'max(var(--spacing-sp-5), env(safe-area-inset-left))', paddingRight: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
      >
        <div className="card pointer-events-auto flex max-h-full w-[232px] flex-col gap-sp-1 overflow-y-auto px-sp-3 py-sp-3 tablet:w-[260px]">
          <div className="flex items-center gap-sp-2">
            <button
              type="button"
              onClick={goBack}
              aria-label={activeRegion ? ui.map.backToRegions : ui.gameOver.toMenu}
              // min-h-9 touch target in a dense card header (the mock's 26pt back box, scaled).
              className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-chip border border-(--line) text-label"
            >
              <span aria-hidden>←</span>
            </button>
            <p className="eyebrow truncate">{activeRegion ? ui.map.continents[activeRegion] : ui.map.kicker}</p>
          </div>

          {selectedCountryId ? (
            <CountryDossier countryId={selectedCountryId} />
          ) : activeRegion ? (
            <RegionInfo region={activeRegion} />
          ) : (
            <>
              <h2 className="font-serif text-heading leading-none">{ui.map.chooseRegion}</h2>
              <p className="flavor text-caption">{ui.map.hint}</p>
            </>
          )}
        </div>

        <button
          type="button"
          className="glass press pointer-events-auto absolute top-sp-4 min-h-11 rounded-btn px-sp-3 text-label font-medium"
          style={{ right: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
          onClick={() => setListOpen(true)}
        >
          {ui.map.listButton}
        </button>

        <p
          className="absolute bottom-sp-4 text-caption text-(--muted)"
          style={{ right: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
        >
          {ui.map.hint}
        </p>
      </div>

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
