import { useState } from 'react';
import { LANGS, LANG_NAMES } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { HelpModal } from '../components/HelpModal';

export function SettingsScreen() {
  const { lang, setLang } = useLang();
  const toMenu = useGameStore((s) => s.toMenu);
  const resetTutorialForReplay = useTutorialStore((s) => s.resetForReplay);
  const ui = useUi();
  const [showHelp, setShowHelp] = useState(false);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-3">
      <div className="flex shrink-0 items-center gap-sp-3">
        <button type="button" className="btn min-h-11" onClick={toMenu}>
          {ui.gameOver.toMenu}
        </button>
        <h1 className="text-heading font-bold">{ui.settings.title}</h1>
      </div>

      <div className="panel w-full max-w-xs p-sp-3">
        <p className="eyebrow mb-sp-2">{ui.settings.language}</p>
        <div className="flex flex-col gap-sp-2">
          {LANGS.map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={l === lang}
              onClick={() => setLang(l)}
              className="min-h-11 border px-sp-3 py-sp-2 text-left text-label"
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

      <div className="panel w-full max-w-xs p-sp-3">
        <div className="flex flex-col gap-sp-2">
          <button type="button" className="btn min-h-11 text-left text-label" onClick={() => setShowHelp(true)}>
            {ui.help.title}
          </button>
          <button type="button" className="btn min-h-11 text-left text-label" onClick={resetTutorialForReplay}>
            {ui.tutorial.restart}
          </button>
        </div>
      </div>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
    </div>
  );
}
