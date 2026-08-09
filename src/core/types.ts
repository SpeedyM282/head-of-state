// Core domain types. This file must stay free of any imports from ui/store/data.

export type StatKey =
  | 'economy'
  | 'treasury'
  | 'approval'
  | 'eliteLoyalty'
  | 'stability'
  | 'development';

export type Stats = Record<StatKey, number>; // all 0-100

/** Supported UI languages. Default is 'en' (see langStore). */
export type Lang = 'en' | 'ru' | 'uz';

/**
 * A user-facing string in every supported language. Content data carries these
 * instead of bare strings; the ui picks one via loc(). The core never reads
 * localized fields, so this does not affect simulation logic or determinism.
 */
export type LocalizedText = Record<Lang, string>;

export type EffectTarget = StatKey | 'vector' | 'influence';

export interface Effect {
  target: EffectTarget;
  delta: number;
}

export type VectorZone = 'democratic' | 'authoritarian' | 'totalitarian';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  /** Starting value applied to every stat unless country profile overrides it. */
  startStats: Stats;
  /** Chance per turn that a random (non-triggered) event fires. */
  randomEventChance: number;
  /** Chance per turn that a zone-based external event fires (checked before random). */
  externalEventChance: number;
  /** A stat below this value starts counting toward defeat. */
  defeatThreshold: number;
  /** Consecutive turns below threshold before the defeat fires. */
  defeatGraceTurns: number;
  /** Term length in in-game years (one tick = one month). */
  yearsToWin: number;
  /** Survive this many turns (months) to win. Derived as yearsToWin * 12. */
  turnsToWin: number;
  /** Flat per-turn pressure applied in hard external conditions (subtracted from economy/stability). */
  externalPressure: number;
}

export interface CountryProfile {
  id: string;
  name: LocalizedText;
  population: number; // people
  areaKm2: number;
  /** 0-100, natural resource wealth. Adds to treasury income. */
  resources: number;
  hasSeaAccess: boolean;
  /** Optional overrides of difficulty start stats. */
  startStatsOverride?: Partial<Stats>;
}

export interface EventOption {
  text: LocalizedText;
  effects: Effect[];
}

export type GameEventKind = 'random' | 'triggered' | 'external';

export interface GameEvent {
  id: string;
  kind: GameEventKind;
  /** For external events: which zones this event belongs to. */
  zones?: VectorZone[];
  /** For triggered events: fires when predicate is true (checked before chance-based events). */
  trigger?: (state: GameState) => boolean;
  /** Triggered events do not repeat more often than this many turns. */
  cooldown?: number;
  /**
   * If true, the event fires at most once per game. Defaults: random & external → once;
   * triggered → repeatable (they are pressure mechanics and re-fire on cooldown).
   * Enforced in eventEngine via eventHistory — no new state shape.
   */
  once?: boolean;
  title: LocalizedText;
  text: LocalizedText;
  options: EventOption[];
}

export interface Reform {
  id: string;
  branch: 'economy' | 'force' | 'social' | 'propaganda';
  /** Index inside the branch; reform N requires reform N-1 of the same branch. */
  tier: number;
  title: LocalizedText;
  description: LocalizedText;
  costInfluence: number;
  costTreasury: number;
  /** Applied once on purchase. */
  instant: Effect[];
  /** Applied every turn while owned. */
  perTurn: Effect[];
}

export type DefeatKind = 'coup' | 'revolution' | 'default' | 'elections';

export interface Outcome {
  result: 'defeat' | 'victory';
  defeat?: DefeatKind;
  /** Victory rank id resolved by ui from stats+zone. */
  turn: number;
}

export interface LogEntry {
  turn: number;
  text: string;
}

export interface GameState {
  turn: number;
  stats: Stats;
  /** 0 = democracy, 100 = totalitarianism. */
  vector: number;
  influence: number;
  ownedReforms: string[];
  /** Event currently awaiting the player's answer (blocks the next tick / auto-pauses the clock). */
  pendingEventId: string | null;
  /** eventId -> last turn it fired (cooldown bookkeeping). */
  eventHistory: Record<string, number>;
  /** Consecutive turns each defeat condition has been "armed". */
  defeatCounters: Record<DefeatKind, number>;
  difficulty: Difficulty;
  countryId: string;
  seed: number;
  rngState: number;
  outcome: Outcome | null;
  log: LogEntry[];
}

/** All game content, injected into the core — the core never imports data files. */
export interface GameContent {
  country: CountryProfile;
  difficulty: DifficultyConfig;
  reforms: Reform[];
  events: GameEvent[];
  balance: Balance;
}

/** Every tunable coefficient of the simulation. Values live in data/balance.ts. */
export interface Balance {
  incomeBase: number;
  incomeEconomyFactor: number;
  incomeResourceFactor: number;
  upkeep: number;
  /** Influence the player starts the game with. */
  startingInfluence: number;
  influenceBase: number;
  influenceStabilityBonus: number;
  economyFromDevelopment: number;
  economyDecay: number;
  approvalFromEconomyGap: number;
  approvalEconomyMidpoint: number;
  approvalFromDevelopment: number;
  stabilityRecovery: number;
  stabilityBaseline: number;
  eliteDriftDemocratic: number;
  /** Treasury below this makes elites restless (they are not being paid). */
  eliteUnpaidTreasuryThreshold: number;
  eliteUnpaidDrift: number;
  totalitarianDevelopmentDecay: number;
  totalitarianApprovalCrashFactor: number;
  zoneInfluenceBonus: Record<VectorZone, number>;
  electionsEveryTurns: number;
  electionsApprovalToWin: number;
  revolutionStabilityCeiling: number;
}

export interface PlayerAction {
  type: 'buyReform' | 'answerEvent';
  reformId?: string;
  optionIndex?: number;
}

export interface TickResult {
  state: GameState;
  firedEventId: string | null;
}
