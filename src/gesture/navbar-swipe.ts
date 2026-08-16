/**
 * Gesture layer.
 *
 * This module knows nothing about Obsidian. It turns a raw touch displacement
 * into a direction, and nothing else. Keeping it free of Obsidian imports is
 * what lets the threshold rules be unit tested without an Obsidian runtime.
 */

export type SwipeDirection = 'previous' | 'next';

/**
 * Minimum horizontal displacement, in pixels, before a touch counts as a swipe
 * rather than a tap. Tuned on a physical device — this is the single place to
 * change it.
 */
export const SWIPE_THRESHOLD_PX = 40;

export interface TouchDisplacement {
	/** Horizontal displacement in pixels. Negative means the finger moved left. */
	deltaX: number;
	/** Vertical displacement in pixels. */
	deltaY: number;
	/** Number of active touch points during the interaction. */
	touchPoints: number;
}

/**
 * Decide whether a finished touch interaction is a horizontal swipe.
 *
 * Returns `next` for leftward movement and `previous` for rightward movement,
 * matching the direction a photo gallery moves. Returns null for anything that
 * fails the threshold, axis, or single-touch rules, which is what leaves normal
 * taps untouched.
 */
export function recognizeSwipe(displacement: TouchDisplacement): SwipeDirection | null {
	const { deltaX, deltaY, touchPoints } = displacement;

	if (touchPoints !== 1) {
		return null;
	}

	const horizontal = Math.abs(deltaX);
	const vertical = Math.abs(deltaY);

	if (horizontal < SWIPE_THRESHOLD_PX) {
		return null;
	}

	if (horizontal <= vertical) {
		return null;
	}

	return deltaX < 0 ? 'next' : 'previous';
}

/** A finished touch, described without depending on the DOM TouchEvent type. */
export interface TouchSample {
	clientX: number;
	clientY: number;
	touchPoints: number;
}

export interface SwipeTrackerCallbacks {
	/**
	 * Called once per recognized swipe. Not called for taps, so navigation bar
	 * buttons keep working.
	 */
	onSwipe: (direction: SwipeDirection) => void;
	/**
	 * Called only when a swipe is recognized, to suppress the default touch
	 * behaviour of whatever was under the finger.
	 */
	suppressDefault: () => void;
}

/**
 * Tracks one touch interaction from start to end and reports a swipe.
 *
 * The tracker never suppresses anything on a tap. Suppression happens only on
 * the branch where a direction was actually recognized, which is what keeps the
 * navigation bar buttons fully usable.
 */
export class SwipeTracker {
	private start: TouchSample | null = null;
	private maxTouchPoints = 0;

	constructor(private readonly callbacks: SwipeTrackerCallbacks) {}

	begin(sample: TouchSample): void {
		this.start = sample;
		this.maxTouchPoints = sample.touchPoints;
	}

	/** Records extra fingers so a pinch is never mistaken for a swipe. */
	update(sample: TouchSample): void {
		this.maxTouchPoints = Math.max(this.maxTouchPoints, sample.touchPoints);
	}

	end(sample: TouchSample): SwipeDirection | null {
		const start = this.start;
		this.start = null;

		if (start === null) {
			return null;
		}

		const direction = recognizeSwipe({
			deltaX: sample.clientX - start.clientX,
			deltaY: sample.clientY - start.clientY,
			touchPoints: Math.max(this.maxTouchPoints, sample.touchPoints),
		});

		this.maxTouchPoints = 0;

		if (direction === null) {
			return null;
		}

		this.callbacks.suppressDefault();
		this.callbacks.onSwipe(direction);
		return direction;
	}

	/** Drops any in-flight touch, used when the system cancels the gesture. */
	cancel(): void {
		this.start = null;
		this.maxTouchPoints = 0;
	}
}
