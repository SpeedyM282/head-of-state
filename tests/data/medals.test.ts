import { describe, expect, it } from 'vitest';
import { buildContent } from '../../src/data';
import { initGame } from '../../src/core/init';
import type { GameState } from '../../src/core/types';
import { MEDALS, newlyEarned, type MedalContext } from '../../src/data/medals';

const content = buildContent('absurdistan', 'normal');
const base = initGame(content, 1);
// Month 12 by default — the stat/vector medals only count from then on (see the gate test below).
const ctx = (state: Partial<GameState> = {}, defeatsSeen: MedalContext['defeatsSeen'] = []): MedalContext => ({
  state: { ...base, turn: 12, ...state },
  content,
  defeatsSeen,
});
const medal = (id: string) => {
  const m = MEDALS.find((x) => x.id === id);
  if (!m) throw new Error(`missing medal ${id}`);
  return m;
};

describe('MEDALS: shape', () => {
  it('has 24 medals with unique ids and text in all three languages', () => {
    expect(MEDALS).toHaveLength(24);
    expect(new Set(MEDALS.map((m) => m.id)).size).toBe(24);
    for (const m of MEDALS) {
      for (const lang of ['en', 'ru', 'uz'] as const) {
        expect(m.name[lang].length).toBeGreaterThan(0);
        expect(m.condition[lang].length).toBeGreaterThan(0);
      }
    }
  });

  it('a brand-new game earns nothing', () => {
    expect(newlyEarned([], ctx({ turn: 0 }))).toEqual([]);
  });

  it('stat and vector medals only count from month 12, and say so', () => {
    const strongStart = { stats: { economy: 90, treasury: 95, approval: 90, eliteLoyalty: 95, stability: 90, development: 90, corruption: 5 }, vector: 5 };
    for (const id of ['invisible-hand', 'full-treasury', 'peoples-favourite', 'elites-content', 'clean-hands', 'calm-waters', 'democrat-to-the-bone']) {
      expect(medal(id).check(ctx({ ...strongStart, turn: 11 }))).toBe(false);
      expect(medal(id).check(ctx({ ...strongStart, turn: 12 }))).toBe(true);
      expect(medal(id).condition.ru).toContain('после первого года');
      expect(medal(id).condition.en).toContain('after the first year');
      expect(medal(id).condition.uz).toContain('birinchi yildan keyin');
    }
    expect(medal('iron-fist').check(ctx({ vector: 95, turn: 11 }))).toBe(false);
    expect(medal('all-sorted').check(ctx({ stats: { ...base.stats, corruption: 90 }, turn: 11 }))).toBe(false);
    // Ungated medals keep their own conditions.
    expect(medal('first-decree').condition.ru).not.toContain('после первого года');
  });
});

describe('MEDALS: conditions', () => {
  const firstReform = content.reforms.find((r) => r.tier === 0)!;

  it('first decree / reformist count adopted reforms', () => {
    expect(medal('first-decree').check(ctx({ ownedReforms: [firstReform.id] }))).toBe(true);
    const ten = content.reforms.slice(0, 10).map((r) => r.id);
    expect(medal('reformist').check(ctx({ ownedReforms: ten }))).toBe(true);
    expect(medal('reformist').check(ctx({ ownedReforms: ten.slice(0, 9) }))).toBe(false);
  });

  it('a hundred quiet days: 3 months in, no reforms', () => {
    expect(medal('hundred-quiet-days').check(ctx({ turn: 3 }))).toBe(true);
    expect(medal('hundred-quiet-days').check(ctx({ turn: 2 }))).toBe(false);
    expect(medal('hundred-quiet-days').check(ctx({ turn: 3, ownedReforms: [firstReform.id] }))).toBe(false);
  });

  it('term milestones', () => {
    expect(medal('full-term').check(ctx({ turn: content.difficulty.turnsToWin }))).toBe(true);
    expect(medal('second-wind').check(ctx({ term: 2 }))).toBe(true);
    expect(medal('constitutional-genius').check(ctx({ constitutionAmended: true }))).toBe(true);
    expect(medal('long-reign').check(ctx({ turn: 240 }))).toBe(true);
    expect(medal('long-reign').check(ctx({ turn: 239 }))).toBe(false);
  });

  it('top of the branch / all branches', () => {
    const economy = content.reforms.filter((r) => r.branch === 'economy').sort((a, b) => a.tier - b.tier);
    expect(medal('top-of-the-branch').check(ctx({ ownedReforms: [economy[economy.length - 1].id] }))).toBe(true);
    expect(medal('top-of-the-branch').check(ctx({ ownedReforms: [economy[0].id] }))).toBe(false);
    const oneEach = (['economy', 'force', 'social', 'propaganda'] as const).map((b) => content.reforms.find((r) => r.branch === b)!.id);
    expect(medal('all-branches').check(ctx({ ownedReforms: oneEach }))).toBe(true);
    expect(medal('all-branches').check(ctx({ ownedReforms: oneEach.slice(0, 3) }))).toBe(false);
  });

  it('stat thresholds', () => {
    expect(medal('invisible-hand').check(ctx({ stats: { ...base.stats, economy: 81 } }))).toBe(true);
    expect(medal('invisible-hand').check(ctx({ stats: { ...base.stats, economy: 80 } }))).toBe(false);
    expect(medal('clean-hands').check(ctx({ stats: { ...base.stats, corruption: 9 } }))).toBe(true);
    expect(medal('all-sorted').check(ctx({ stats: { ...base.stats, corruption: 81 } }))).toBe(true);
    expect(
      medal('all-sorted').check(ctx({ stats: { ...base.stats, corruption: 81 }, outcome: { result: 'defeat', defeat: 'coup', turn: 9 } })),
    ).toBe(false);
  });

  it('calm waters needs every stat safe at once', () => {
    const calm = { economy: 60, treasury: 60, approval: 60, eliteLoyalty: 60, stability: 60, development: 60, corruption: 40 };
    expect(medal('calm-waters').check(ctx({ stats: calm }))).toBe(true);
    expect(medal('calm-waters').check(ctx({ stats: { ...calm, corruption: 41 } }))).toBe(false);
    expect(medal('calm-waters').check(ctx({ stats: { ...calm, development: 59 } }))).toBe(false);
  });

  it('vector extremes and zone elections', () => {
    expect(medal('democrat-to-the-bone').check(ctx({ vector: 9 }))).toBe(true);
    expect(medal('iron-fist').check(ctx({ vector: 91 }))).toBe(true);
    expect(medal('admin-resource').check(ctx({ awaitingInauguration: true, vector: 50 }))).toBe(true);
    expect(medal('admin-resource').check(ctx({ awaitingInauguration: false, vector: 50 }))).toBe(false);
    expect(medal('ninety-nine-seven').check(ctx({ awaitingInauguration: true, vector: 90 }))).toBe(true);
    expect(medal('ninety-nine-seven').check(ctx({ awaitingInauguration: true, vector: 50 }))).toBe(false);
  });

  it('outcomes and the cross-game defeat collection', () => {
    expect(medal('left-undefeated').check(ctx({ outcome: { result: 'victory', turn: 100 } }))).toBe(true);
    expect(medal('experience-counts').check(ctx({ outcome: { result: 'defeat', defeat: 'default', turn: 20 } }))).toBe(true);
    expect(medal('disaster-collector').check(ctx({}, ['coup', 'revolution', 'default']))).toBe(false);
    expect(medal('disaster-collector').check(ctx({}, ['coup', 'revolution', 'default', 'elections']))).toBe(true);
  });

  it('crisis manager counts distinct events', () => {
    const history = Object.fromEntries(Array.from({ length: 25 }, (_, i) => [`e${i}`, i]));
    expect(medal('crisis-manager').check(ctx({ eventHistory: history }))).toBe(true);
  });
});

describe('newlyEarned', () => {
  it('skips already-earned medals and keeps MEDALS order', () => {
    const state = { stats: { ...base.stats, economy: 90, treasury: 95 }, ownedReforms: [content.reforms[0].id] };
    expect(newlyEarned([], ctx(state))).toEqual(['first-decree', 'invisible-hand', 'full-treasury']);
    expect(newlyEarned(['first-decree', 'invisible-hand'], ctx(state))).toEqual(['full-treasury']);
  });
});
