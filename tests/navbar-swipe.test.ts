import { describe, expect, it, vi } from 'vitest';

import {
	SWIPE_THRESHOLD_PX,
	SwipeTracker,
	recognizeSwipe,
	type SwipeDirection,
} from '../src/gesture/navbar-swipe';

describe('Horizontal swipe recognition', () => {
	// One case per row of the spec example table
	// "threshold and axis boundary cases".
	const boundaryCases: Array<{
		deltaX: number;
		deltaY: number;
		touchPoints: number;
		expected: SwipeDirection | null;
	}> = [
		{ deltaX: -60, deltaY: 5, touchPoints: 1, expected: 'next' },
		{ deltaX: 60, deltaY: 5, touchPoints: 1, expected: 'previous' },
		{ deltaX: -40, deltaY: 2, touchPoints: 1, expected: 'next' },
		{ deltaX: -39, deltaY: 2, touchPoints: 1, expected: null },
		{ deltaX: -50, deltaY: 70, touchPoints: 1, expected: null },
		{ deltaX: -60, deltaY: 5, touchPoints: 2, expected: null },
	];

	it.each(boundaryCases)(
		'deltaX=$deltaX deltaY=$deltaY touchPoints=$touchPoints emits $expected',
		({ deltaX, deltaY, touchPoints, expected }) => {
			expect(recognizeSwipe({ deltaX, deltaY, touchPoints })).toBe(expected);
		},
	);

	it('exposes the threshold as a single named constant', () => {
		expect(SWIPE_THRESHOLD_PX).toBe(40);
	});
});

describe('Navigation bar tap passthrough', () => {
	function trackTouch(deltaX: number, deltaY: number, touchPoints = 1) {
		const onSwipe = vi.fn();
		const suppressDefault = vi.fn();
		const tracker = new SwipeTracker({ onSwipe, suppressDefault });

		tracker.begin({ clientX: 200, clientY: 800, touchPoints });
		tracker.end({
			clientX: 200 + deltaX,
			clientY: 800 + deltaY,
			touchPoints,
		});

		return { onSwipe, suppressDefault };
	}

	it('does not suppress the default behaviour for a tap below the threshold', () => {
		const { onSwipe, suppressDefault } = trackTouch(-39, 2);

		expect(suppressDefault).not.toHaveBeenCalled();
		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('does not suppress the default behaviour for a vertical drag', () => {
		const { onSwipe, suppressDefault } = trackTouch(-50, 70);

		expect(suppressDefault).not.toHaveBeenCalled();
		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('suppresses the default behaviour exactly once for a recognized swipe', () => {
		const { onSwipe, suppressDefault } = trackTouch(-60, 5);

		expect(suppressDefault).toHaveBeenCalledTimes(1);
		expect(onSwipe).toHaveBeenCalledTimes(1);
		expect(onSwipe).toHaveBeenCalledWith('next');
	});

	it('ignores a multi-touch interaction even when the extra finger arrives mid-gesture', () => {
		const onSwipe = vi.fn();
		const suppressDefault = vi.fn();
		const tracker = new SwipeTracker({ onSwipe, suppressDefault });

		tracker.begin({ clientX: 200, clientY: 800, touchPoints: 1 });
		tracker.update({ clientX: 170, clientY: 802, touchPoints: 2 });
		tracker.end({ clientX: 140, clientY: 805, touchPoints: 1 });

		expect(suppressDefault).not.toHaveBeenCalled();
		expect(onSwipe).not.toHaveBeenCalled();
	});

	it('reports nothing when a touch ends without a recorded start', () => {
		const onSwipe = vi.fn();
		const suppressDefault = vi.fn();
		const tracker = new SwipeTracker({ onSwipe, suppressDefault });

		expect(tracker.end({ clientX: 100, clientY: 800, touchPoints: 1 })).toBeNull();
		expect(suppressDefault).not.toHaveBeenCalled();
	});
});
