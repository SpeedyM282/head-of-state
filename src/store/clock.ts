/**
 * Real-time game clock. Presentation-layer only — the core stays pure and turn-based;
 * this module just decides *when* to call tick() (one tick = one in-game month).
 *
 * It is deliberately React-free and dependency-injectable (time source + scheduler) so it
 * can be unit-tested without timers or a DOM. Progress toward the next month is tracked as
 * a fraction in [0, 1), so changing speed mid-month neither skips nor double-fires a tick:
 * the fraction already completed is preserved and only the remaining time runs faster/slower.
 */

export type Speed = "paused" | "normal" | "fast";
export type RunningSpeed = "normal" | "fast";

/** Wall-clock milliseconds per in-game month, per running speed. The single source of truth. */
export const SPEED_MS: Record<RunningSpeed, number> = {
	normal: 5_000,
	fast: 2_000,
};

/** How often the clock samples wall time while running. Internal cadence only. */
export const SAMPLE_MS = 250;

type Handle = ReturnType<typeof setInterval>;

export interface ClockDeps {
	/** Called once per in-game month while the clock is running. */
	onTick: () => void;
	/** Monotonic-ish time source in ms. Defaults to performance.now / Date.now. */
	now?: () => number;
	setIntervalFn?: (cb: () => void, ms: number) => Handle;
	clearIntervalFn?: (handle: Handle) => void;
}

function defaultNow(): number {
	return typeof performance !== "undefined" &&
		typeof performance.now === "function"
		? performance.now()
		: Date.now();
}

export class GameClock {
	/** The speed the player has chosen; also what an auto-pause resumes to. */
	private userSpeed: Speed = "normal";
	/** Active auto-pause reasons (e.g. 'event', 'reforms'). Any reason forces a pause. */
	private readonly autoPauseReasons = new Set<string>();
	/** Fraction of the current month elapsed, in [0, 1). */
	private progress = 0;
	private lastNow: number;
	private handle: Handle | null = null;
	private disposed = false;

	private readonly onTick: () => void;
	private readonly now: () => number;
	private readonly setIntervalFn: (cb: () => void, ms: number) => Handle;
	private readonly clearIntervalFn: (handle: Handle) => void;

	constructor(deps: ClockDeps) {
		this.onTick = deps.onTick;
		this.now = deps.now ?? defaultNow;
		this.setIntervalFn =
			deps.setIntervalFn ?? ((cb, ms) => setInterval(cb, ms));
		this.clearIntervalFn = deps.clearIntervalFn ?? ((h) => clearInterval(h));
		this.lastNow = this.now();
	}

	getUserSpeed(): Speed {
		return this.userSpeed;
	}

	/** Player pressed a speed control. Does not reset month progress. */
	setUserSpeed(speed: Speed): void {
		this.userSpeed = speed;
	}

	isAutoPaused(): boolean {
		return this.autoPauseReasons.size > 0;
	}

	/** The store toggles these when an event opens/closes or the reforms panel opens/closes. */
	setAutoPaused(reason: string, paused: boolean): void {
		if (paused) this.autoPauseReasons.add(reason);
		else this.autoPauseReasons.delete(reason);
	}

	/** Effective speed after auto-pause and manual-pause priority. */
	effectiveSpeed(): Speed {
		if (this.userSpeed === "paused") return "paused"; // manual pause always wins
		if (this.isAutoPaused()) return "paused";
		return this.userSpeed;
	}

	isRunning(): boolean {
		return (
			!this.disposed &&
			this.handle !== null &&
			this.effectiveSpeed() !== "paused"
		);
	}

	/** Month progress in [0, 1) — for a subtle in-month indicator if the ui wants one. */
	getProgress(): number {
		return this.progress;
	}

	/** Begin sampling wall time. Idempotent; a no-op after dispose(). */
	start(): void {
		if (this.disposed || this.handle !== null) return;
		this.lastNow = this.now();
		this.handle = this.setIntervalFn(() => this.sample(), SAMPLE_MS);
	}

	/** Stop sampling. Idempotent. Keeps month progress so a later start() resumes cleanly. */
	stop(): void {
		if (this.handle !== null) {
			this.clearIntervalFn(this.handle);
			this.handle = null;
		}
	}

	/** Permanently stop the clock (game teardown). */
	dispose(): void {
		this.stop();
		this.disposed = true;
	}

	/**
	 * Consume one wall-time sample. Public so tests can drive it deterministically; in
	 * production it is invoked by the interval started in start(). Advances at most one
	 * month per sample (delta is clamped to one month's duration), so a long stall — e.g.
	 * a backgrounded tab — behaves like a pause rather than firing a burst of ticks.
	 */
	sample(): void {
		const t = this.now();
		const delta = t - this.lastNow;
		this.lastNow = t;

		const eff = this.effectiveSpeed();
		if (eff === "paused") return; // frozen: time passes but the month does not advance

		const duration = SPEED_MS[eff];
		this.progress += Math.min(delta, duration) / duration;
		if (this.progress >= 1) {
			this.progress -= 1;
			this.onTick();
		}
	}
}
