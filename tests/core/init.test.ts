import { describe, expect, it } from 'vitest';
import { deriveStartStats, deriveStartVector, initGame } from '../../src/core/init';
import { tick } from '../../src/core/tick';
import { vectorZone } from '../../src/core/vector';
import { buildContent } from '../../src/data';
import type { CountryProfile } from '../../src/core/types';

const normalContent = buildContent('absurdistan', 'normal');
const easy = buildContent('absurdistan', 'easy').difficulty;
const hard = buildContent('absurdistan', 'hard').difficulty;

function profile(overrides: Partial<CountryProfile> = {}): CountryProfile {
  return {
    id: 'test',
    name: { en: 'Test', ru: 'Тест', uz: 'Test' },
    description: { en: 'x', ru: 'x', uz: 'x' },
    flagEmoji: '🏳',
    population: 1_000_000,
    areaKm2: 10_000,
    resources: 50,
    hasSeaAccess: true,
    economyLevel: 50,
    corruptionLevel: 30,
    democracyLevel: 50,
    developmentLevel: 45,
    ...overrides,
  };
}

describe('deriveStartStats', () => {
  it('passes country levels through on normal (zero offsets) and takes the rest from difficulty', () => {
    const p = profile({ economyLevel: 50, corruptionLevel: 30, developmentLevel: 45 });
    const stats = deriveStartStats(p, normalContent.difficulty);
    expect(stats.economy).toBe(50);
    expect(stats.corruption).toBe(30);
    expect(stats.development).toBe(45);
    expect(stats.treasury).toBe(normalContent.difficulty.startStats.treasury);
    expect(stats.approval).toBe(normalContent.difficulty.startStats.approval);
    expect(stats.eliteLoyalty).toBe(normalContent.difficulty.startStats.eliteLoyalty);
    expect(stats.stability).toBe(normalContent.difficulty.startStats.stability);
  });

  it('applies the per-difficulty offset on top of the country levels', () => {
    const p = profile({ economyLevel: 50, corruptionLevel: 30, developmentLevel: 45 });
    const easyStats = deriveStartStats(p, easy);
    const hardStats = deriveStartStats(p, hard);
    expect(easyStats.economy).toBe(50 + easy.levelOffsets.economy);
    expect(easyStats.corruption).toBe(30 + easy.levelOffsets.corruption);
    expect(easyStats.development).toBe(45 + easy.levelOffsets.development);
    expect(hardStats.economy).toBe(50 + hard.levelOffsets.economy);
    expect(hardStats.corruption).toBe(30 + hard.levelOffsets.corruption);
    expect(hardStats.development).toBe(45 + hard.levelOffsets.development);
  });

  it('clamps at the 0-100 boundaries regardless of the offset', () => {
    // easy: economy/development offset is positive, corruption offset is negative (per data/difficulty.ts).
    expect(deriveStartStats(profile({ economyLevel: 100 }), easy).economy).toBe(100);
    expect(deriveStartStats(profile({ developmentLevel: 100 }), easy).development).toBe(100);
    expect(deriveStartStats(profile({ corruptionLevel: 0 }), easy).corruption).toBe(0);
    // hard: economy/development offset is negative, corruption offset is positive.
    expect(deriveStartStats(profile({ economyLevel: 0 }), hard).economy).toBe(0);
    expect(deriveStartStats(profile({ developmentLevel: 0 }), hard).development).toBe(0);
    expect(deriveStartStats(profile({ corruptionLevel: 100 }), hard).corruption).toBe(100);
  });
});

describe('deriveStartVector', () => {
  it('inverts democracyLevel into the starting vector (high democracy = low vector)', () => {
    expect(deriveStartVector(profile({ democracyLevel: 80 }))).toBe(20);
    expect(deriveStartVector(profile({ democracyLevel: 10 }))).toBe(90);
    expect(deriveStartVector(profile({ democracyLevel: 50 }))).toBe(50);
  });

  it('clamps at the 0-100 boundaries', () => {
    expect(deriveStartVector(profile({ democracyLevel: 0 }))).toBe(100);
    expect(deriveStartVector(profile({ democracyLevel: 100 }))).toBe(0);
  });
});

describe('starting deep in the totalitarian zone', () => {
  it('a low-democracy country starts totalitarian and the game runs without throwing', () => {
    const lowDemocracy = profile({ id: 'low-dem', democracyLevel: 5 });
    const content = { ...normalContent, country: lowDemocracy };
    let state = initGame(content, 1);
    expect(vectorZone(state.vector)).toBe('totalitarian');
    for (let i = 0; i < 6; i++) {
      state = tick(state, content).state;
    }
    expect(state.turn).toBeGreaterThan(0);
  });
});
