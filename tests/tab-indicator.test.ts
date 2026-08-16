// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from 'vitest';

import {
	CONTAINER_CLASS,
	CURRENT_DOT_CLASS,
	DOT_CLASS,
	HOST_CLASS,
	TabPositionIndicator,
} from '../src/ui/tab-indicator';

function makeNavbar(): HTMLElement {
	const navbar = document.createElement('div');
	navbar.className = 'mobile-navbar';
	document.body.appendChild(navbar);
	return navbar;
}

function readDots(navbar: HTMLElement) {
	const dots = Array.from(navbar.querySelectorAll(`.${DOT_CLASS}`));

	return {
		container: navbar.querySelector(`.${CONTAINER_CLASS}`),
		count: dots.length,
		currentPosition: dots.findIndex((dot) => dot.classList.contains(CURRENT_DOT_CLASS)),
	};
}

beforeEach(() => {
	document.body.replaceChildren();
});

describe('Indicator reflects the active tab', () => {
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

			indicator.render(activePosition - 1, total);

			const dots = readDots(navbar);
			expect(dots.count).toBe(total);
			expect(dots.currentPosition).toBe(activePosition - 1);
		},
	);

	it('marks exactly one dot as current', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(1, 4);

		expect(navbar.querySelectorAll(`.${DOT_CLASS}.${CURRENT_DOT_CLASS}`)).toHaveLength(1);
	});
});

describe('Indicator stays visible', () => {
	it('renders without any gesture having happened', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 3);

		expect(readDots(navbar).count).toBe(3);
	});

	it('keeps the dots after many unrelated re-renders', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		for (let i = 0; i < 20; i += 1) {
			indicator.render(i % 3, 3);
		}

		const dots = readDots(navbar);
		expect(dots.count).toBe(3);
		expect(dots.currentPosition).toBe(19 % 3);
	});

	it('applies no hiding class to the container', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 3);

		expect(readDots(navbar).container?.className).toBe(CONTAINER_CLASS);
	});
});

describe('Indicator hidden when fewer than two tabs are open', () => {
	it('shows nothing when one tab is open', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 1);

		expect(readDots(navbar).count).toBe(0);
	});

	it('shows nothing when no tab is open', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(-1, 0);

		expect(readDots(navbar).count).toBe(0);
	});

	it('clears an existing row when tabs drop below two', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(1, 3);
		expect(readDots(navbar).count).toBe(3);

		indicator.render(0, 1);
		expect(readDots(navbar).count).toBe(0);
	});

	it('reappears when a second tab is opened', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 1);
		indicator.render(1, 2);

		const dots = readDots(navbar);
		expect(dots.count).toBe(2);
		expect(dots.currentPosition).toBe(1);
	});
});

describe('Indicator placement and cleanup', () => {
	it('keeps the previous contents when focus leaves the main area', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(1, 3);
		indicator.render(-1, 3);

		const dots = readDots(navbar);
		expect(dots.count).toBe(3);
		expect(dots.currentPosition).toBe(1);
	});

	it('creates one container across repeated updates and keeps it inside the navbar', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 3);
		indicator.render(1, 3);
		indicator.render(2, 3);

		expect(navbar.querySelectorAll(`.${CONTAINER_CLASS}`)).toHaveLength(1);
		expect(readDots(navbar).container?.parentElement).toBe(navbar);
		expect(navbar.classList.contains(HOST_CLASS)).toBe(true);
	});

	it('removes the container and its host classes on destroy', () => {
		const navbar = makeNavbar();
		const indicator = new TabPositionIndicator(navbar);

		indicator.render(0, 3);
		indicator.destroy();

		expect(navbar.querySelector(`.${CONTAINER_CLASS}`)).toBeNull();
		expect(navbar.classList.contains(HOST_CLASS)).toBe(false);
	});
});
