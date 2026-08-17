import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameClock, SAMPLE_MS, SPEED_MS } from '../../src/store/clock';

/**
 * The clock is driven by an injected time source (`now`) and, where needed, an injected
 * scheduler, so every test is deterministic and free of real timers/React.
 */

// Real handles created by the scheduler mocks, cleared after each test so nothing leaks.
const liveTimers: ReturnType<typeof setInterval>[] = [];
afterEach(() => {
  liveTimers.forEach(clearInterval);
  liveTimers.length = 0;
});

function scheduler() {
  let captured: (() => void) | null = null;
  const setIntervalFn = vi.fn((cb: () => void) => {
    captured = cb;
    const handle = setInterval(() => {}, 60_000); // real handle (type-correct), never fires
    liveTimers.push(handle);
    return handle;
  });
  const clearIntervalFn = vi.fn((handle: ReturnType<typeof setInterval>) => clearInterval(handle));
  return { setIntervalFn, clearIntervalFn, fire: () => captured?.() };
}

describe('SPEED_MS', () => {
  it('has positive month durations with fast quicker than normal', () => {
    expect(SPEED_MS.normal).toBeGreaterThan(0);
    expect(SPEED_MS.fast).toBeGreaterThan(0);
    expect(SPEED_MS.fast).toBeLessThan(SPEED_MS.normal);
  });
});

describe('GameClock ticking', () => {
  it('fires exactly one tick after one month at normal speed, not before', () => {
    const dur = SPEED_MS.normal;
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    t = dur / 2;
    clock.sample();
    expect(fired).toHaveLength(0); // only halfway

    t = dur;
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('a fast month is one fast-duration long', () => {
    const dur = SPEED_MS.fast;
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('fast');

    t = dur - 1;
    clock.sample();
    expect(fired).toHaveLength(0); // just shy of a full month

    t = dur;
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('changing speed mid-month neither skips nor double-fires', () => {
    const N = SPEED_MS.normal;
    const F = SPEED_MS.fast;
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    t = 0.75 * N; // 75% through a normal month
    clock.sample();
    expect(fired).toHaveLength(0);

    clock.setUserSpeed('fast');
    clock.sample(); // same instant, delta 0 — must NOT double-fire on the switch
    expect(fired).toHaveLength(0);

    t = 0.75 * N + 0.2 * F; // remaining 25% now runs at fast: +0.20 → 0.95
    clock.sample();
    expect(fired).toHaveLength(0);

    t = 0.75 * N + 0.25 * F; // +0.05 → 1.0
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('advances at most one month per sample (a long stall behaves like a pause)', () => {
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    t = 5 * 60_000; // tab backgrounded for 5 minutes
    clock.sample();
    expect(fired).toHaveLength(1); // not 15
  });
});

describe('GameClock auto-pause', () => {
  it('freezes while auto-paused and resumes to the prior speed', () => {
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    clock.setAutoPaused('event', true);
    t = 30_000;
    clock.sample();
    expect(fired).toHaveLength(0); // paused: no advance despite time passing

    clock.setAutoPaused('event', false);
    t = 30_000 + SPEED_MS.normal; // a full month of running time after resuming
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('manual pause always wins: answering an event does not auto-resume', () => {
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });

    clock.setUserSpeed('paused'); // player paused manually
    clock.setAutoPaused('event', true); // an event fires
    clock.setAutoPaused('event', false); // player answers it

    t = 100_000;
    clock.sample();
    expect(fired).toHaveLength(0);
    expect(clock.effectiveSpeed()).toBe('paused');
  });

  it('OrientationGate: a portrait phone auto-pauses like an event, and un-rotating resumes', () => {
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    clock.setAutoPaused('orientation', true); // phone rotated to portrait
    t = SPEED_MS.normal;
    clock.sample();
    expect(fired).toHaveLength(0); // frozen while the rotate-device overlay is shown

    clock.setAutoPaused('orientation', false); // rotated back to landscape
    t = SPEED_MS.normal * 2;
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('OrientationGate: manual pause still wins over rotating back to landscape', () => {
    const clock = new GameClock({ onTick: () => {}, now: () => 0 });
    clock.setUserSpeed('paused');
    clock.setAutoPaused('orientation', true);
    clock.setAutoPaused('orientation', false);
    expect(clock.effectiveSpeed()).toBe('paused');
  });

  it('tutorial overlay: a spotlight step or tip auto-pauses like an event, and dismissing resumes', () => {
    let t = 0;
    const fired: number[] = [];
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t });
    clock.setUserSpeed('normal');

    clock.setAutoPaused('tutorial', true); // a scripted step / just-in-time tip is showing
    t = SPEED_MS.normal;
    clock.sample();
    expect(fired).toHaveLength(0); // frozen while the advisor is speaking

    clock.setAutoPaused('tutorial', false); // player dismissed it
    t = SPEED_MS.normal * 2;
    clock.sample();
    expect(fired).toHaveLength(1);
  });

  it('tutorial overlay: manual pause still wins over dismissing a tip', () => {
    const clock = new GameClock({ onTick: () => {}, now: () => 0 });
    clock.setUserSpeed('paused');
    clock.setAutoPaused('tutorial', true);
    clock.setAutoPaused('tutorial', false);
    expect(clock.effectiveSpeed()).toBe('paused');
  });

  it('requires all auto-pause reasons cleared before running', () => {
    const clock = new GameClock({ onTick: () => {}, now: () => 0 });
    clock.setUserSpeed('normal');
    clock.setAutoPaused('event', true);
    clock.setAutoPaused('reforms', true);

    clock.setAutoPaused('event', false);
    expect(clock.effectiveSpeed()).toBe('paused'); // reforms still open

    clock.setAutoPaused('reforms', false);
    expect(clock.effectiveSpeed()).toBe('normal');
  });
});

describe('GameClock effectiveSpeed', () => {
  it('reflects user speed, auto-pause, and manual-pause priority', () => {
    const clock = new GameClock({ onTick: () => {}, now: () => 0 });
    clock.setUserSpeed('normal');
    expect(clock.effectiveSpeed()).toBe('normal');

    clock.setAutoPaused('event', true);
    expect(clock.effectiveSpeed()).toBe('paused');

    clock.setUserSpeed('fast');
    expect(clock.effectiveSpeed()).toBe('paused'); // still auto-paused

    clock.setAutoPaused('event', false);
    expect(clock.effectiveSpeed()).toBe('fast');

    clock.setUserSpeed('paused');
    expect(clock.effectiveSpeed()).toBe('paused');
  });
});

describe('GameClock scheduler lifecycle', () => {
  it('starts one interval (idempotent) and clears it on stop', () => {
    const { setIntervalFn, clearIntervalFn } = scheduler();
    const clock = new GameClock({ onTick: () => {}, now: () => 0, setIntervalFn, clearIntervalFn });

    clock.start();
    clock.start(); // idempotent
    expect(setIntervalFn).toHaveBeenCalledTimes(1);
    expect(setIntervalFn).toHaveBeenCalledWith(expect.any(Function), SAMPLE_MS);

    clock.stop();
    expect(clearIntervalFn).toHaveBeenCalledTimes(1);
  });

  it('routes interval firings through sample()', () => {
    let t = 0;
    const fired: number[] = [];
    const { setIntervalFn, clearIntervalFn, fire } = scheduler();
    const clock = new GameClock({ onTick: () => fired.push(t), now: () => t, setIntervalFn, clearIntervalFn });
    clock.setUserSpeed('fast');
    clock.start();

    t = 10_000;
    fire();
    expect(fired).toHaveLength(1);
  });

  it('cannot be restarted after dispose', () => {
    const { setIntervalFn, clearIntervalFn } = scheduler();
    const clock = new GameClock({ onTick: () => {}, now: () => 0, setIntervalFn, clearIntervalFn });

    clock.start();
    clock.dispose();
    expect(clearIntervalFn).toHaveBeenCalledTimes(1);

    setIntervalFn.mockClear();
    clock.start();
    expect(setIntervalFn).not.toHaveBeenCalled();
  });
});
