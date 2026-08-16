import { describe, expect, it, vi } from 'vitest';

import {
	bindNavbarSwipe,
	type NavbarBindingHost,
	type TouchEventName,
} from '../src/plugin/navbar-binding';
import type { TouchSample } from '../src/gesture/navbar-swipe';

type FakeElement = { name: string };

interface Registration {
	element: FakeElement;
	type: TouchEventName;
	handler: (event: TouchEvent) => void;
}

function fakeHost(overrides: Partial<NavbarBindingHost<FakeElement>> = {}) {
	const registrations: Registration[] = [];
	const onSwipe = vi.fn();
	const samples = new Map<TouchEvent, TouchSample>();

	const host: NavbarBindingHost<FakeElement> = {
		isMobile: true,
		navbar: { name: 'mobile-navbar' },
		registerDomEvent: (element, type, handler) => {
			registrations.push({ element, type, handler });
		},
		onSwipe,
		readSample: (event) => samples.get(event) ?? { clientX: 0, clientY: 0, touchPoints: 1 },
		...overrides,
	};

	return { host, registrations, onSwipe, samples };
}

describe('Gesture surface activation', () => {
	it('attaches touch listeners to the navigation bar on a mobile platform', () => {
		const { host, registrations } = fakeHost();

		const tracker = bindNavbarSwipe(host);

		expect(tracker).not.toBeNull();
		expect(registrations.map((r) => r.type)).toEqual([
			'touchstart',
			'touchmove',
			'touchend',
			'touchcancel',
		]);
		for (const registration of registrations) {
			expect(registration.element).toBe(host.navbar);
		}
	});

	it('attaches nothing on a desktop platform', () => {
		const { host, registrations } = fakeHost({ isMobile: false });

		expect(bindNavbarSwipe(host)).toBeNull();
		expect(registrations).toHaveLength(0);
	});

	it('attaches nothing and stays silent when the navigation bar is missing', () => {
		const { host, registrations } = fakeHost({ navbar: null });

		expect(() => bindNavbarSwipe(host)).not.toThrow();
		expect(bindNavbarSwipe(host)).toBeNull();
		expect(registrations).toHaveLength(0);
	});
});

describe('gesture to tab switch wiring', () => {
	/** Drives a full touch interaction through the registered listeners. */
	function performTouch(deltaX: number, deltaY: number) {
		const { host, registrations, onSwipe, samples } = fakeHost();
		bindNavbarSwipe(host);

		const preventDefault = vi.fn();
		const start = { preventDefault } as unknown as TouchEvent;
		const end = { preventDefault } as unknown as TouchEvent;
		samples.set(start, { clientX: 200, clientY: 800, touchPoints: 1 });
		samples.set(end, { clientX: 200 + deltaX, clientY: 800 + deltaY, touchPoints: 1 });

		const fire = (type: TouchEventName, event: TouchEvent) => {
			for (const registration of registrations) {
				if (registration.type === type) {
					registration.handler(event);
				}
			}
		};

		fire('touchstart', start);
		fire('touchend', end);

		return { onSwipe, preventDefault };
	}

	it('reports next and suppresses the default behaviour for a leftward swipe', () => {
		const { onSwipe, preventDefault } = performTouch(-60, 5);

		expect(onSwipe).toHaveBeenCalledExactlyOnceWith('next');
		expect(preventDefault).toHaveBeenCalledTimes(1);
	});

	it('reports previous for a rightward swipe', () => {
		const { onSwipe } = performTouch(60, 5);

		expect(onSwipe).toHaveBeenCalledExactlyOnceWith('previous');
	});

	it('leaves a tap completely alone', () => {
		const { onSwipe, preventDefault } = performTouch(-10, 3);

		expect(onSwipe).not.toHaveBeenCalled();
		expect(preventDefault).not.toHaveBeenCalled();
	});
});
