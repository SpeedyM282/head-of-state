import type { DefeatKind, Difficulty, StatKey, VectorZone } from '../core/types';

/** A titled flavor block used by defeat/victory end screens. */
export interface RankText {
  title: string;
  text: string;
}

/** Reform branch keys (mirror of Reform['branch']). */
export type BranchKey = 'economy' | 'force' | 'social' | 'propaganda';

/** Victory rank keys resolved from average stats + zone (see victoryRankKey). */
export type VictoryRankKey =
  | 'fatherDemocracy'
  | 'fatherNation'
  | 'manager'
  | 'okay'
  | 'survived';

/**
 * All fixed (non per-content) user-facing strings for one language.
 * Per-item content flavor (reforms/events/country) is localized inline in data/;
 * everything enumerable and reusable lives here.
 */
export interface Ui {
  menu: {
    eyebrow: string;
    title: string;
    subtitle: string;
    stamp: string;
    continue: string;
    difficulties: Record<Difficulty, { name: string; tagline: string }>;
  };
  main: {
    influence: string;
    brief: string;
    reforms: string;
    autosave: string;
    /** Aria labels for the real-time clock controls. */
    speed: { pause: string; normal: string; fast: string };
  };
  /** Month names, index 0 = January … 11 = December. */
  months: string[];
  vector: {
    heading: string;
    zones: Record<VectorZone, string>;
    scale: { democracy: string; authoritarianism: string; totalitarianism: string };
  };
  stats: Record<StatKey, string>;
  branches: Record<BranchKey, string>;
  reformsPanel: {
    title: string;
    close: string;
    influencePoints: string;
    treasury: string;
    adopted: string;
    costInfluence: string;
    costTreasury: string;
    approve: string;
    locked: string;
    tier: string;
    effectsInstant: string;
    effectsPerMonth: string;
    /** Reason lines shown under a disabled approve button (mirror core ReformBlock). */
    reason: {
      needsPrevious: string;
      notEnoughInfluence: string;
      notEnoughTreasury: string;
    };
  };
  event: {
    dispatch: string;
  };
  trend: string;
  gameOver: {
    stampVictory: string;
    stampDefeat: string;
    survived: string;
    playAgain: string;
    toMenu: string;
  };
  defeat: Record<DefeatKind, RankText>;
  victory: Record<VictoryRankKey, RankText>;
}
