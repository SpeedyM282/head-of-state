import { useState } from 'react';
import { loc } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { countries } from '../../data';

interface Props {
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** Searchable fallback list — also the accessibility path for picking a country. */
export function CountryListModal({ onSelect, onClose }: Props) {
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  const [query, setQuery] = useState('');
  const filtered = countries.filter((c) => loc(c.name, lang).toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/60 p-sp-4" role="dialog" aria-modal="true">
      <div className="panel flex max-h-[80dvh] w-full max-w-150 flex-col p-sp-4">
        <div className="flex shrink-0 items-center gap-sp-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={ui.map.searchPlaceholder}
            autoFocus
            className="flex-1 border border-(--paper-line) bg-(--paper-dim) px-sp-3 py-sp-2 text-label text-(--text-ink) focus-visible:outline-2 focus-visible:outline-(--gold)"
          />
          <button type="button" className="btn min-h-11" onClick={onClose}>
            {ui.map.close}
          </button>
        </div>
        <div className="mt-sp-3 flex-1 overflow-y-auto">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className="flex min-h-11 w-full items-center gap-sp-2 border-b border-(--paper-line) py-sp-2 text-left hover:bg-(--paper-dim)"
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
