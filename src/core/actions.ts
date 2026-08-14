import type { GameContent, GameState, PlayerAction } from './types';
import { applyEffects } from './effects';

/**
 * Why a reform can't be bought right now. `null` means it can. The ui renders these
 * (never re-deriving the logic): 'needsPrevious' = locked, 'notEnough*' = unaffordable,
 * 'owned'/'unavailable' = not purchasable. Order encodes priority for display.
 */
export type ReformBlock =
  | 'unavailable' // no such reform, or the game is over
  | 'owned'
  | 'needsPrevious'
  | 'notEnoughInfluence'
  | 'notEnoughTreasury';

export function canBuyReformReason(
  state: GameState,
  content: GameContent,
  reformId: string,
): ReformBlock | null {
  const reform = content.reforms.find((r) => r.id === reformId);
  if (!reform || state.outcome) return 'unavailable';
  if (state.ownedReforms.includes(reformId)) return 'owned';
  if (reform.tier > 0) {
    const prev = content.reforms.find(
      (r) => r.branch === reform.branch && r.tier === reform.tier - 1,
    );
    if (prev && !state.ownedReforms.includes(prev.id)) return 'needsPrevious';
  }
  if (state.influence < reform.costInfluence) return 'notEnoughInfluence';
  if (state.stats.treasury < reform.costTreasury) return 'notEnoughTreasury';
  return null;
}

export function canBuyReform(state: GameState, content: GameContent, reformId: string): boolean {
  return canBuyReformReason(state, content, reformId) === null;
}

/** Applies player actions between ticks. Invalid actions are ignored (no throw — server-friendly). */
export function applyPlayerActions(
  state: GameState,
  actions: PlayerAction[],
  content: GameContent,
): GameState {
  let s = state;
  for (const action of actions) {
    if (action.type === 'buyReform' && action.reformId) {
      if (!canBuyReform(s, content, action.reformId)) continue;
      const reform = content.reforms.find((r) => r.id === action.reformId);
      if (!reform) continue;
      s = applyEffects(
        {
          ...s,
          ownedReforms: [...s.ownedReforms, reform.id],
          influence: s.influence - reform.costInfluence,
        },
        [{ target: 'treasury', delta: -reform.costTreasury }, ...reform.instant],
      );
    } else if (action.type === 'answerEvent' && action.optionIndex !== undefined) {
      if (!s.pendingEventId) continue;
      const event = content.events.find((e) => e.id === s.pendingEventId);
      const option = event?.options[action.optionIndex];
      if (!option) continue;
      s = applyEffects({ ...s, pendingEventId: null }, option.effects);
      if (option.flags?.amendConstitution) {
        s = { ...s, constitutionAmended: true };
      }
      if (option.flags?.stepDown) {
        s = { ...s, stepDownPending: true };
      }
      if (option.delayedEffects && option.delayedEffects.length > 0) {
        const scheduled = option.delayedEffects.map((d) => ({
          applyOnTurn: s.turn + d.afterTurns,
          effects: d.effects,
        }));
        s = { ...s, scheduledEffects: [...s.scheduledEffects, ...scheduled] };
      }
    }
  }
  return s;
}
