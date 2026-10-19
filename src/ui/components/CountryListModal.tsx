import { useState } from 'react';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { countries } from '../../data';

interface Props {
  onSelect: (id: string) => void;
  onClose: () => void;
  /** When set (an active map region), the list only shows that region's countries instead of
   * every playable country — see WorldMap.regionCountryIds. */
  regionCountryIds?: Set<string>;
}

/** Searchable fallback list — also the accessibility path for picking a country. */
export function CountryListModal({ onSelect, onClose, regionCountryIds }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const [query, setQuery] = useState('');
  const filtered = countries
    .filter((c) => !regionCountryIds || regionCountryIds.has(c.id))
    .filter((c) => loc(c.name, lang).toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => loc(a.name, lang).localeCompare(loc(b.name, lang), lang));

  return (
    // pointer-events-none on the backdrop (only the dialog panel itself is pointer-events-auto):
    // the country dossier lives inline in MapScreen's own layout rather than a competing
    // overlay (see CountryDossier), so while this list is open but nothing's been picked yet, a
    // previously-selected country's dossier and "Choose" button stay clickable underneath
    // instead of being blocked by this backdrop. Picking a country here closes the list and
    // hands off to the map (see MapScreen.selectFromList), same as clicking its shape would.
    <div className="scrim pointer-events-none fixed inset-0 z-20 flex items-center justify-center p-sp-4" role="dialog" aria-modal="true">
      <div className="dialog pointer-events-auto flex max-h-[80dvh] w-full max-w-150 flex-col px-sp-4 py-sp-3">
        <div className="flex shrink-0 items-center gap-sp-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ui.map.searchPlaceholder}
            autoFocus
            className="min-h-11 flex-1 rounded-btn border border-(--line) bg-(--bg) px-sp-3 text-label text-(--text) focus-visible:outline-2 focus-visible:outline-(--accent)"
          />
          <button type="button" className="btn btn-secondary min-h-11 text-label" onClick={onClose}>
            {ui.map.close}
          </button>
        </div>
        <div className="mt-sp-3 flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className="press flex min-h-11 w-full items-center gap-sp-2 rounded-btn px-sp-2 text-left hover:bg-(--selected) hover:text-(--accent)"
              onClick={() => onSelect(c.id)}
            >
              <span className="text-label">{c.flagEmoji}</span>
              <span className="text-label">{loc(c.name, lang)}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
