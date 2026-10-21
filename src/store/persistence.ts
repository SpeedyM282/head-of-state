import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import type { DefeatKind, Difficulty, GameState, Lang } from '../core/types';
import { DEFAULT_LANG, LANGS } from '../i18n';
import type { Theme } from './themeStore';

// Storage backend: localStorage on the web; @capacitor/preferences on native (WebView
// localStorage isn't guaranteed to survive — Capacitor advises against it for app data). Preferences is async
// while every load*/save* below is sync (stores read their initial state at module load), so
// on native initPersistence() hydrates an in-memory cache before the app mounts and writes go
// through to Preferences in the background.

// v2: GameState gained term/constitutionAmended/awaitingInauguration/scheduledEffects.
// v3: GameState gained stepDownPending (mandatory per-term run/step-down choice).
// Bumping the key discards incompatible older saves rather than loading a malformed state.
// countryId (country selection) was added WITHOUT a bump — loadGame() falls back to
// 'absurdistan' for older saves instead of discarding them, since GameState.countryId has
// always been populated too and can back-fill it.
const KEY = 'prezident.save.v3';
const LANG_KEY = 'prezident.lang.v1';
const TUTORIAL_KEY = 'prezident.tutorial.v1';
const THEME_KEY = 'prezident.theme.v1';
const MEDALS_KEY = 'prezident.medals.v1';
const ALL_KEYS = [KEY, LANG_KEY, TUTORIAL_KEY, THEME_KEY, MEDALS_KEY];
const DEFEAT_KINDS: readonly DefeatKind[] = ['coup', 'revolution', 'default', 'elections'];
const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

export interface SaveData {
  state: GameState;
  difficulty: Difficulty;
  countryId: string;
}

/** First-time-user tutorial progress. Deliberately separate from SaveData/KEY: replaying a
 * game ("Играть снова") must never re-trigger tips the player has already seen. */
export interface TutorialData {
  completed: boolean;
  seenTips: string[];
}

/** Medals progress — meta-progression across every game, separate from SaveData (a new game
 * or «Играть снова» never takes medals away). */
export interface MedalsData {
  /** Earned medal ids, in the order they were earned. */
  earned: string[];
  /** Earned but not yet looked at on the Медали screen (they get a halo there). */
  unseen: string[];
  /** Every defeat kind the player has suffered, across games («Коллекционер катастроф»). */
  defeatsSeen: DefeatKind[];
}

const DEFAULT_MEDALS: MedalsData = { earned: [], unseen: [], defeatsSeen: [] };

const DEFAULT_TUTORIAL: TutorialData = { completed: false, seenTips: [] };

/** The async key-value store a native platform provides (Preferences' shape, minus wrappers). */
export interface AsyncKeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

interface KeyValueBackend {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
}

const localStorageBackend: KeyValueBackend = {
  get: (key) => localStorage.getItem(key),
  set: (key, value) => localStorage.setItem(key, value),
  remove: (key) => localStorage.removeItem(key),
};

let backend: KeyValueBackend = localStorageBackend;

function nativeStore(): AsyncKeyValueStore | null {
  if (!Capacitor.isNativePlatform()) return null;
  return {
    get: async (key) => (await Preferences.get({ key })).value,
    set: (key, value) => Preferences.set({ key, value }),
    remove: (key) => Preferences.remove({ key }),
  };
}

/**
 * Must resolve before any store module is imported (main.tsx awaits it, then imports App).
 * With no async store (web, tests) the backend is plain localStorage. A failed write to the
 * async store is dropped silently — same policy as a full localStorage below.
 */
export async function initPersistence(store: AsyncKeyValueStore | null = nativeStore()): Promise<void> {
  if (!store) {
    backend = localStorageBackend;
    return;
  }
  const cache = new Map<string, string>();
  await Promise.all(
    ALL_KEYS.map(async (key) => {
      try {
        const value = await store.get(key);
        if (value !== null) cache.set(key, value);
      } catch {
        // Unreadable key — treated as absent, like a corrupt save.
      }
    }),
  );
  backend = {
    get: (key) => cache.get(key) ?? null,
    set: (key, value) => {
      cache.set(key, value);
      store.set(key, value).catch(() => {});
    },
    remove: (key) => {
      cache.delete(key);
      store.remove(key).catch(() => {});
    },
  };
}

export function saveGame(data: SaveData): void {
  try {
    backend.set(KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — the game continues without saving.
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = backend.get(KEY);
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
    backend.remove(KEY);
  } catch {
    // ignore
  }
}

export function loadLang(): Lang {
  try {
    const raw = backend.get(LANG_KEY);
    return raw && (LANGS as string[]).includes(raw) ? (raw as Lang) : DEFAULT_LANG;
  } catch {
    return DEFAULT_LANG;
  }
}

export function saveLang(lang: Lang): void {
  try {
    backend.set(LANG_KEY, lang);
  } catch {
    // ignore
  }
}

export function loadTheme(): Theme {
  try {
    const raw = backend.get(THEME_KEY);
    return raw && THEMES.includes(raw as Theme) ? (raw as Theme) : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: Theme): void {
  try {
    backend.set(THEME_KEY, theme);
  } catch {
    // ignore
  }
}

export function loadTutorial(): TutorialData {
  try {
    const raw = backend.get(TUTORIAL_KEY);
    if (!raw) return DEFAULT_TUTORIAL;
    const parsed = JSON.parse(raw) as Partial<TutorialData>;
    return {
      completed: parsed.completed === true,
      seenTips: Array.isArray(parsed.seenTips) ? parsed.seenTips.filter((t) => typeof t === 'string') : [],
    };
  } catch {
    return DEFAULT_TUTORIAL;
  }
}

export function saveTutorial(data: TutorialData): void {
  try {
    backend.set(TUTORIAL_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — tutorial state just won't persist across reloads.
  }
}

function stringList(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : [];
}

export function loadMedals(): MedalsData {
  try {
    const raw = backend.get(MEDALS_KEY);
    if (!raw) return DEFAULT_MEDALS;
    const parsed = JSON.parse(raw) as Partial<Record<keyof MedalsData, unknown>>;
    return {
      earned: stringList(parsed.earned),
      unseen: stringList(parsed.unseen),
      defeatsSeen: stringList(parsed.defeatsSeen).filter((d): d is DefeatKind => (DEFEAT_KINDS as readonly string[]).includes(d)),
    };
  } catch {
    return DEFAULT_MEDALS;
  }
}

export function saveMedals(data: MedalsData): void {
  try {
    backend.set(MEDALS_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable — medals just won't persist across reloads.
  }
}
