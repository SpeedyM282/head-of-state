import { useEffect } from 'react';
import type { StatKey } from '../../core/types';
import { gameDate, loc } from '../../i18n';
import { isDangerous } from '../../data/statMeta';
import { useLang, useUi } from '../../store/langStore';
import { useGameStore } from '../../store/gameStore';
import { StatRow } from '../components/StatRow';
import { VectorScale } from '../components/VectorScale';
import { EventModal } from '../components/EventModal';
import { ReformsPanel } from '../components/ReformsPanel';
import { SpeedControls } from '../components/SpeedControls';

const STAT_ORDER: StatKey[] = ['economy', 'treasury', 'approval', 'eliteLoyalty', 'stability', 'development', 'corruption'];

/**
 * Two-panel layout at every form factor (phone-landscape designed first at 640×360, tablet and
 * desktop get the same structure with more air): left panel is the 7 stat rows, right panel is
 * everything else — vector, term/election countdown, influence, clock controls, reforms button.
 * No full-width header bar — vertical space is scarce in phone landscape, so the back button
 * lives as a small corner control instead of its own row.
 */
export function MainScreen() {
  const { state, content, prevStats, reformsOpen, openReforms, closeReforms, startClock, stopClock, toMenu, speed, setSpeed } =
    useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();

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
      const target = e.target as HTMLElement | null;
      const isFormControl = target && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(target.tagName);
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
  const monthsUntilElection = state.term * termLength - state.turn;
  const termProgress = Math.min(1, (state.turn - (state.term - 1) * termLength) / termLength);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-1.5 tablet:gap-3">
      <div className="flex min-h-0 flex-1 gap-2 tablet:gap-4 desktop:gap-6">
        {/* LEFT: the 7 stat rows. */}
        <div className="panel flex w-[58%] min-w-0 flex-col justify-center gap-0 overflow-y-auto p-2 tablet:w-[55%] tablet:p-3 desktop:w-[52%]">
          <div className="mb-1 flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={toMenu}
              aria-label={ui.gameOver.toMenu}
              className="-ml-1 flex h-11 w-11 shrink-0 items-center justify-center text-(--text-ink) hover:bg-(--paper-dim) desktop:h-8 desktop:w-8"
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 5 L7 10 L12 15" />
              </svg>
            </button>
            <p className="eyebrow truncate">{ui.main.brief}</p>
          </div>
          {STAT_ORDER.map((k) => (
            <StatRow
              key={k}
              statKey={k}
              value={state.stats[k]}
              prev={prevStats ? prevStats[k] : null}
              danger={isDangerous(k, state.stats[k], dangerThreshold)}
            />
          ))}
        </div>

        {/* RIGHT: identity/date/influence, term progress, vector, clock, reforms. */}
        <div className="flex w-[42%] min-w-0 flex-col gap-1.5 overflow-y-auto tablet:w-[45%] tablet:gap-3 desktop:w-[48%]">
          <header className="flex shrink-0 items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="eyebrow truncate">{loc(content.country.name, lang)}</p>
              <p className="text-base font-bold leading-tight tablet:text-lg">
                {month} <span className="num">{year}</span>
              </p>
            </div>
            <p className="min-w-0 shrink-0 text-right text-sm">
              <span className="eyebrow block">{ui.main.influence}</span>
              <span className="num text-lg text-(--gold) tablet:text-xl">{Math.floor(state.influence)}</span>
            </p>
          </header>

          <div className="shrink-0">
            <div className="mb-1 flex items-center justify-between text-[0.6rem] uppercase tracking-wider text-(--text-faint)">
              <span>{ui.main.term} {state.term}</span>
              <span>{ui.main.untilElection}: <span className="num">{monthsUntilElection}</span> {ui.main.monthsShort}</span>
            </div>
            <div className="h-0.5 w-full bg-(--ink-soft)" aria-hidden>
              <div
                className="h-full bg-(--gold) opacity-60"
                style={{ width: `${termProgress * 100}%`, transition: 'width 300ms' }}
              />
            </div>
          </div>

          <div className="shrink-0">
            <VectorScale vector={state.vector} />
          </div>

          <div className="flex shrink-0 items-center justify-between gap-2">
            <SpeedControls />
            <p className="hidden text-right text-[0.6rem] opacity-50 tablet:block">{ui.main.autosave}</p>
          </div>

          <button className="btn min-h-11 w-full" onClick={openReforms}>
            {ui.main.reforms}
          </button>
        </div>
      </div>

      {reformsOpen && <ReformsPanel onClose={closeReforms} />}
      <EventModal />
    </div>
  );
}
