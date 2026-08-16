/**
 * Wiring layer.
 *
 * Decides whether the gesture listeners get attached at all, and connects the
 * gesture layer to the tab cycling layer. Expressed against a small host
 * interface so the platform and missing-element rules can be tested without an
 * Obsidian runtime.
 */

import { SwipeTracker, type SwipeDirection, type TouchSample } from '../gesture/navbar-swipe';

export type TouchEventName = 'touchstart' | 'touchmove' | 'touchend' | 'touchcancel';

export interface NavbarBindingHost<TElement> {
	/** False on desktop, where the plugin does nothing whatsoever. */
	isMobile: boolean;
	/** The mobile navigation bar, or null when Obsidian's DOM does not have one. */
	navbar: TElement | null;
	/**
	 * Registers a listener that the caller ties to the plugin lifecycle, so
	 * unloading the plugin removes it.
	 */
	registerDomEvent: (
		element: TElement,
		type: TouchEventName,
		handler: (event: TouchEvent) => void,
	) => void;
	/** Runs the actual tab switch. */
	onSwipe: (direction: SwipeDirection) => void;
	/** Extracts a comparable sample from a touch event. */
	readSample: (event: TouchEvent) => TouchSample;
}

/**
 * Attach the swipe listeners when the environment allows it.
 *
 * Returns the tracker when listeners were attached, or null when the plugin
 * intentionally stayed dormant. Staying dormant is silent by design: an outdated
 * selector must never surface an error to the user.
 */
export function bindNavbarSwipe<TElement>(
	host: NavbarBindingHost<TElement>,
): SwipeTracker | null {
	if (!host.isMobile) {
		return null;
	}

	const navbar = host.navbar;
	if (navbar === null) {
		return null;
	}

	let endingEvent: TouchEvent | null = null;

	const tracker = new SwipeTracker({
		onSwipe: host.onSwipe,
		suppressDefault: () => {
			endingEvent?.preventDefault();
		},
	});

	host.registerDomEvent(navbar, 'touchstart', (event) => {
		tracker.begin(host.readSample(event));
	});

	host.registerDomEvent(navbar, 'touchmove', (event) => {
		tracker.update(host.readSample(event));
	});

	host.registerDomEvent(navbar, 'touchend', (event) => {
		endingEvent = event;
		tracker.end(host.readSample(event));
		endingEvent = null;
	});

	host.registerDomEvent(navbar, 'touchcancel', () => {
		tracker.cancel();
	});

	return tracker;
}

/**
 * Reads the coordinate of the touch that is ending, falling back to the still
 * active touch list while the finger is down.
 */
export function readTouchSample(event: TouchEvent): TouchSample {
	const touch = event.changedTouches[0] ?? event.touches[0];

	return {
		clientX: touch?.clientX ?? 0,
		clientY: touch?.clientY ?? 0,
		touchPoints: Math.max(event.touches.length, event.changedTouches.length),
	};
}
