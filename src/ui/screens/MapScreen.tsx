import { useState } from 'react';
import { useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { EuropeMap } from '../components/EuropeMap';
import { CountryListModal } from '../components/CountryListModal';
import { CountryDrawer } from '../components/CountryDrawer';

export function MapScreen() {
  const ui = useUi();
  const toMenu = useGameStore((s) => s.toMenu);
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

      <div className="panel p-3">
        <EuropeMap selectedCountryId={selectedCountryId} onSelect={setSelectedCountryId} />
      </div>

      {listOpen && <CountryListModal onSelect={selectFromList} onClose={() => setListOpen(false)} />}

      {selectedCountryId && (
        <CountryDrawer countryId={selectedCountryId} onClose={() => setSelectedCountryId(null)} />
      )}
    </div>
  );
}
