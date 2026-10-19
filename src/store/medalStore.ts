import { create } from 'zustand';
import type { DefeatKind, GameContent, GameState } from '../core/types';
import { newlyEarned } from '../data/medals';
import { useGameStore } from './gameStore';
import { loadMedals, saveMedals } from './persistence';

const initial = loadMedals();

interface MedalStore {
  /** Persisted: earned medal ids, in earn order (the last one is the bottom bar's «Медаль · …»). */
  earned: string[];
  /** Persisted: earned but not yet looked at on the Медали screen. */
  unseen: string[];
  /** Persisted: every defeat kind suffered across games. */
  defeatsSeen: DefeatKind[];
  /** Earned during the current game — game over's «Новые медали». Not persisted. */
  earnedThisGame: string[];
  /** Seed of the game `earnedThisGame` belongs to (a new seed = a new game). */
  gameSeed: number | null;
  /** Checks every medal against the current game; persists anything new. */
  evaluate: (state: GameState, content: GameContent) => void;
  /** Leaving the Медали screen: the halos have been seen. */
  markAllSeen: () => void;
}

export const useMedalStore = create<MedalStore>((set, get) => ({
  earned: initial.earned,
  unseen: initial.unseen,
  defeatsSeen: initial.defeatsSeen,
  earnedThisGame: [],
  gameSeed: null,

  evaluate: (state, content) => {
    const s = get();
    const sameGame = s.gameSeed === state.seed;
    const earnedThisGame = sameGame ? s.earnedThisGame : [];
    const defeat = state.outcome?.result === 'defeat' ? state.outcome.defeat : undefined;
    const defeatsSeen = defeat && !s.defeatsSeen.includes(defeat) ? [...s.defeatsSeen, defeat] : s.defeatsSeen;
    const fresh = newlyEarned(s.earned, { state, content, defeatsSeen });

    if (fresh.length === 0 && defeatsSeen === s.defeatsSeen) {
      if (!sameGame) set({ gameSeed: state.seed, earnedThisGame });
      return;
    }
    const next = {
      earned: [...s.earned, ...fresh],
      unseen: [...s.unseen, ...fresh],
      defeatsSeen,
    };
    saveMedals(next);
    set({ ...next, earnedThisGame: [...earnedThisGame, ...fresh], gameSeed: state.seed });
  },

  markAllSeen: () => {
    const { earned, defeatsSeen, unseen } = get();
    if (unseen.length === 0) return;
    saveMedals({ earned, unseen: [], defeatsSeen });
    set({ unseen: [] });
  },
}));

// Every game update (tick, reform, event answer, inauguration…) re-checks the medals. Medals are
// meta-progression only — nothing here feeds back into the game.
useGameStore.subscribe((s, prev) => {
  if (s.state && s.content && s.state !== prev.state) useMedalStore.getState().evaluate(s.state, s.content);
});
