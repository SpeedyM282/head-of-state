import { useEffect, useRef, useState } from 'react';
import { LANG_NAMES, LANGS } from '../../i18n';
import { useLang } from '../../store/langStore';

/** Language selector as a custom dropdown that always opens directly under the trigger. */
export function LangSwitcher({ className = '' }: { className?: string }) {
  const { lang, setLang } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.target instanceof Node && ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className={className}>
      <div ref={ref} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label="Language"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 border px-2 py-1 text-xs"
          style={{ borderColor: 'var(--paper-line)', background: 'var(--paper)', color: 'var(--text-ink)' }}
        >
          {LANG_NAMES[lang]}
          <span aria-hidden>▾</span>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute right-0 top-full z-40 mt-1 min-w-full border"
            style={{ borderColor: 'var(--paper-line)', background: 'var(--paper)' }}
          >
            {LANGS.map((l) => (
              <li key={l} role="option" aria-selected={l === lang}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l);
                    setOpen(false);
                  }}
                  className="block w-full px-2 py-1 text-left text-xs"
                  style={{
                    color: 'var(--text-ink)',
                    background: l === lang ? 'var(--gold)' : 'transparent',
                    fontWeight: l === lang ? 700 : 400,
                  }}
                >
                  {LANG_NAMES[l]}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
