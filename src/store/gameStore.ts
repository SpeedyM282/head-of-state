import { create } from 'zustand';
import type { Difficulty, GameContent, GameState, Stats } from '../core/types';
import { applyPlayerActions, initGame, tick } from '../core';
import { buildContent } from '../data';
import { GameClock, type Speed } from './clock';
import { clearSave, loadGame, saveGame } from './persistence';

type Phase = 'menu' | 'map' | 'settings' | 'playing' | 'over' | 'interTerm';

interface GameStore {
  phase: Phase;
  content: GameContent | null;
  state: GameState | null;
  /** Stats snapshot before the last tick — the ui renders trends from it. */
  prevStats: Stats | null;
  hasSave: boolean;
  /** Player-chosen clock speed (what the controls highlight and an auto-pause resumes to). */
  speed: Speed;
  /** Whether the reforms panel is open — mirrored here so the clock can auto-pause. */
  reformsOpen: boolean;
  goToMap: () => void;
  goToSettings: () => void;
  startGame: (countryId: string, difficulty: Difficulty) => void;
  continueGame: () => void;
  buyReform: (reformId: string) => void;
  answerEvent: (optionIndex: number) => void;
  /** Dismiss the inter-term inauguration screen and resume play in the new term. */
  inaugurate: () => void;
  setSpeed: (speed: Speed) => void;
  openReforms: () => void;
  closeReforms: () => void;
  /** Begin/stop the real-time clock — bound to the MainScreen mount lifecycle. */
  startClock: () => void;
  stopClock: () => void;
  toMenu: () => void;
  /** OrientationGate toggles this while a phone is held portrait — same auto-pause mechanism
   * as an event or the reforms panel, manual pause still wins. No-op if no game is running. */
  setOrientationPaused: (paused: boolean) => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // One clock per store. The core stays turn-based; the clock only decides when to tick.
  const clock = new GameClock({
    onTick: () => {
      const { state, content } = get();
      if (!state || !content || state.pendingEventId || state.outcome || state.awaitingInauguration) return;
      const prevStats = state.stats;
      const next = tick(state, content).state;
      saveGame({ state: next, difficulty: content.difficulty.id, countryId: content.country.id });
      // An event auto-pauses time until the player answers; a result or a won election
      // (the inter-term inauguration) stops the clock until the player continues.
      if (next.pendingEventId) clock.setAutoPaused('event', true);
      if (next.outcome || next.awaitingInauguration) clock.stop();
      const phase = next.outcome ? 'over' : next.awaitingInauguration ? 'interTerm' : 'playing';
      set({ state: next, prevStats, phase, hasSave: true });
    },
  });

  return {
    phase: 'menu',
    content: null,
    state: null,
    prevStats: null,
    hasSave: loadGame() !== null,
    speed: 'normal',
    reformsOpen: false,

    goToMap: () => set({ phase: 'map' }),
    goToSettings: () => set({ phase: 'settings' }),

    startGame: (countryId, difficulty) => {
      const content = buildContent(countryId, difficulty);
      const state = initGame(content, Date.now() % 2 ** 31);
      clearSave();
      clock.setUserSpeed('normal');
      clock.setAutoPaused('event', false);
      clock.setAutoPaused('reforms', false);
      set({ phase: 'playing', content, state, prevStats: null, hasSave: false, speed: 'normal', reformsOpen: false });
    },

    continueGame: () => {
      const save = loadGame();
      if (!save) return;
      const content = buildContent(save.countryId, save.difficulty);
      clock.setUserSpeed('normal');
      clock.setAutoPaused('reforms', false);
      clock.setAutoPaused('event', !!save.state.pendingEventId);
      const phase = save.state.outcome ? 'over' : save.state.awaitingInauguration ? 'interTerm' : 'playing';
      set({ phase, content, state: save.state, prevStats: null, speed: 'normal', reformsOpen: false });
    },

    buyReform: (reformId) => {
      const { state, content } = get();
      if (!state || !content) return;
      const next = applyPlayerActions(state, [{ type: 'buyReform', reformId }], content);
      saveGame({ state: next, difficulty: content.difficulty.id, countryId: content.country.id });
      set({ state: next });
    },

    answerEvent: (optionIndex) => {
      const { state, content } = get();
      if (!state || !content) return;
      const next = applyPlayerActions(state, [{ type: 'answerEvent', optionIndex }], content);
      // Answering lifts the event auto-pause; manual pause (if any) still wins inside the clock.
      clock.setAutoPaused('event', false);
      saveGame({ state: next, difficulty: content.difficulty.id, countryId: content.country.id });
      set({ state: next });
    },

    inaugurate: () => {
      const { state, content } = get();
      if (!state || !content || !state.awaitingInauguration) return;
      const next = { ...state, awaitingInauguration: false };
      saveGame({ state: next, difficulty: content.difficulty.id, countryId: content.country.id });
      // prevStats reset so the new term's trends start clean; the clock restarts on MainScreen mount.
      set({ state: next, prevStats: null, phase: 'playing' });
    },

    setSpeed: (speed) => {
      clock.setUserSpeed(speed);
      set({ speed });
    },

    openReforms: () => {
      clock.setAutoPaused('reforms', true);
      set({ reformsOpen: true });
    },

    closeReforms: () => {
      clock.setAutoPaused('reforms', false);
      set({ reformsOpen: false });
    },

    startClock: () => clock.start(),
    stopClock: () => clock.stop(),
    setOrientationPaused: (paused) => clock.setAutoPaused('orientation', paused),

    toMenu: () => {
      clock.stop();
      set({ phase: 'menu', hasSave: loadGame() !== null });
    },
  };
});
