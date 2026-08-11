import type { Lang, LocalizedText, VectorZone } from '../core/types';
import type { Ui, VictoryRankKey } from './types';
import { en } from './en';
import { ru } from './ru';
import { uz } from './uz';

export type { Ui, RankText, BranchKey, VictoryRankKey } from './types';

/** The default language. English per product decision. */
export const DEFAULT_LANG: Lang = 'en';

/** Selectable languages, in display order. */
export const LANGS: Lang[] = ['en', 'ru', 'uz'];

/** Native language names for the language switcher (same in every locale). */
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  ru: 'Русский',
  uz: 'O‘zbek',
};

/** Fixed ui strings per language. */
export const uiStrings: Record<Lang, Ui> = { en, ru, uz };

/** Pick the active-language string out of a content LocalizedText. */
export function loc(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

/** Fill {placeholder} tokens in a pattern string. */
export function format(pattern: string, vars: Record<string, string | number>): string {
  return pattern.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ''));
}

/** The in-game month the term begins on (turn 0). */
export const START_YEAR = 2026;
const START_MONTH = 0; // January

/**
 * Map a turn index (one tick = one month) to a localized month name + calendar year.
 * Turn 0 is January 2026.
 */
export function gameDate(turn: number, ui: Ui): { month: string; year: number } {
  const total = START_MONTH + turn;
  return {
    month: ui.months[((total % 12) + 12) % 12],
    year: START_YEAR + Math.floor(total / 12),
  };
}

/**
 * Resolve which victory rank a run earned (GDD §9). Pure presentation selector: the copy
 * for the returned key lives in uiStrings[lang].victory. Every victory is now a voluntary
 * step-down — the rank reflects how thriving the country was when you left. Stepping down
 * with an excellent country is the canonical top ending, «Ушёл непобеждённым».
 */
export function victoryRankKey(avgStats: number, zone: VectorZone): VictoryRankKey {
  if (avgStats >= 75) return 'steppedDown';
  if (avgStats >= 60) {
    if (zone === 'democratic') return 'fatherDemocracy';
    if (zone === 'totalitarian') return 'fatherNation';
    return 'manager';
  }
  if (avgStats >= 45) return 'okay';
  return 'survived';
}
