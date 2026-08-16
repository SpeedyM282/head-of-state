import { LANGS, LANG_NAMES } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';

export function SettingsScreen() {
  const { lang, setLang } = useLang();
  const toMenu = useGameStore((s) => s.toMenu);
  const ui = useUi();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 tablet:gap-4">
      <div className="flex shrink-0 items-center gap-3">
        <button type="button" className="btn min-h-11" onClick={toMenu}>
          {ui.gameOver.toMenu}
        </button>
        <h1 className="text-lg font-bold">{ui.settings.title}</h1>
      </div>

      <div className="panel w-full max-w-xs p-3 tablet:p-4">
        <p className="eyebrow mb-2">{ui.settings.language}</p>
        <div className="flex flex-col gap-1.5">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className="min-h-11 border px-3 py-2 text-left text-sm"
              style={{
                borderColor: l === lang ? 'var(--gold)' : 'var(--paper-line)',
                background: l === lang ? 'var(--gold)' : 'transparent',
                color: 'var(--text-ink)',
                fontWeight: l === lang ? 700 : 400,
              }}
            >
              {LANG_NAMES[l]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
