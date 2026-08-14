import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { clearSave, loadGame, loadLang, saveGame, saveLang, type SaveData } from '../../src/store/persistence';
import { buildContent } from '../../src/data';
import { initGame } from '../../src/core/init';
import { DEFAULT_LANG } from '../../src/i18n';

/**
 * This suite runs under vitest's `node` environment, which has no Storage global —
 * persistence.ts itself makes no browser assumptions beyond `localStorage` existing, so a
 * minimal in-memory stand-in is enough to exercise it.
 */
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
  keys(): string[] {
    return [...this.store.keys()];
  }
}

let memoryStorage: MemoryStorage;

beforeEach(() => {
  memoryStorage = new MemoryStorage();
  (globalThis as { localStorage?: Storage }).localStorage = memoryStorage as unknown as Storage;
});

afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

const content = buildContent('absurdistan', 'normal');

function makeSave(countryId: string): SaveData {
  return { state: initGame(content, 1), difficulty: 'normal', countryId };
}

describe('persistence: save/load round-trip', () => {
  it('round-trips state, difficulty and countryId', () => {
    const save = makeSave('no');
    saveGame(save);
    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.countryId).toBe('no');
    expect(loaded!.difficulty).toBe('normal');
    expect(loaded!.state).toEqual(save.state);
  });

  it('returns null when nothing is saved', () => {
    expect(loadGame()).toBeNull();
  });

  it('clearSave removes the save', () => {
    saveGame(makeSave('absurdistan'));
    clearSave();
    expect(loadGame()).toBeNull();
  });
});

describe('persistence: countryId fallback for pre-feature saves', () => {
  it('falls back to state.countryId when the top-level countryId field is missing', () => {
    saveGame(makeSave('no')); // establishes the real storage key without hardcoding it
    const key = memoryStorage.keys()[0];
    const state = initGame(content, 1); // state.countryId has always been populated
    memoryStorage.setItem(key, JSON.stringify({ state, difficulty: 'normal' }));

    const loaded = loadGame();
    expect(loaded).not.toBeNull();
    expect(loaded!.countryId).toBe(state.countryId);
  });

  it("falls back to 'absurdistan' when neither countryId is present", () => {
    saveGame(makeSave('no'));
    const key = memoryStorage.keys()[0];
    const state = initGame(content, 1);
    const { countryId: _countryId, ...stateWithoutCountryId } = state;
    memoryStorage.setItem(key, JSON.stringify({ state: stateWithoutCountryId, difficulty: 'normal' }));

    const loaded = loadGame();
    expect(loaded!.countryId).toBe('absurdistan');
  });
});

describe('persistence: language (settings)', () => {
  it('round-trips a saved language under its own key, independent of the game save', () => {
    saveGame(makeSave('no'));
    saveLang('ru');
    expect(loadLang()).toBe('ru');
    // The game save round-trips unaffected — language lives under a separate key.
    expect(loadGame()!.countryId).toBe('no');
  });

  it('falls back to the default language when nothing is saved', () => {
    expect(loadLang()).toBe(DEFAULT_LANG);
  });

  it('falls back to the default language for an unsupported stored value', () => {
    memoryStorage.setItem('prezident.lang.v1', 'fr');
    expect(loadLang()).toBe(DEFAULT_LANG);
  });
});
