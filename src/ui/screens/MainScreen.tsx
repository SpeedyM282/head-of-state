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

export function MainScreen() {
  const { state, content, prevStats, reformsOpen, openReforms, closeReforms, startClock, stopClock, toMenu } =
    useGameStore();
  const lang = useLang((s) => s.lang);
  const ui = useUi();

  // The real-time clock runs only while the game screen is mounted (cleaned up on unmount).
  useEffect(() => {
    startClock();
    return () => stopClock();
  }, [startClock, stopClock]);

  if (!state || !content) return null;

  const { month, year } = gameDate(state.turn, ui);
  const dangerThreshold = content.difficulty.defeatThreshold + 10;
  const termProgress = Math.min(1, state.turn / content.difficulty.turnsToWin);

  return (
    <div className="flex flex-col gap-3 pt-10">
      {/* Back to the main menu: stops the clock; the game stays auto-saved. */}
      <button
        type="button"
        onClick={toMenu}
        aria-label={ui.gameOver.toMenu}
        className="absolute left-3 top-3 flex items-center gap-1 border px-2 py-1 text-xs"
        style={{ borderColor: 'var(--paper-line)', background: 'var(--paper)', color: 'var(--text-ink)' }}
      >
        <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M12 5 L7 10 L12 15" />
        </svg>
        {ui.gameOver.toMenu}
      </button>

      {/* Clock controls: sit between the back-to-menu button (left) and the language selector (right). */}
      <div className="absolute left-1/2 top-3 -translate-x-1/2">
        <SpeedControls />
      </div>

      <header className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="eyebrow truncate">{loc(content.country.name, lang)}</p>
          <p className="text-lg font-bold">
            {month} <span className="num">{year}</span>
          </p>
        </div>

        <p className="min-w-0 text-right text-sm">
          <span className="eyebrow block">{ui.main.influence}</span>
          <span className="num text-xl text-(--gold)">{Math.floor(state.influence)}</span>
        </p>
      </header>

      {/* Subtle progress toward the end of the term. */}
      <div className="h-0.5 w-full bg-(--ink-soft)" aria-hidden>
        <div
          className="h-full bg-(--gold) opacity-60"
          style={{ width: `${termProgress * 100}%`, transition: 'width 300ms' }}
        />
      </div>

      <div className="panel p-3">
        <p className="eyebrow mb-1">{ui.main.brief}</p>
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

      <VectorScale vector={state.vector} />

      <button className="btn w-full" onClick={openReforms}>
        {ui.main.reforms}
      </button>

      <p className="text-center text-xs opacity-50">{ui.main.autosave}</p>

      {reformsOpen && <ReformsPanel onClose={closeReforms} />}
      <EventModal />
    </div>
  );
}
