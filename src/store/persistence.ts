import type { Difficulty, GameState, Lang } from '../core/types';
import { DEFAULT_LANG, LANGS } from '../i18n';

// MVP persistence: localStorage adapter.
// TODO(stage 4): swap the storage backend to @capacitor/preferences — only this file changes.

// v2: GameState gained term/constitutionAmended/awaitingInauguration/scheduledEffects.
// v3: GameState gained stepDownPending (mandatory per-term run/step-down choice).
// Bumping the key discards incompatible older saves rather than loading a malformed state.
// countryId (country selection) was added WITHOUT a bump — loadGame() falls back to
// 'absurdistan' for older saves instead of discarding them, since GameState.countryId has
// always been populated too and can back-fill it.
const KEY = 'prezident.save.v3';
const LANG_KEY = 'prezident.lang.v1';

export interface SaveData {
  state: GameState;
  difficulty: Difficulty;
  countryId: string;
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — the game continues without saving.
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SaveData;
    const countryId = parsed.countryId ?? parsed.state?.countryId ?? 'absurdistan';
    return { ...parsed, countryId };
  } catch {
    return null;
  }
}

export function clearSave(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function loadLang(): Lang {
  try {
    const raw = localStorage.getItem(LANG_KEY);
    return raw && (LANGS as string[]).includes(raw) ? (raw as Lang) : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function saveLang(lang: Lang): void {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // ignore
  }
}
