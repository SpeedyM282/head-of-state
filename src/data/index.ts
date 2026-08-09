import type { Difficulty, GameContent } from '../core/types';
import { balance } from './balance';
import { difficulties } from './difficulty';
import { absurdistan } from './countries/absurdistan';
import { reforms } from './reforms';
import { events } from './events';

/** Assembles the injected content object. The core receives this as a parameter. */
export function buildContent(difficulty: Difficulty): GameContent {
  return {
    country: absurdistan,
    difficulty: difficulties[difficulty],
    reforms,
    events,
    balance,
  };
}
