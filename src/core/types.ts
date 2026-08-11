// Core domain types. This file must stay free of any imports from ui/store/data.

export type StatKey =
  | 'economy'
  | 'treasury'
  | 'approval'
  | 'eliteLoyalty'
  | 'stability'
  | 'development'
  | 'corruption';

export type Stats = Record<StatKey, number>; // all 0-100
// NOTE: 'corruption' is the one INVERTED stat — higher is worse. Core formulas that treat
// it directionally (skim, growth, drag) must say so explicitly; nothing here assumes every
// StatKey is "higher is better". See data/statMeta.ts for the ui-facing polarity map.

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

/** An effect batch that lands `afterTurns` months later (scheduled into GameState). */
export interface DelayedEffect {
  afterTurns: number;
  effects: Effect[];
}

/** Non-numeric state changes an event option can trigger, kept declarative in content. */
export interface EventOptionFlags {
  /** Removes term limits — the ruler may run indefinitely (constitution question). */
  amendConstitution?: boolean;
}

export interface EventOption {
  text: LocalizedText;
  effects: Effect[];
  /** Hidden costs/benefits applied later — e.g. the delayed price of complacency. */
  delayedEffects?: DelayedEffect[];
  /** Declarative non-stat state changes (see EventOptionFlags). */
  flags?: EventOptionFlags;
}

/** A batch of effects queued to apply on a future turn (see EventOption.delayedEffects). */
export interface ScheduledEffect {
  applyOnTurn: number;
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
  /** Current term, 1-based. Elections land at the end of each term (turn = term * 48). */
  term: number;
  /** Whether the constitution has been amended to remove term limits. */
  constitutionAmended: boolean;
  /** Set on winning an election — pauses play for the inter-term inauguration screen. */
  awaitingInauguration: boolean;
  /** Effects queued to apply on a future turn (delayed event costs). */
  scheduledEffects: ScheduledEffect[];
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
  revolutionStabilityCeiling: number;

  // --- Elections (end of each term) & term limits ---
  /** Democratic-zone approval needed to win re-election. */
  electionsApprovalToWin: number;
  /** Authoritarian zone wins at (electionsApprovalToWin - this) — «админресурс». */
  authoritarianElectionMargin: number;
  /** Totalitarian zone almost always "wins"; the sliver of loss keeps it deterministic-dramatic. */
  totalitarianElectionWinChance: number;
  /** A totalitarian "election win" shoves the vector further and costs reputation. */
  totalitarianElectionVectorShift: number;
  totalitarianElectionEconomyHit: number;
  totalitarianElectionDevelopmentHit: number;
  /** Constitution allows this many terms before the ruler must amend it or step down. */
  termLimit: number;

  // --- Per-term escalation: open-ended play must decay so every game terminates ---
  /** External pressure & corruption growth multiply by this each term after the first. */
  escalationPerTerm: number;
  /** Additive economy+stability drain of (term-1)*this per month — bites even on easy
   * (whose base external pressure is 0), guaranteeing open-ended games terminate. */
  escalationPressurePerTerm: number;
  /** Re-election approval bar rises by this per term. */
  electionApprovalRisePerTerm: number;

  // --- Prosperity & corruption: the economy → treasury feedback loop ---
  /** Economy above this earns bonus income on top of the linear incomeEconomyFactor term. */
  prosperityThreshold: number;
  prosperityFactor: number;
  /** Fraction of gross income skimmed per corruption point (corruption is 0-100, higher-is-worse). */
  corruptionSkimFactor: number;
  /** Passive corruption growth per month. */
  corruptionGrowth: number;
  /** Multiplies corruptionGrowth while in the totalitarian zone. */
  corruptionGrowthTotalitarianMultiplier: number;
  /** Development lost per month per corruption point. */
  corruptionDevelopmentDrag: number;
  /** Above this corruption level, elites quietly profit from the graft. */
  corruptionEliteBondThreshold: number;
  corruptionEliteBondBonus: number;
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
