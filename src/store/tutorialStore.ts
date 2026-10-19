import { create } from 'zustand';
import type { VectorZone } from '../core';
import { loadTutorial, saveTutorial } from './persistence';
import { useGameStore } from './gameStore';

export type ScriptedStepId = 'stats' | 'map' | 'term' | 'defeats';

/** The scripted opening, in order (mirrors ui/tutorial/content.ts's SCRIPTED_STEPS). Every
 * step advances with «Дальше»; advancing past the last releases control. */
export const SCRIPTED_ORDER: readonly ScriptedStepId[] = ['stats', 'map', 'term', 'defeats'];

const initial = loadTutorial();

interface TutorialStore {
  /** Persisted (see store/persistence.ts) — never re-triggers once true, except via resetForReplay. */
  completed: boolean;
  /** Persisted set of one-time tip ids already shown, across every game. */
  seenTips: string[];
  /** Current scripted-opening step, or null when it isn't running (not started, finished, or skipped). */
  scriptedStep: ScriptedStepId | null;
  /** True once the scripted opening has released control (or was skipped) — just-in-time tips
   * only ever evaluate while this is true, so nothing fires mid-scripted-step. */
  jitEnabled: boolean;
  /** The governance zone the current game session started in — captured once per game (see
   * TutorialOverlay), used by the "vector zone changed" tip to detect an actual change. */
  initialZone: VectorZone | null;
  /** The one-time tip currently being shown, if any. */
  activeTipId: string | null;

  /** Starts the scripted opening — call right after startGame('absurdistan', 'easy'). */
  beginScripted: () => void;
  /** «Дальше»: the next step, or — on the last — completes the tutorial, enables JIT tips and
   * persists. No-op when the opening isn't running. */
  advanceScripted: () => void;
  /** Abandons the scripted opening (or answers the first-launch prompt with "I'll figure it
   * out") — marks the flag completed and persists, but leaves JIT tips enabled: skipping the
   * guided walkthrough doesn't opt out of the lighter one-line contextual tips. */
  skip: () => void;
  /** Called once per new game session with that session's starting zone. */
  captureInitialZone: (zone: VectorZone) => void;
  showTip: (id: string) => void;
  dismissActiveTip: () => void;
  /** Settings "Пройти обучение заново" — resets the persisted flag and seen-tips set. */
  resetForReplay: () => void;
}

export const useTutorialStore = create<TutorialStore>((set, get) => ({
  completed: initial.completed,
  seenTips: initial.seenTips,
  scriptedStep: null,
  jitEnabled: false,
  initialZone: null,
  activeTipId: null,

  beginScripted: () => {
    set({ scriptedStep: SCRIPTED_ORDER[0], jitEnabled: false, activeTipId: null });
    useGameStore.getState().setTutorialPaused(true);
  },

  advanceScripted: () => {
    const step = get().scriptedStep;
    if (!step) return;
    const next = SCRIPTED_ORDER[SCRIPTED_ORDER.indexOf(step) + 1];
    if (next) {
      set({ scriptedStep: next });
      return;
    }
    const seenTips = get().seenTips;
    set({ scriptedStep: null, jitEnabled: true, completed: true });
    saveTutorial({ completed: true, seenTips });
    useGameStore.getState().setTutorialPaused(false);
  },

  skip: () => {
    const seenTips = get().seenTips;
    set({ scriptedStep: null, jitEnabled: true, completed: true, activeTipId: null });
    saveTutorial({ completed: true, seenTips });
    useGameStore.getState().setTutorialPaused(false);
  },

  captureInitialZone: (zone) => set({ initialZone: zone }),

  showTip: (id) => {
    set({ activeTipId: id });
    useGameStore.getState().setTutorialPaused(true);
  },

  dismissActiveTip: () => {
    const id = get().activeTipId;
    if (!id) return;
    const seenTips = get().seenTips.includes(id) ? get().seenTips : [...get().seenTips, id];
    set({ activeTipId: null, seenTips });
    saveTutorial({ completed: get().completed, seenTips });
    useGameStore.getState().setTutorialPaused(false);
  },

  resetForReplay: () => {
    set({ completed: false, seenTips: [] });
    saveTutorial({ completed: false, seenTips: [] });
  },
}));
