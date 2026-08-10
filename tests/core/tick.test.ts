import { describe, expect, it } from 'vitest';
import { tick } from '../../src/core/tick';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';
import type { GameContent, GameState, Stats } from '../../src/core/types';

/** Isolate tick() math from event/rng noise: no random/external/triggered events can fire. */
function quietContent(): GameContent {
  const base = buildContent('normal');
  return {
    ...base,
    difficulty: { ...base.difficulty, randomEventChance: 0, externalEventChance: 0 },
    events: base.events.filter((e) => e.kind !== 'triggered'),
  };
}

function stateAt(content: GameContent, statPatch: Partial<Stats>, vector = 50): GameState {
  const s = initGame(content, 1);
  return { ...s, vector, stats: { ...s.stats, ...statPatch } };
}

describe('prosperity bonus', () => {
  it('adds nothing at or below the threshold — income matches the plain linear formula', () => {
    const content = quietContent();
    const b = content.balance;
    const s = stateAt(content, { economy: b.prosperityThreshold, corruption: 0, treasury: 50 });
    const income = tick(s, content).state.stats.treasury - s.stats.treasury;
    const linear =
      b.incomeBase +
      b.prosperityThreshold * b.incomeEconomyFactor +
      content.country.resources * b.incomeResourceFactor -
      b.upkeep;
    expect(income).toBeCloseTo(linear, 5);
  });

  it('at economy=100 income is meaningfully more than linear, but roughly 1.5x — not more', () => {
    const content = quietContent();
    const b = content.balance;
    const s = stateAt(content, { economy: 100, corruption: 0, treasury: 50 });
    const income = tick(s, content).state.stats.treasury - s.stats.treasury;
    const linear100 = b.incomeBase + 100 * b.incomeEconomyFactor + content.country.resources * b.incomeResourceFactor - b.upkeep;
    const ratio = income / linear100;
    expect(income).toBeGreaterThan(linear100);
    expect(ratio).toBeGreaterThan(1.2); // a real prosperity effect, not a rounding error
    expect(ratio).toBeLessThanOrEqual(1.5); // "roughly 1.5x ... not more"
  });

  it('scales linearly with economy above the threshold', () => {
    const content = quietContent();
    const b = content.balance;
    const at80 = tick(stateAt(content, { economy: 80, corruption: 0, treasury: 50 }), content).state.stats.treasury;
    const at90 = tick(stateAt(content, { economy: 90, corruption: 0, treasury: 50 }), content).state.stats.treasury;
    // Each extra economy point above threshold adds incomeEconomyFactor (linear) + prosperityFactor (bonus).
    const perPoint = b.incomeEconomyFactor + b.prosperityFactor;
    expect(at90 - at80).toBeCloseTo(perPoint * 10, 5);
  });
});

describe('corruption skim', () => {
  it('reduces income relative to zero corruption by exactly the configured fraction', () => {
    const content = quietContent();
    const b = content.balance;
    const clean = stateAt(content, { economy: 60, corruption: 0, treasury: 50 });
    const corrupt = stateAt(content, { economy: 60, corruption: 100, treasury: 50 });
    const cleanIncome = tick(clean, content).state.stats.treasury - clean.stats.treasury;
    const corruptIncome = tick(corrupt, content).state.stats.treasury - corrupt.stats.treasury;
    const grossRevenue = cleanIncome + b.upkeep; // clean run has zero skim, so income = gross - upkeep
    const expected = grossRevenue * (1 - 100 * b.corruptionSkimFactor) - b.upkeep;
    expect(corruptIncome).toBeCloseTo(expected, 5);
    expect(corruptIncome).toBeLessThan(cleanIncome);
  });

  it('at corruption=100 the state loses 40-50% of gross income (GDD target)', () => {
    const content = quietContent();
    const skim = 100 * content.balance.corruptionSkimFactor;
    expect(skim).toBeGreaterThanOrEqual(0.4);
    expect(skim).toBeLessThanOrEqual(0.5);
  });

  it('skim scales linearly with corruption', () => {
    const content = quietContent();
    const at0 = tick(stateAt(content, { economy: 60, corruption: 0, treasury: 50 }), content).state.stats.treasury;
    const at50 = tick(stateAt(content, { economy: 60, corruption: 50, treasury: 50 }), content).state.stats.treasury;
    const at100 = tick(stateAt(content, { economy: 60, corruption: 100, treasury: 50 }), content).state.stats.treasury;
    const drop50 = at0 - at50;
    const drop100 = at0 - at100;
    expect(drop100).toBeCloseTo(drop50 * 2, 5);
  });
});

describe('corruption growth by zone', () => {
  it('grows by the base rate in non-totalitarian zones', () => {
    const content = quietContent();
    const b = content.balance;
    const s = stateAt(content, { corruption: 30 }, 10); // democratic zone
    const after = tick(s, content).state.stats.corruption;
    expect(after - 30).toBeCloseTo(b.corruptionGrowth, 5);
  });

  it('grows faster in the totalitarian zone — unchecked power breeds theft', () => {
    const content = quietContent();
    const b = content.balance;
    const democratic = tick(stateAt(content, { corruption: 30 }, 10), content).state.stats.corruption;
    const totalitarian = tick(stateAt(content, { corruption: 30 }, 90), content).state.stats.corruption;
    expect(totalitarian - 30).toBeCloseTo(b.corruptionGrowth * b.corruptionGrowthTotalitarianMultiplier, 5);
    expect(totalitarian).toBeGreaterThan(democratic);
  });

  it('clamps at 100', () => {
    const content = quietContent();
    const s = stateAt(content, { corruption: 100 }, 90);
    expect(tick(s, content).state.stats.corruption).toBe(100);
  });
});

describe('corruption side effects', () => {
  it('drags development down each month, more so at higher corruption', () => {
    const content = quietContent();
    const low = tick(stateAt(content, { corruption: 10, development: 50 }, 50), content).state.stats.development;
    const high = tick(stateAt(content, { corruption: 90, development: 50 }, 50), content).state.stats.development;
    expect(high).toBeLessThan(low);
  });

  it('grants a small eliteLoyalty bonus once corruption crosses the bond threshold', () => {
    const content = quietContent();
    const b = content.balance;
    const below = stateAt(content, { corruption: b.corruptionEliteBondThreshold - 5, eliteLoyalty: 50, treasury: 50 }, 50);
    const above = stateAt(content, { corruption: b.corruptionEliteBondThreshold + 5, eliteLoyalty: 50, treasury: 50 }, 50);
    const afterBelow = tick(below, content).state.stats.eliteLoyalty;
    const afterAbove = tick(above, content).state.stats.eliteLoyalty;
    expect(afterAbove).toBeGreaterThan(afterBelow);
  });

  it('is not a defeat condition by itself — 100 corruption alone does not end the game', () => {
    const content = quietContent();
    const s = stateAt(content, { corruption: 100 }, 50);
    expect(tick(s, content).state.outcome).toBeNull();
  });
});
