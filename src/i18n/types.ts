import type { DefeatKind, Difficulty, StatKey, VectorZone } from '../core/types';

/** A titled flavor block used by defeat/victory end screens. */
export interface RankText {
  title: string;
  text: string;
}

/** Reform branch keys (mirror of Reform['branch']). */
export type BranchKey = 'economy' | 'force' | 'social' | 'propaganda';

/** Victory rank keys resolved from average stats + zone (see victoryRankKey).
 * 'steppedDown' is the canonical good ending — voluntarily leaving power, undefeated. */
export type VictoryRankKey =
  | 'steppedDown'
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
    title: string;
    subtitle: string;
    continue: string;
    difficulties: Record<Difficulty, { name: string; tagline: string }>;
  };
  /** Europe map / country selection screen and its drawer, between menu and playing. */
  map: {
    /** MenuScreen's single "Play" button — navigates to the map. */
    playCta: string;
    /** Accessibility/fallback searchable list of the same countries as the map. */
    listButton: string;
    /** Shown briefly while the map screen's code chunk (lazy-loaded) downloads. */
    loading: string;
    searchPlaceholder: string;
    close: string;
    /** Region names — shown as the hover/tap tooltip for any country at the world-map
     * overview (before a region is entered), and as the active-region heading afterward. */
    continents: {
      westernEurope: string;
      easternEurope: string;
      northAmerica: string;
      southAmerica: string;
      centralAsia: string;
      middleEast: string;
      southSoutheastAsia: string;
      easternAsia: string;
      oceania: string;
      northAfrica: string;
      westernAfrica: string;
      centralAfrica: string;
      easternAfrica: string;
      southernAfrica: string;
    };
    /** Shown above the map, only while a region is active. */
    chooseRegion: string;
    /** Back button: exits the active region, returning to the world overview. */
    backToRegions: string;
    dossier: {
      population: string;
      area: string;
      economy: string;
      corruption: string;
      democracy: string;
      development: string;
    };
    /** Primary button in the country drawer that starts the game. */
    choose: string;
  };
  /** Settings screen, reached from the main menu. Language selection today; more sections may be added later. */
  settings: {
    /** Screen header, and the label of the menu button that opens it. */
    title: string;
    language: string;
  };
  /** Full-screen overlay shown on phone-sized portrait viewports (see OrientationGate) —
   * the game is landscape-only on phones; this is the web fallback for orientation lock. */
  orientationGate: {
    title: string;
    hint: string;
  };
  main: {
    influence: string;
    brief: string;
    reforms: string;
    autosave: string;
    /** «Срок» — the term counter shown in the header. */
    term: string;
    /** «до выборов» — months remaining until the next election. */
    untilElection: string;
    /** Short month unit, e.g. «мес.». */
    monthsShort: string;
    /** Aria labels for the real-time clock controls. */
    speed: { pause: string; normal: string; fast: string };
  };
  /** Inter-term inauguration summary shown after winning re-election. */
  interTerm: {
    stamp: string;
    flavor: string;
    continue: string;
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
