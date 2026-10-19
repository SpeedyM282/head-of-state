import { useEffect, useRef, useState } from 'react';
import { LANGS, LANG_NAMES } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { useTheme, type Theme } from '../../store/themeStore';
import { HelpSections } from '../components/HelpSections';
import { TopBar } from '../components/TopBar';

type SettingsView = 'menu' | 'language' | 'theme' | 'reference';
const THEMES: Theme[] = ['light', 'dark', 'system'];

export function SettingsScreen() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const toMenu = useGameStore((s) => s.toMenu);
  const startGame = useGameStore((s) => s.startGame);
  const resetTutorialForReplay = useTutorialStore((s) => s.resetForReplay);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const [view, setView] = useState<SettingsView>('menu');

  // "Пройти обучение заново" — an immediate action, not a setting toggle: launches the same
  // Absurdistan/easy scripted opening as the menu's tutorial prompt (see MenuScreen.startTutorial),
  // discarding any in-progress save exactly as that flow already does.
  function replayTutorial() {
    resetTutorialForReplay();
    startGame('absurdistan', 'easy');
    beginScripted();
  }

  function goBack() {
    if (view === 'menu') toMenu();
    else setView('menu');
  }

  // Esc mirrors the back button — same "detail -> hub -> previous screen" chain. Reads the
  // latest goBack via a ref (rather than listing it as a dependency) so the listener is
  // attached once, not re-bound on every view change.
  const goBackRef = useRef(goBack);
  goBackRef.current = goBack;
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') goBackRef.current();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const headerTitle =
    view === 'menu' ? ui.settings.title : view === 'language' ? ui.settings.language : view === 'theme' ? ui.settings.theme : ui.help.title;

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-4 px-sp-5 py-sp-3">
      <TopBar
        title={headerTitle}
        onBack={goBack}
        backLabel={ui.gameOver.toMenu}
        action={
          view === 'reference' ? (
            // min-h-9 touch target; the mock's 28pt-tall header button, scaled.
            <button type="button" className="btn btn-secondary min-h-9 px-sp-3 text-caption" onClick={replayTutorial}>
              {ui.tutorial.restart}
            </button>
          ) : undefined
        }
      />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'menu' && (
          <>
            <div className="grouped">
              <HubRow label={ui.settings.language} value={LANG_NAMES[lang]} onClick={() => setView('language')} />
              <HubRow label={ui.settings.theme} value={ui.settings.themeOptions[theme]} onClick={() => setView('theme')} />
              <HubRow label={ui.help.title} value={ui.settings.referenceValue} onClick={() => setView('reference')} />
            </div>
            <p className="flavor mt-sp-3 text-caption">{ui.settings.footer}</p>
          </>
        )}

        {view === 'language' && (
          <div className="flex items-start gap-sp-5">
            <div className="flex w-[300px] shrink-0 flex-col gap-sp-1">
              {LANGS.map((l) => {
                const active = l === lang;
                return (
                  <button key={l} type="button" aria-pressed={active} className={`choice-row press text-label${active ? ' active' : ''}`} onClick={() => setLang(l)}>
                    <span className="flex-1">{LANG_NAMES[l]}</span>
                    {active && <span aria-hidden>✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="flavor max-w-[200px] pt-sp-2 text-label">{ui.settings.languageHint}</p>
          </div>
        )}

        {view === 'theme' && (
          <>
            <div className="grid grid-cols-3 gap-sp-3">
              {THEMES.map((t) => (
                <ThemeCard key={t} theme={t} label={ui.settings.themeOptions[t]} active={t === theme} onClick={() => setTheme(t)} />
              ))}
            </div>
            <p className="flavor mt-sp-3 text-caption">{ui.settings.themeHint}</p>
          </>
        )}

        {view === 'reference' && <HelpSections />}
      </div>

    </div>
  );
}

/** Settings hub row: label, current value, chevron — 52pt tall in the mock. */
function HubRow({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <button type="button" className="grouped-row press min-h-13 text-label font-medium" onClick={onClick}>
      <span className="flex-1">{label}</span>
      <span className="text-caption font-normal text-(--muted)">{value}</span>
      <span className="text-(--muted)" aria-hidden>›</span>
    </button>
  );
}

/** Theme choice card: a 96pt-tall live preview of that theme (mini title, two bars, an
 * accent button) over a radio and label. The «Системная» preview is split diagonally. The
 * preview colors come from .theme-preview-light/-dark, which re-scope the role tokens. */
function ThemeCard({ theme, label, active, onClick }: { theme: Theme; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press overflow-hidden rounded-tile border-2 text-left ${active ? 'border-(--accent)' : 'border-(--line)'}`}
    >
      <div className="relative h-24">
        {theme === 'system' ? (
          <>
            <ThemePreview variant="light" />
            <div className="absolute inset-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}>
              <ThemePreview variant="dark" />
            </div>
          </>
        ) : (
          <ThemePreview variant={theme} />
        )}
      </div>
      <div className="flex items-center gap-sp-2 px-sp-3 py-sp-2 text-label font-medium">
        <span className={`flex h-3 w-3 items-center justify-center rounded-full border ${active ? 'border-(--accent)' : 'border-(--muted)'}`} aria-hidden>
          {active && <span className="beat h-1.5 w-1.5 rounded-full bg-(--accent)" />}
        </span>
        <span className={active ? 'text-(--accent)' : ''}>{label}</span>
      </div>
    </button>
  );
}

function ThemePreview({ variant }: { variant: 'light' | 'dark' }) {
  const ui = useUi();
  return (
    <div className={`theme-preview-${variant} absolute inset-0 flex flex-col gap-sp-1 bg-(--bg) p-sp-3`} aria-hidden>
      <span className="font-serif text-label leading-none text-(--text)">{ui.menu.title[0]}</span>
      <span className="mt-sp-1 h-0.5 w-4/5 bg-(--line)">
        <span className="block h-full w-3/5 bg-(--accent)" />
      </span>
      <span className="h-0.5 w-3/5 bg-(--line)">
        <span className="block h-full w-2/5 bg-(--warning)" />
      </span>
      <span className="mt-auto h-3 w-12 rounded-sm bg-(--accent)" />
    </div>
  );
}
