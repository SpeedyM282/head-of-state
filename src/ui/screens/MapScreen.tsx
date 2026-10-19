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
        zoomControlClassName="bottom-dp-80 right-dp-80"
      />

      {/* Floating chrome, inset by the safe area (landscape phones: notch on the left/right). */}
      <div
        className="pointer-events-none absolute inset-0 px-sp-5 py-sp-4 desktop:pt-dp-72"
        style={{ paddingLeft: 'max(var(--spacing-sp-5), env(safe-area-inset-left))', paddingRight: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
      >
        <div className="card pointer-events-auto flex max-h-full w-[232px] flex-col gap-sp-1 overflow-y-auto px-sp-3 py-sp-3 tablet:w-[260px] desktop:max-h-[calc(100%-var(--dp)*72)] desktop:w-dp-600 desktop:gap-dp-22 desktop:rounded-dp-30 desktop:px-dp-44 desktop:py-dp-40">
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

        {/* Phone: a «Списком» pill. Desktop: a search field look-alike (480×64) that opens the
            same searchable list. */}
        <button
          type="button"
          className="glass press pointer-events-auto absolute top-sp-4 min-h-11 rounded-btn px-sp-3 text-label font-medium desktop:hidden"
          style={{ right: 'max(var(--spacing-sp-5), env(safe-area-inset-right))' }}
          onClick={() => setListOpen(true)}
        >
          {ui.map.listButton}
        </button>
        <button
          type="button"
          className="glass press pointer-events-auto absolute right-dp-80 top-dp-72 hidden h-dp-64 w-dp-480 items-center gap-dp-14 rounded-dp-18 px-dp-24 text-left text-(--muted) desktop:flex"
          onClick={() => setListOpen(true)}
        >
          <span className="text-dp-22" aria-hidden>
            ⌕
          </span>
          <span className="text-dp-19">{ui.map.searchPill}</span>
        </button>

        <p className="absolute bottom-sp-4 right-[max(var(--spacing-sp-5),env(safe-area-inset-right))] text-caption text-(--muted) desktop:bottom-dp-96 desktop:left-dp-80 desktop:right-auto desktop:text-dp-19">
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
