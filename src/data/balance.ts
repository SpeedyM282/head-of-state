import type { Balance } from '../core/types';

/**
 * Every tunable coefficient of the simulation lives here (CLAUDE.md rule #5).
 * After changing anything: run `npm test` and compare autoplayer stats before/after.
 *
 * Term rescale (v0.5): every difficulty is a single 4-year term = 48 ticks. Per-tick flows
 * (income, drifts, decays, influence) are ~2.5x the previous 120-tick values so a shorter
 * game still swings meaningfully and feels dense.
 *
 * Corruption (v0.6): a 7th, INVERTED stat (higher is worse). It skims treasury income,
 * drags development, grows on its own (faster under totalitarianism), and once severe
 * buys elite loyalty — elites profit from graft, so fighting it costs their support.
 */
export const balance: Balance = {
  // --- Treasury income per turn: base + economy*k + resources*k - upkeep ---
  incomeBase: 1.7, // flat income floor
  incomeEconomyFactor: 0.05, // each economy point adds this much treasury
  incomeResourceFactor: 0.025, // natural resources bonus (country profile)
  upkeep: 5, // running the state costs money every month

  // --- Influence points ---
  startingInfluence: 5, // enough to buy a tier-0 reform on turn 1
  influenceBase: 1.7, // everyone gets this per month
  influenceStabilityBonus: 0.85, // +this per full 25 stability
  zoneInfluenceBonus: { democratic: -0.85, authoritarian: 0, totalitarian: 1.7 }, // GDD §5 table

  // --- Stat interactions (per month) ---
  economyFromDevelopment: 0.017, // development slowly feeds the economy
  economyDecay: 1.0, // economy shrinks without investment
  approvalEconomyMidpoint: 50, // economy above this grows approval, below shrinks it
  approvalFromEconomyGap: 0.05, // strength of that pull
  approvalFromDevelopment: 0.0075, // long-term investments please people a little
  stabilityBaseline: 55, // stability drifts toward this value...
  stabilityRecovery: 0.033, // ...at this rate per month

  // --- Zone effects (per month) ---
  eliteDriftDemocratic: 0.67, // democratic zone: elites get restless every month
  eliteUnpaidTreasuryThreshold: 20, // treasury below this — elites are not being paid...
  eliteUnpaidDrift: 2.0, // ...and their loyalty drops this fast per month (path to coup)
  totalitarianDevelopmentDecay: 0.75, // totalitarian zone: brain drain
  totalitarianApprovalCrashFactor: 1.5, // reserved: crisis events hit approval harder (used by content)

  // --- Elections (democratic zone only): one mid-term election at month 24 ---
  electionsEveryTurns: 24,
  electionsApprovalToWin: 45,

  // --- Revolution needs both low approval AND stability below this ---
  revolutionStabilityCeiling: 50,

  // --- Prosperity bonus: economy above the threshold compounds treasury income.
  // At economy=100 (threshold 70, factor 0.05) this adds +1.5 income/month — roughly
  // 1.47x the plain linear formula's income at economy=100, before any corruption skim. ---
  prosperityThreshold: 70,
  prosperityFactor: 0.05,

  // --- Corruption: the counterweight to prosperity. 0-100, HIGHER IS WORSE. ---
  // Skims gross revenue before upkeep; at corruption=100 the state loses 40% of income.
  // Low economies (hard) rarely clear the prosperity threshold, so they get the skim
  // downside without much of the bonus upside — kept at the low end of the 40-50% target
  // range so hard stays hard without being crushed by a mechanic it barely benefits from.
  corruptionSkimFactor: 0.004,
  corruptionGrowth: 0.15, // passive drift per month
  corruptionGrowthTotalitarianMultiplier: 2, // unchecked power breeds theft
  corruptionDevelopmentDrag: 0.007, // development lost per month per corruption point
  corruptionEliteBondThreshold: 50, // above this, elites are profiting from the graft
  corruptionEliteBondBonus: 0.3, // ...and quietly reward you with a little loyalty for it
};
