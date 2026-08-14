import type { Difficulty, GameContent } from '../core/types';
import { balance } from './balance';
import { difficulties } from './difficulty';
import { countries, getCountryById } from './countries';

export { countries };
import { reforms } from './reforms';
import { events } from './events';

/** Assembles the injected content object. The core receives this as a parameter. */
export function buildContent(countryId: string, difficulty: Difficulty): GameContent {
  return {
    country: getCountryById(countryId),
    difficulty: difficulties[difficulty],
    reforms,
    events,
    balance,
  };
}
