import type { Difficulty, GameState, Lang } from '../core/types';
import { DEFAULT_LANG, LANGS } from '../i18n';

// MVP persistence: localStorage adapter.
// TODO(stage 4): swap the storage backend to @capacitor/preferences — only this file changes.

const KEY = 'prezident.save.v1';
const LANG_KEY = 'prezident.lang.v1';

export interface SaveData {
  state: GameState;
  difficulty: Difficulty;
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
    return raw ? (JSON.parse(raw) as SaveData) : null;
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
