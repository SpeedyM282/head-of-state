import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useTutorialStore } from '../../src/store/tutorialStore';
import { loadTutorial } from '../../src/store/persistence';

/** Same minimal in-memory Storage stand-in as tests/store/persistence.test.ts — this suite
 * runs under vitest's `node` environment, which has no Storage global. */
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
}

beforeEach(() => {
  (globalThis as { localStorage?: Storage }).localStorage = new MemoryStorage() as unknown as Storage;
  // Every test starts from a clean in-memory slate, regardless of what a previous test left behind
  // (the module-level `initial` snapshot from import time is stale by now anyway).
  useTutorialStore.setState({
    completed: false,
    seenTips: [],
    scriptedStep: null,
    jitEnabled: false,
    initialZone: null,
    activeTipId: null,
  });
});

afterEach(() => {
  delete (globalThis as { localStorage?: Storage }).localStorage;
});

describe('tutorialStore: scripted opening', () => {
  it('beginScripted starts at the first step with JIT disabled', () => {
    useTutorialStore.getState().beginScripted();
    const s = useTutorialStore.getState();
    expect(s.scriptedStep).toBe('stats');
    expect(s.jitEnabled).toBe(false);
  });

  it('advanceScripted walks the four steps in order', () => {
    const { beginScripted, advanceScripted } = useTutorialStore.getState();
    beginScripted();
    advanceScripted();
    expect(useTutorialStore.getState().scriptedStep).toBe('map');
    advanceScripted();
    expect(useTutorialStore.getState().scriptedStep).toBe('term');
    advanceScripted();
    expect(useTutorialStore.getState().scriptedStep).toBe('defeats');
  });

  it('advancing past the last step completes the tutorial, enables JIT, and persists', () => {
    useTutorialStore.setState({ scriptedStep: 'defeats', seenTips: ['danger-zone'] });
    useTutorialStore.getState().advanceScripted();
    const s = useTutorialStore.getState();
    expect(s.scriptedStep).toBeNull();
    expect(s.jitEnabled).toBe(true);
    expect(s.completed).toBe(true);
    expect(loadTutorial()).toEqual({ completed: true, seenTips: ['danger-zone'] });
  });

  it('is a no-op when the opening is not running', () => {
    useTutorialStore.getState().advanceScripted();
    const s = useTutorialStore.getState();
    expect(s.scriptedStep).toBeNull();
    expect(s.completed).toBe(false);
  });
});

describe('tutorialStore: skip', () => {
  it('abandons the scripted opening, marks completed, but leaves JIT enabled', () => {
    useTutorialStore.setState({ scriptedStep: 'map' });
    useTutorialStore.getState().skip();
    const s = useTutorialStore.getState();
    expect(s.scriptedStep).toBeNull();
    expect(s.jitEnabled).toBe(true);
    expect(s.completed).toBe(true);
    expect(loadTutorial().completed).toBe(true);
  });
});

describe('tutorialStore: JIT tips — one-time semantics', () => {
  it('showTip sets the active tip', () => {
    useTutorialStore.getState().showTip('danger-zone');
    expect(useTutorialStore.getState().activeTipId).toBe('danger-zone');
  });

  it('dismissActiveTip records the id as seen and persists it', () => {
    useTutorialStore.getState().showTip('danger-zone');
    useTutorialStore.getState().dismissActiveTip();
    const s = useTutorialStore.getState();
    expect(s.activeTipId).toBeNull();
    expect(s.seenTips).toEqual(['danger-zone']);
    expect(loadTutorial().seenTips).toEqual(['danger-zone']);
  });

  it('does not duplicate an id already in seenTips — a tip is truly one-time', () => {
    useTutorialStore.setState({ seenTips: ['danger-zone'] });
    useTutorialStore.getState().showTip('danger-zone');
    useTutorialStore.getState().dismissActiveTip();
    expect(useTutorialStore.getState().seenTips).toEqual(['danger-zone']);
  });

  it('is a no-op when nothing is active', () => {
    useTutorialStore.getState().dismissActiveTip();
    expect(useTutorialStore.getState().seenTips).toEqual([]);
  });
});

describe('tutorialStore: resetForReplay', () => {
  it('clears the completed flag and every seen tip, and persists the reset', () => {
    useTutorialStore.setState({ completed: true, seenTips: ['danger-zone', 'first-event'] });
    useTutorialStore.getState().resetForReplay();
    const s = useTutorialStore.getState();
    expect(s.completed).toBe(false);
    expect(s.seenTips).toEqual([]);
    expect(loadTutorial()).toEqual({ completed: false, seenTips: [] });
  });
});

describe('tutorialStore: captureInitialZone', () => {
  it('stores the session-start zone verbatim', () => {
    useTutorialStore.getState().captureInitialZone('totalitarian');
    expect(useTutorialStore.getState().initialZone).toBe('totalitarian');
  });
});
