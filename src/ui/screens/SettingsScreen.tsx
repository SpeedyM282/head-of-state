import { useEffect, useRef, useState } from 'react';
import { LANGS, LANG_NAMES } from '../../i18n';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { useTutorialStore } from '../../store/tutorialStore';
import { useTheme, type Theme } from '../../store/themeStore';
import { HelpSections } from '../components/HelpSections';
import { TopBar } from '../components/TopBar';
import { classifyFormFactor, useViewport } from '../hooks/useViewport';

type Section = 'language' | 'theme' | 'reference';
type SettingsView = 'menu' | Section;
const THEMES: Theme[] = ['light', 'dark', 'system'];

/**
 * Settings. Phone/tablet (handoff screens 07–10): a navigation stack — a hub of three rows, each
 * pushing its detail view. Desktop (desktop handoff 07–09): master–detail — a sidebar of the
 * same three rows on the left and the selected section on the right; there is no hub, and
 * opening Settings selects Язык.
 */
export function SettingsScreen() {
  const { lang, setLang } = useLang();
  const { theme, setTheme } = useTheme();
  const toMenu = useGameStore((s) => s.toMenu);
  const startGame = useGameStore((s) => s.startGame);
  const resetTutorialForReplay = useTutorialStore((s) => s.resetForReplay);
  const beginScripted = useTutorialStore((s) => s.beginScripted);
  const ui = useUi();
  const isDesktop = classifyFormFactor(useViewport()) === 'desktop';
  const [view, setView] = useState<SettingsView>('menu');
  // On desktop the hub doesn't exist — the sidebar is always there and a section is always open.
  const shown: SettingsView = isDesktop && view === 'menu' ? 'language' : view;

  // "Пройти обучение заново" — an immediate action, not a setting toggle: launches the same
  // Absurdistan/easy scripted opening as the menu's tutorial prompt (see MenuScreen.startTutorial),
  // discarding any in-progress save exactly as that flow already does.
  function replayTutorial() {
    resetTutorialForReplay();
    startGame('absurdistan', 'easy');
    beginScripted();
  }

  function goBack() {
    if (isDesktop || view === 'menu') toMenu();
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

  const sectionTitle: Record<Section, string> = { language: ui.settings.language, theme: ui.settings.theme, reference: ui.help.title };
  const sectionValue: Record<Section, string> = {
    language: LANG_NAMES[lang],
    theme: ui.settings.themeOptions[theme],
    reference: ui.settings.referenceValue,
  };
  const headerTitle = isDesktop || shown === 'menu' ? ui.settings.title : sectionTitle[shown];

  const body = (section: Section) => {
    switch (section) {
      case 'language':
        return (
          <div className="flex items-start gap-sp-5 desktop:flex-col desktop:gap-dp-20">
            <div className="flex w-[300px] shrink-0 flex-col gap-sp-1 desktop:w-dp-560 desktop:gap-dp-12">
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
            <p className="flavor max-w-[200px] pt-sp-2 text-label desktop:max-w-dp-560 desktop:pt-0 desktop:text-dp-22">{ui.settings.languageHint}</p>
          </div>
        );
      case 'theme':
        return (
          <>
            <div className="grid grid-cols-3 gap-sp-3 desktop:gap-dp-24">
              {THEMES.map((t) => (
                <ThemeCard key={t} theme={t} label={ui.settings.themeOptions[t]} active={t === theme} onClick={() => setTheme(t)} />
              ))}
            </div>
            <p className="flavor mt-sp-3 text-caption desktop:text-dp-22">{ui.settings.themeHint}</p>
          </>
        );
      case 'reference':
        return <HelpSections />;
    }
  };

  const restartAction =
    shown === 'reference' ? (
      // min-h-9 touch target; the mock's 28pt-tall header button (52 on desktop), scaled.
      <button type="button" className="btn btn-secondary min-h-9 px-sp-3 text-caption desktop:min-h-dp-52 desktop:px-dp-26 desktop:text-dp-19" onClick={replayTutorial}>
        {ui.tutorial.restart}
      </button>
    ) : undefined;

  if (isDesktop) {
    const section = shown === 'menu' ? 'language' : shown;
    return (
      <div className="flex min-h-0 flex-1 flex-col px-sp-5 pb-dp-72 pt-sp-4">
        <TopBar title={headerTitle} onBack={goBack} backLabel={ui.gameOver.toMenu} action={restartAction} />
        <div className="mt-dp-56 flex min-h-0 flex-1 gap-sp-5">
          <nav
            className="flex w-dp-420 shrink-0 flex-col gap-dp-4 self-start rounded-card border border-(--card-border) bg-(--surface) p-dp-10"
            aria-label={ui.settings.title}
          >
            {(['language', 'theme', 'reference'] as const).map((s) => {
              const active = s === section;
              return (
                <button
                  key={s}
                  type="button"
                  aria-current={active ? 'true' : undefined}
                  onClick={() => setView(s)}
                  className={`press flex h-dp-76 items-center gap-dp-16 rounded-dp-18 px-dp-26 text-left ${active ? 'bg-(--selected)' : ''}`}
                >
                  <span className={`text-dp-23 font-medium ${active ? 'text-(--accent)' : ''}`}>{sectionTitle[s]}</span>
                  <span className="ml-auto text-dp-18 text-(--muted)">{sectionValue[s]}</span>
                </button>
              );
            })}
          </nav>
          <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-sp-3 overflow-y-auto pt-dp-10">
            <p className="eyebrow">{sectionTitle[section]}</p>
            {body(section)}
          </section>
        </div>
        {section === 'language' && <p className="flavor shrink-0 text-dp-22">{ui.settings.footer}</p>}
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-sp-4 px-sp-5 py-sp-3">
      <TopBar title={headerTitle} onBack={goBack} backLabel={ui.gameOver.toMenu} action={restartAction} />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {shown === 'menu' ? (
          <>
            <div className="grouped">
              <HubRow label={ui.settings.language} value={sectionValue.language} onClick={() => setView('language')} />
              <HubRow label={ui.settings.theme} value={sectionValue.theme} onClick={() => setView('theme')} />
              <HubRow label={ui.help.title} value={sectionValue.reference} onClick={() => setView('reference')} />
            </div>
            <p className="flavor mt-sp-3 text-caption">{ui.settings.footer}</p>
          </>
        ) : (
          body(shown)
        )}
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
 * accent button) over a radio and label (desktop: 220px preview, 24px radio). The «Системная»
 * preview is split diagonally. The preview colors come from .theme-preview-light/-dark, which
 * re-scope the role tokens. */
function ThemeCard({ theme, label, active, onClick }: { theme: Theme; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`press overflow-hidden rounded-tile border-2 text-left desktop:border-3 ${active ? 'border-(--accent)' : 'border-(--line)'}`}
    >
      <div className="relative h-24 desktop:h-dp-220">
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
      <div className="flex items-center gap-sp-2 px-sp-3 py-sp-2 text-label font-medium desktop:text-dp-21">
        <span
          className={`flex h-3 w-3 items-center justify-center rounded-full border desktop:h-dp-24 desktop:w-dp-24 desktop:border-2 ${active ? 'border-(--accent)' : 'border-(--muted)'}`}
          aria-hidden
        >
          {active && <span className="beat h-1.5 w-1.5 rounded-full bg-(--accent) desktop:h-dp-10 desktop:w-dp-10" />}
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
      <span className="font-serif text-label leading-none text-(--text) desktop:text-dp-40 desktop:font-light">{ui.menu.title[0]}</span>
      <span className="mt-sp-1 h-0.5 w-4/5 bg-(--line) desktop:h-dp-4 desktop:w-dp-180">
        <span className="block h-full w-3/5 bg-(--accent)" />
      </span>
      <span className="h-0.5 w-3/5 bg-(--line) desktop:h-dp-4 desktop:w-dp-130">
        <span className="block h-full w-2/5 bg-(--warning)" />
      </span>
      <span className="mt-auto h-3 w-12 rounded-sm bg-(--accent) desktop:h-dp-36 desktop:w-dp-110 desktop:rounded-dp-10" />
    </div>
  );
}
