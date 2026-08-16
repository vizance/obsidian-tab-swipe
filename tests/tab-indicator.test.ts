// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
	CONTAINER_CLASS,
	CURRENT_DOT_CLASS,
	DOT_CLASS,
	HIDDEN_CLASS,
	HOST_CLASS,
	INDICATOR_VISIBLE_MS,
	TabPositionIndicator,
} from '../src/ui/tab-indicator';

function makeNavbar(): HTMLElement {
	const navbar = document.createElement('div');
	navbar.className = 'mobile-navbar';
	document.body.appendChild(navbar);
	return navbar;
}

function readDots(navbar: HTMLElement) {
	const container = navbar.querySelector(`.${CONTAINER_CLASS}`);
	const dots = Array.from(navbar.querySelectorAll(`.${DOT_CLASS}`));

	return {
		container,
		count: dots.length,
		currentPosition: dots.findIndex((dot) => dot.classList.contains(CURRENT_DOT_CLASS)),
	};
}

describe('Position indicator on a completed switch', () => {
	beforeEach(() => {
		document.body.replaceChildren();
	});

	// One case per row of the spec example table "dot row contents".
	// Positions in the table are 1-based; the API takes a 0-based index.
	const dotRowCases = [
		{ total: 3, activePosition: 2 },
		{ total: 3, activePosition: 1 },
		{ total: 2, activePosition: 2 },
		{ total: 5, activePosition: 4 },
	];

	it.each(dotRowCases)(
		'$total tabs with position $activePosition active renders $total dots',
		({ total, activePosition }) => {
			const navbar = makeNavbar();
			const indicator = new TabPositionIndicator(navbar);

			indicator.show(activePosition - 1, total);

			const dots = readDots(navbar);
			expect(dots.count).toBe(total);
			expect(dots.currentPosition).toBe(activePosition - 1);
		},
	);

	it('marks exactly one dot as current', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(1, 4);

		expect(navbar.querySelectorAll(`.${DOT_CLASS}.${CURRENT_DOT_CLASS}`)).toHaveLength(1);
	});
});

describe('Indicator fades out on its own', () => {
	beforeEach(() => {
		document.body.replaceChildren();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('hides the dots once the visible window passes', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(0, 3);
		expect(readDots(navbar).container?.classList.contains(HIDDEN_CLASS)).toBe(false);

		vi.advanceTimersByTime(INDICATOR_VISIBLE_MS);

		expect(readDots(navbar).container?.classList.contains(HIDDEN_CLASS)).toBe(true);
	});

	it('reuses the element and restarts the timer on a second swipe', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(0, 3);
		const firstContainer = readDots(navbar).container;

		vi.advanceTimersByTime(100);
		indicator.show(1, 3);

		expect(navbar.querySelectorAll(`.${CONTAINER_CLASS}`)).toHaveLength(1);
		expect(readDots(navbar).container).toBe(firstContainer);
		expect(readDots(navbar).currentPosition).toBe(1);

		// 250 ms after the first swipe, but only 150 ms after the second — the
		// restarted timer means the dots are still visible.
		vi.advanceTimersByTime(150);
		expect(readDots(navbar).container?.classList.contains(HIDDEN_CLASS)).toBe(false);

		vi.advanceTimersByTime(INDICATOR_VISIBLE_MS);
		expect(readDots(navbar).container?.classList.contains(HIDDEN_CLASS)).toBe(true);
	});
});

describe('Indicator placement and cleanup', () => {
	beforeEach(() => {
		document.body.replaceChildren();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('creates one container across repeated switches and keeps it inside the navbar', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(0, 3);
		indicator.show(1, 3);
		indicator.show(2, 3);

		expect(navbar.querySelectorAll(`.${CONTAINER_CLASS}`)).toHaveLength(1);
		expect(readDots(navbar).container?.parentElement).toBe(navbar);
		expect(navbar.classList.contains(HOST_CLASS)).toBe(true);
	});

	it('removes the container and cancels the pending fade on destroy', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(0, 3);
		expect(indicator.hasPendingFade()).toBe(true);

		indicator.destroy();

		expect(navbar.querySelector(`.${CONTAINER_CLASS}`)).toBeNull();
		expect(indicator.hasPendingFade()).toBe(false);
		expect(navbar.classList.contains(HOST_CLASS)).toBe(false);
	});

	it('does not render anything when there are no tabs to describe', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.show(0, 0);

		expect(navbar.querySelector(`.${CONTAINER_CLASS}`)).toBeNull();
	});
});
