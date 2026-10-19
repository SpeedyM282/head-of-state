import { lazy, Suspense, useEffect, useState } from 'react';
import type { GameContent, GameState, StatKey } from '../../core/types';
import { gameDate, loc, type Ui } from '../../i18n';
import type { Lang } from '../../core/types';
import { isDangerous } from '../../data/statMeta';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { EventModal } from '../components/EventModal';
import { ReformsPanel } from '../components/ReformsPanel';
import { SpeedControls } from '../components/SpeedControls';
import { MeterRow } from '../components/MeterRow';
import { formatPopulation } from '../components/CountryDossier';
import { toRoman } from '../roman';
import { useMedalStore } from '../../store/medalStore';
import { MEDALS } from '../../data/medals';

// The vector map (d3-geo + the vendored TopoJSON) shares the lazily-loaded map chunk with the
// country select screen, keeping the menu path light.
const CountryMap = lazy(() => import('../components/CountryMap').then((m) => ({ default: m.CountryMap })));

const STAT_ORDER: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/** Months before an election at which the agenda panel starts talking about it. */
const ELECTION_AGENDA_MONTHS = 6;

/**
 * «Кабинет» main screen (handoff screen 03): the player's country map fills the screen and
 * everything else floats over it in compact glass panels — term/date/influence on top, the
 * seven stats on the left, the agenda on the right, clock and «Реформы» at the bottom, a news
 * ticker under that. The governance vector lives on the reforms screen, not here.
 */
export function MainScreen() {
  const { state, content, reformsOpen, openReforms, closeReforms, startClock, stopClock, toMenu, speed, setSpeed } = useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();
  // An event the player tucked away into its map pin (by tapping the scrim) — keyed by event
  // id, so the next event always opens on its own.
  const [minimizedEventId, setMinimizedEventId] = useState<string | null>(null);
  const latestMedalId = useMedalStore((s) => s.earned[s.earned.length - 1]);

  // The real-time clock runs only while the game screen is mounted (cleaned up on unmount).
  useEffect(() => {
    startClock();
    return () => stopClock();
  }, [startClock, stopClock]);

  // Keyboard: Space toggles pause/resume (manual pause — same "manual pause wins" priority as
  // the speed buttons), Esc closes the reforms panel. Ignored while a form control has focus
  // so it doesn't fight the browser's own Space-activates-focused-button behavior.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const target = e.target instanceof HTMLElement ? e.target : null;
      const isFormControl = target !== null && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
      if (e.code === 'Space' && !isFormControl) {
        e.preventDefault();
        setSpeed(speed === 'paused' ? 'normal' : 'paused');
      } else if (e.key === 'Escape' && reformsOpen) {
        closeReforms();
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [speed, setSpeed, reformsOpen, closeReforms]);

  if (!state || !content) return null;

  const { month, year } = gameDate(state.turn, ui);
  const dangerThreshold = content.difficulty.defeatThreshold + 10;
  // The term/election cycle: elections land at the end of each 48-month term.
  const termLength = content.difficulty.turnsToWin;
  const monthInTerm = state.turn - (state.term - 1) * termLength;
  const monthsUntilElection = state.term * termLength - state.turn;

  const countryName = loc(content.country.name, lang);
  const population = formatPopulation(content.country.population, ui.map.dossier.populationMillion);
  const isFictional = content.country.id === 'absurdistan';

  const pendingEvent = state.pendingEventId ? content.events.find((e) => e.id === state.pendingEventId) : undefined;
  const eventMinimized = pendingEvent !== undefined && minimizedEventId === pendingEvent.id;

  const latestMedal = latestMedalId ? MEDALS.find((m) => m.id === latestMedalId) : undefined;
  const dangerous = STAT_ORDER.filter((k) => isDangerous(k, state.stats[k], dangerThreshold));

  return (
    <div className="fixed inset-0 overflow-hidden bg-(--map-ocean)">
      <Suspense fallback={null}>
        <CountryMap
          countryId={content.country.id}
          label={countryName}
          sublabel={isFictional ? `${population} · ${ui.main.bordersNote}` : population}
          eventPin={pendingEvent ? { id: pendingEvent.id, label: loc(pendingEvent.title, lang), onOpen: () => setMinimizedEventId(null) } : null}
        />
      </Suspense>

      <div
        className="pointer-events-none absolute inset-0 flex flex-col gap-sp-2 pb-1 pt-sp-3"
        style={{ paddingLeft: 'max(var(--spacing-sp-3), env(safe-area-inset-left))', paddingRight: 'max(var(--spacing-sp-3), env(safe-area-inset-right))' }}
      >
        {/* Header: country — date · term progress · until election · influence. */}
        <header data-tutorial="main-header" className="glass pointer-events-auto flex min-h-9 shrink-0 items-center gap-sp-3 rounded-row pl-1 pr-sp-3">
          <button
            type="button"
            onClick={toMenu}
            aria-label={ui.gameOver.toMenu}
            // min-h-9 touch target inside the 26pt-tall (mock) header pill.
            className="press flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-label text-(--muted)"
          >
            <span aria-hidden>←</span>
          </button>
          <span className="min-w-0 truncate text-caption font-medium">
            {countryName} <span className="font-normal text-(--muted)">— {month} {year}</span>
          </span>
          <span className="ml-auto flex shrink-0 items-center gap-sp-2 whitespace-nowrap text-caption text-(--muted)">
            {ui.main.term} {toRoman(state.term)} · {monthInTerm} {ui.main.of} {termLength}
            <span className="h-0.5 w-[70px] overflow-hidden rounded-xs bg-(--line)">
              <span className="meter-fill block h-full bg-(--accent)" style={{ width: `${(monthInTerm / termLength) * 100}%` }} />
            </span>
          </span>
          <span className="shrink-0 whitespace-nowrap text-caption text-(--muted)">
            {ui.main.untilElection} <span className="num text-num text-(--text)">{monthsUntilElection}</span>
          </span>
          <span className="shrink-0 whitespace-nowrap text-caption text-(--muted)">
            {ui.main.influence} <span className="num text-num text-(--text)">{Math.floor(state.influence)}</span>
          </span>
        </header>

        <div className="flex min-h-0 flex-1 items-start justify-between gap-sp-3">
          {/* Stats panel. */}
          <section data-tutorial="stats-panel" className="glass pointer-events-auto flex max-h-full w-[148px] flex-col gap-1 overflow-y-auto rounded-card px-sp-3 py-sp-2 tablet:w-[180px]">
            <p className="eyebrow">{ui.main.statsKicker}</p>
            {STAT_ORDER.map((k) => (
              <MeterRow
                key={k}
                label={ui.main.statsShort[k]}
                value={Math.round(state.stats[k])}
                warning={k === 'corruption' || dangerous.includes(k)}
                inverted={k === 'corruption'}
                size="compact"
                popOnChange
              />
            ))}
          </section>

          {/* Agenda panel. */}
          <Agenda ui={ui} pendingEventTitle={pendingEvent ? loc(pendingEvent.title, lang) : null} dangerous={dangerous.length > 0} monthsUntilElection={monthsUntilElection} />
        </div>

        {/* Bottom bar: latest medal, clock caption, speed controls, «Реформы →». */}
        <div className="glass pointer-events-auto flex min-h-12 shrink-0 items-center gap-sp-3 rounded-tile pl-sp-3 pr-sp-2">
          {latestMedal && (
            <span className="flex min-w-0 items-center gap-1.5 text-caption text-(--muted)">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-(--accent)" aria-hidden />
              <span className="truncate">
                {ui.medals.latest} · «{loc(latestMedal.name, lang)}»
              </span>
            </span>
          )}
          <span className="ml-auto whitespace-nowrap text-caption text-(--muted)">
            {speed === 'paused' ? (
              ui.main.timePaused
            ) : (
              <>
                {ui.main.timeRunning}
                <span className="typing-dots" aria-hidden>
                  …
                </span>
              </>
            )}
          </span>
          <div data-tutorial="clock-controls">
            <SpeedControls />
          </div>
          <button className="btn btn-primary min-h-9 shrink-0 rounded-[9px] text-label" onClick={openReforms} data-tutorial="reforms-button">
            {ui.main.reforms} <span aria-hidden>→</span>
          </button>
        </div>

        <Ticker ui={ui} lang={lang} state={state} content={content} />
      </div>

      {reformsOpen && <ReformsPanel onClose={closeReforms} />}
      {!eventMinimized && <EventModal onMinimize={pendingEvent ? () => setMinimizedEventId(pendingEvent.id) : undefined} />}
    </div>
  );
}

/** Top-right «Повестка»: the most pressing thing — a waiting event, then any stat in danger,
 * then an approaching election, else «Штатный режим». */
function Agenda({
  ui,
  pendingEventTitle,
  dangerous,
  monthsUntilElection,
}: {
  ui: Ui;
  pendingEventTitle: string | null;
  dangerous: boolean;
  monthsUntilElection: number;
}) {
  const a = ui.main.agenda;
  const { title, flavor } = pendingEventTitle
    ? { title: pendingEventTitle, flavor: a.eventFlavor }
    : dangerous
      ? a.danger
      : monthsUntilElection <= ELECTION_AGENDA_MONTHS
        ? a.election
        : a.calm;
  return (
    <section className="glass pointer-events-auto flex w-[168px] flex-col gap-1 rounded-tile px-sp-3 py-sp-2 tablet:w-[200px]">
      <p className="eyebrow">{a.kicker}</p>
      <p className="font-serif text-label leading-tight">{title}</p>
      <p className="flavor text-caption">{flavor}</p>
    </section>
  );
}

/** Bottom news ticker: the latest decrees and events, padded with satirical filler, scrolling
 * as a seamless marquee. The filler rotates once a game year so the run doesn't jump every tick. */
function Ticker({ ui, lang, state, content }: { ui: Ui; lang: Lang; state: GameState; content: GameContent }) {
  const decrees = state.ownedReforms
    .slice(-2)
    .map((id) => content.reforms.find((r) => r.id === id))
    .flatMap((r) => (r ? [`${ui.main.news.decree} «${loc(r.title, lang)}»`] : []));
  const events = Object.entries(state.eventHistory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => content.events.find((e) => e.id === id))
    .flatMap((e) => (e ? [loc(e.title, lang)] : []));
  const filler = ui.main.news.filler;
  const offset = Math.floor(state.turn / 12) % filler.length;
  const rotated = [...filler.slice(offset), ...filler.slice(0, offset)].slice(0, 4);
  const run = [...decrees, ...events, ...rotated].join(' · ') + ' · ';

  return (
    <div className="flex h-6 shrink-0 items-center gap-sp-3 px-sp-3">
      <span className="eyebrow shrink-0">{ui.main.news.kicker}</span>
      <div className="min-w-0 flex-1 overflow-hidden">
        <span className="marquee flavor text-caption">
          {run}
          {' '}
          {run}
          {' '}
        </span>
      </div>
    </div>
  );
}
