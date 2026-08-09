import { describe, expect, it } from 'vitest';
import { applyPlayerActions, canBuyReform, canBuyReformReason } from '../../src/core/actions';
import { initGame } from '../../src/core/init';
import { buildContent } from '../../src/data';

const content = buildContent('normal');

describe('reform purchase', () => {
  it('requires influence, treasury and previous tier', () => {
    let s = { ...initGame(content, 1), influence: 100 };
    expect(canBuyReform(s, content, 'eco-business')).toBe(false); // tier 1 without tier 0
    expect(canBuyReform(s, content, 'eco-tax')).toBe(true);
    s = applyPlayerActions(s, [{ type: 'buyReform', reformId: 'eco-tax' }], content);
    expect(s.ownedReforms).toContain('eco-tax');
    expect(canBuyReform(s, content, 'eco-business')).toBe(true);
    expect(canBuyReform(s, content, 'eco-tax')).toBe(false); // no double purchase
  });

  it('charges influence and treasury and applies instant effects', () => {
    const s0 = { ...initGame(content, 1), influence: 10 };
    const s1 = applyPlayerActions(s0, [{ type: 'buyReform', reformId: 'eco-tax' }], content);
    expect(s1.influence).toBe(10 - 3);
    expect(s1.stats.treasury).toBe(s0.stats.treasury - 10);
    expect(s1.stats.economy).toBe(s0.stats.economy + 6);
  });

  it('ignores unaffordable purchases silently', () => {
    const s0 = { ...initGame(content, 1), influence: 0 };
    const s1 = applyPlayerActions(s0, [{ type: 'buyReform', reformId: 'eco-tax' }], content);
    expect(s1.ownedReforms).toHaveLength(0);
  });
});

describe('answering events', () => {
  it('applies the chosen option and clears pendingEventId', () => {
    const s0 = { ...initGame(content, 1), pendingEventId: 'rnd-meme' };
    const s1 = applyPlayerActions(s0, [{ type: 'answerEvent', optionIndex: 0 }], content);
    expect(s1.pendingEventId).toBeNull();
    expect(s1.stats.approval).toBe(s0.stats.approval + 6);
  });
});

describe('canBuyReformReason', () => {
  it('returns null exactly when the reform is purchasable', () => {
    const s = { ...initGame(content, 1), influence: 100, stats: { ...initGame(content, 1).stats, treasury: 100 } };
    expect(canBuyReformReason(s, content, 'eco-tax')).toBeNull();
  });

  it('reports needsPrevious when the prior tier is missing', () => {
    const s = { ...initGame(content, 1), influence: 100, stats: { ...initGame(content, 1).stats, treasury: 100 } };
    expect(canBuyReformReason(s, content, 'eco-business')).toBe('needsPrevious');
  });

  it('reports notEnoughInfluence, then notEnoughTreasury, in that priority', () => {
    const base = initGame(content, 1);
    const poorInfluence = { ...base, influence: 0, stats: { ...base.stats, treasury: 100 } };
    expect(canBuyReformReason(poorInfluence, content, 'eco-tax')).toBe('notEnoughInfluence');
    const poorTreasury = { ...base, influence: 100, stats: { ...base.stats, treasury: 0 } };
    expect(canBuyReformReason(poorTreasury, content, 'eco-tax')).toBe('notEnoughTreasury');
  });

  it('reports owned after purchase and unavailable for unknown ids / finished games', () => {
    let s = { ...initGame(content, 1), influence: 100, stats: { ...initGame(content, 1).stats, treasury: 100 } };
    s = applyPlayerActions(s, [{ type: 'buyReform', reformId: 'eco-tax' }], content);
    expect(canBuyReformReason(s, content, 'eco-tax')).toBe('owned');
    expect(canBuyReformReason(s, content, 'no-such-reform')).toBe('unavailable');
    const over = { ...s, outcome: { result: 'victory', turn: 10 } as const };
    expect(canBuyReformReason(over, content, 'eco-business')).toBe('unavailable');
  });

  it('stays consistent with canBuyReform', () => {
    const s = { ...initGame(content, 1), influence: 100, stats: { ...initGame(content, 1).stats, treasury: 100 } };
    expect(canBuyReform(s, content, 'eco-tax')).toBe(canBuyReformReason(s, content, 'eco-tax') === null);
    expect(canBuyReform(s, content, 'eco-business')).toBe(canBuyReformReason(s, content, 'eco-business') === null);
  });
});
