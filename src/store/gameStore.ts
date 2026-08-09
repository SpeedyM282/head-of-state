import { create } from 'zustand';
import type { Difficulty, GameContent, GameState, Stats } from '../core/types';
import { applyPlayerActions, initGame, tick } from '../core';
import { buildContent } from '../data';
import { GameClock, type Speed } from './clock';
import { clearSave, loadGame, saveGame } from './persistence';

type Phase = 'menu' | 'playing' | 'over';

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
  startGame: (difficulty: Difficulty) => void;
  continueGame: () => void;
  buyReform: (reformId: string) => void;
  answerEvent: (optionIndex: number) => void;
  setSpeed: (speed: Speed) => void;
  openReforms: () => void;
  closeReforms: () => void;
  /** Begin/stop the real-time clock — bound to the MainScreen mount lifecycle. */
  startClock: () => void;
  stopClock: () => void;
  toMenu: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  // One clock per store. The core stays turn-based; the clock only decides when to tick.
  const clock = new GameClock({
    onTick: () => {
      const { state, content } = get();
      if (!state || !content || state.pendingEventId || state.outcome) return;
      const prevStats = state.stats;
      const next = tick(state, content).state;
      saveGame({ state: next, difficulty: content.difficulty.id });
      // An event auto-pauses time until the player answers; a result stops the clock.
      if (next.pendingEventId) clock.setAutoPaused('event', true);
      if (next.outcome) clock.stop();
      set({ state: next, prevStats, phase: next.outcome ? 'over' : 'playing', hasSave: true });
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

    startGame: (difficulty) => {
      const content = buildContent(difficulty);
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
      const content = buildContent(save.difficulty);
      clock.setUserSpeed('normal');
      clock.setAutoPaused('reforms', false);
      clock.setAutoPaused('event', !!save.state.pendingEventId);
      set({
        phase: save.state.outcome ? 'over' : 'playing',
        content,
        state: save.state,
        prevStats: null,
        speed: 'normal',
        reformsOpen: false,
      });
    },

    buyReform: (reformId) => {
      const { state, content } = get();
      if (!state || !content) return;
      const next = applyPlayerActions(state, [{ type: 'buyReform', reformId }], content);
      saveGame({ state: next, difficulty: content.difficulty.id });
      set({ state: next });
    },

    answerEvent: (optionIndex) => {
      const { state, content } = get();
      if (!state || !content) return;
      const next = applyPlayerActions(state, [{ type: 'answerEvent', optionIndex }], content);
      // Answering lifts the event auto-pause; manual pause (if any) still wins inside the clock.
      clock.setAutoPaused('event', false);
      saveGame({ state: next, difficulty: content.difficulty.id });
      set({ state: next });
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

    toMenu: () => {
      clock.stop();
      set({ phase: 'menu', hasSave: loadGame() !== null });
    },
  };
});
