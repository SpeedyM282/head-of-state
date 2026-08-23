import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { LANGS, LANG_NAMES } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { useTheme, type Theme } from '../../store/themeStore';
import { HelpModal, type HelpSection } from '../components/HelpModal';

type SettingsView = 'menu' | 'language' | 'theme' | 'reference';
const THEMES: Theme[] = ['light', 'dark', 'system'];

function ChevronLeftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 5 L7 10 L12 15" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 5 L13 10 L8 15" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 10.5 L8 14.5 L16 5.5" />
    </svg>
  );
}
function GlobeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M2.5 10h15M10 2.5c2.5 2 2.5 13 0 15M10 2.5c-2.5 2-2.5 13 0 15" />
    </svg>
  );
}
function ContrastIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
      <circle cx="10" cy="10" r="7.5" />
      <path d="M10 2.5a7.5 7.5 0 0 1 0 15Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 4.5c1.8-1 4-1 6 0v11c-2-1-4.2-1-6 0Z" />
      <path d="M17 4.5c-1.8-1-4-1-6 0v11c2-1 4.2-1 6 0Z" />
    </svg>
  );
}

export function SettingsScreen() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const toMenu = useGameStore((s) => s.toMenu);
  const startGame = useGameStore((s) => s.startGame);
  const resetTutorialForReplay = useTutorialStore((s) => s.resetForReplay);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const [view, setView] = useState<SettingsView>('menu');
  const [showHelp, setShowHelp] = useState(false);
  const [helpSection, setHelpSection] = useState<HelpSection | null>(null);

  function openHelp(section: HelpSection) {
    setHelpSection(section);
    setShowHelp(true);
  }

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

  // Esc mirrors the back chevron — same "detail -> menu -> previous screen" chain. Reads the
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
    <div className="flex min-h-0 flex-1 flex-col gap-sp-3 p-sp-3">
      {/* Shared header — every view. */}
      <div className="flex shrink-0 items-center gap-sp-3 border-b border-(--ink) pb-sp-1">
        <button
          type="button"
          onClick={goBack}
          aria-label={ui.gameOver.toMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center border border-(--paper-line) hover:bg-(--paper-dim)"
        >
          <ChevronLeftIcon />
        </button>
        <h1 className="text-heading font-bold">{headerTitle}</h1>
      </div>

      {view === 'menu' && (
        <div className="flex min-h-0 flex-1 flex-col gap-sp-2 overflow-y-auto">
          <button type="button" className="set-row" onClick={() => setView('language')}>
            <span className="shrink-0 text-(--gold)">
              <GlobeIcon />
            </span>
            <span className="text-label font-bold">{ui.settings.language}</span>
            <span className="ml-auto shrink-0 text-caption opacity-55">{LANG_NAMES[lang]}</span>
            <span className="shrink-0 opacity-42">
              <ChevronRightIcon />
            </span>
          </button>

          <button type="button" className="set-row" onClick={() => setView('theme')}>
            <span className="shrink-0 text-(--gold)">
              <ContrastIcon />
            </span>
            <span className="text-label font-bold">{ui.settings.theme}</span>
            <span className="ml-auto shrink-0 text-caption opacity-55">{ui.settings.themeOptions[theme]}</span>
            <span className="shrink-0 opacity-42">
              <ChevronRightIcon />
            </span>
          </button>

          <button type="button" className="set-row" onClick={() => setView('reference')}>
            <span className="shrink-0 text-(--gold)">
              <BookIcon />
            </span>
            <span className="text-label font-bold">{ui.help.title}</span>
            <span className="ml-auto shrink-0 text-caption opacity-55">{ui.settings.referenceValue}</span>
            <span className="shrink-0 opacity-42">
              <ChevronRightIcon />
            </span>
          </button>
        </div>
      )}

      {view === 'language' && (
        <div className="flex min-h-0 flex-1 flex-col gap-sp-1 overflow-y-auto">
          {LANGS.map((l) => {
            const active = l === lang;
            return (
              <button key={l} type="button" aria-pressed={active} className={`lang-row${active ? ' active' : ''}`} onClick={() => setLang(l)}>
                <span className="flex-1">{LANG_NAMES[l]}</span>
                {active && <CheckIcon />}
              </button>
            );
          })}
          <p className="mt-sp-1 text-caption italic opacity-60">{ui.settings.languageHint}</p>
        </div>
      )}

      {view === 'theme' && (
        <div className="flex min-h-0 flex-1 flex-col gap-sp-1 overflow-y-auto">
          {THEMES.map((t) => {
            const active = t === theme;
            return (
              <button key={t} type="button" aria-pressed={active} className={`lang-row${active ? ' active' : ''}`} onClick={() => setTheme(t)}>
                <ThemeSwatch theme={t} />
                <span className="flex-1">{ui.settings.themeOptions[t]}</span>
                {t === 'system' && <span className="shrink-0 text-caption opacity-55">{ui.settings.themeSystemNote}</span>}
                {active && <CheckIcon />}
              </button>
            );
          })}
          <p className="mt-sp-1 text-caption italic opacity-60">{ui.settings.themeHint}</p>
        </div>
      )}

      {view === 'reference' && (
        <div className="flex min-h-0 flex-1 gap-sp-4 overflow-y-auto">
          <div className="flex-1">
            <p className="eyebrow mb-sp-1">{ui.settings.sectionsKicker}</p>
            {(
              [
                { section: 'stats', label: ui.help.stats.heading },
                { section: 'vector', label: ui.help.vector.heading },
                { section: 'elections', label: ui.help.elections.heading },
                { section: 'defeats', label: ui.help.defeats.heading },
              ] as const
            ).map(({ section, label }) => (
              <button key={section} type="button" className="ref-item" onClick={() => openHelp(section)}>
                {label}
              </button>
            ))}
          </div>
          <div className="w-[196px] shrink-0 border-l border-(--paper-line) pl-sp-4">
            <p className="eyebrow mb-sp-2">{ui.settings.tutorialKicker}</p>
            <button type="button" className="btn btn-secondary min-h-11 w-full" onClick={replayTutorial}>
              {ui.tutorial.restart}
            </button>
          </div>
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} initialSection={helpSection ?? undefined} />}
    </div>
  );
}

/** 20×20 preview chip for each theme choice: solid paper/ink fills for light/dark, a split-
 * diagonal gradient of both for "system". */
function ThemeSwatch({ theme }: { theme: Theme }) {
  const style: CSSProperties =
    theme === 'light'
      ? { background: '#f3f2f2', border: '1px solid var(--ink)' }
      : theme === 'dark'
        ? { background: '#1a1917', border: '1px solid var(--paper-line)' }
        : { background: 'linear-gradient(135deg, #f3f2f2 50%, #1a1917 50%)', border: '1px solid var(--paper-line)' };
  return <span className="h-5 w-5 shrink-0" style={style} aria-hidden />;
}
