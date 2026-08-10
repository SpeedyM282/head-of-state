import type { GameContent, GameState, TickResult } from './types';
import { applyEffects, clampStat } from './effects';
import { vectorZone } from './vector';
import { pickEvent } from './eventEngine';
import { checkConditions } from './conditions';

/**
 * Advances the game by one turn (one in-game month).
 * Order: income → stat interactions → zone effects → owned reform perTurn effects →
 * event selection → defeat/victory checks.
 * Pure and deterministic: all randomness flows through state.rngState.
 * The real-time clock that decides *when* to call this lives in the store, not here.
 */
export function tick(state: GameState, content: GameContent): TickResult {
  if (state.outcome || state.pendingEventId) {
    return { state, firedEventId: null };
  }
  const b = content.balance;
  const zone = vectorZone(state.vector);

  let s: GameState = { ...state, turn: state.turn + 1, stats: { ...state.stats } };

  // 1. Income: treasury from economy + resources, plus a prosperity bonus once economy
  // clears a threshold (rich economies compound), all skimmed by corruption before it
  // reaches the treasury — upkeep is a state expense, not part of the skimmed revenue.
  const prosperityBonus = Math.max(0, s.stats.economy - b.prosperityThreshold) * b.prosperityFactor;
  const grossRevenue =
    b.incomeBase +
    s.stats.economy * b.incomeEconomyFactor +
    content.country.resources * b.incomeResourceFactor +
    prosperityBonus;
  const corruptionSkim = s.stats.corruption * b.corruptionSkimFactor;
  const income = grossRevenue * (1 - corruptionSkim) - b.upkeep;
  s.stats.treasury = clampStat(s.stats.treasury + income);

  // Influence points for the new turn.
  s = {
    ...s,
    influence:
      s.influence +
      b.influenceBase +
      Math.floor(s.stats.stability / 25) * b.influenceStabilityBonus +
      b.zoneInfluenceBonus[zone],
  };

  // 2. Stat interactions.
  // Development slowly feeds the economy; the economy decays without investment.
  s.stats.economy = clampStat(
    s.stats.economy + s.stats.development * b.economyFromDevelopment - b.economyDecay,
  );
  // Approval follows the economy: above midpoint it grows, below it falls.
  const econGap = (s.stats.economy - b.approvalEconomyMidpoint) * b.approvalFromEconomyGap;
  s.stats.approval = clampStat(
    s.stats.approval + econGap + s.stats.development * b.approvalFromDevelopment,
  );
  // Stability drifts toward its baseline.
  s.stats.stability = clampStat(
    s.stats.stability + (b.stabilityBaseline - s.stats.stability) * b.stabilityRecovery,
  );

  // Elites get restless when the treasury cannot pay them (path to coup).
  if (s.stats.treasury < b.eliteUnpaidTreasuryThreshold) {
    s.stats.eliteLoyalty = clampStat(s.stats.eliteLoyalty - b.eliteUnpaidDrift);
  }

  // Corruption drifts upward on its own — faster under totalitarianism, where unchecked
  // power breeds theft — drags down development, and once it's severe enough it buys elite
  // goodwill (they profit from the graft, which is why fighting it costs their loyalty).
  const corruptionGrowth =
    b.corruptionGrowth * (zone === 'totalitarian' ? b.corruptionGrowthTotalitarianMultiplier : 1);
  s.stats.corruption = clampStat(s.stats.corruption + corruptionGrowth);
  s.stats.development = clampStat(s.stats.development - s.stats.corruption * b.corruptionDevelopmentDrag);
  if (s.stats.corruption > b.corruptionEliteBondThreshold) {
    s.stats.eliteLoyalty = clampStat(s.stats.eliteLoyalty + b.corruptionEliteBondBonus);
  }

  // 3. Zone effects (GDD §5).
  if (zone === 'democratic') {
    // Elites are harder to keep happy under democracy.
    s.stats.eliteLoyalty = clampStat(s.stats.eliteLoyalty - b.eliteDriftDemocratic);
  } else if (zone === 'totalitarian') {
    // Brain drain and isolation.
    s.stats.development = clampStat(s.stats.development - b.totalitarianDevelopmentDecay);
  }
  // External pressure scales with difficulty and is harsher outside the democratic zone.
  const pressure = content.difficulty.externalPressure * (zone === 'totalitarian' ? 2 : zone === 'authoritarian' ? 1 : 0.5);
  s.stats.economy = clampStat(s.stats.economy - pressure);
  s.stats.stability = clampStat(s.stats.stability - pressure);

  // 4. Owned reforms' per-turn effects.
  for (const id of s.ownedReforms) {
    const reform = content.reforms.find((r) => r.id === id);
    if (reform) s = applyEffects(s, reform.perTurn);
  }

  // 5. Event selection.
  const picked = pickEvent(s, content);
  s = picked.state;
  if (picked.eventId) {
    s = {
      ...s,
      pendingEventId: picked.eventId,
      eventHistory: { ...s.eventHistory, [picked.eventId]: s.turn },
    };
  }

  // 6. Defeat / victory.
  s = checkConditions(s, content);

  return { state: s, firedEventId: picked.eventId };
}
