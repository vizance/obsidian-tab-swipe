import { describe, expect, it, vi } from 'vitest';

import { cycleTab, type TabWorkspace } from '../src/tabs/tab-cycler';
import type { SwipeDirection } from '../src/gesture/navbar-swipe';

/**
 * Fake workspace. Tabs are plain strings so the tests read like the spec tables.
 */
function fakeWorkspace(rootTabs: string[], activeTab: string | null) {
	const setActiveLeaf = vi.fn<(leaf: string, params?: { focus?: boolean }) => void>();

	const workspace: TabWorkspace<string> = {
		iterateRootLeaves(callback) {
			for (const tab of rootTabs) {
				callback(tab);
			}
		},
		getMostRecentLeaf() {
			return activeTab;
		},
		setActiveLeaf,
	};

	return { workspace, setActiveLeaf };
}

describe('Neighbour tab selection', () => {
	// One case per row of the spec example table "three-tab traversal".
	const traversalCases: Array<{
		tabs: string[];
		active: string;
		direction: SwipeDirection;
		expected: string;
	}> = [
		{ tabs: ['A', 'B', 'C'], active: 'A', direction: 'next', expected: 'B' },
		{ tabs: ['A', 'B', 'C'], active: 'B', direction: 'next', expected: 'C' },
		{ tabs: ['A', 'B', 'C'], active: 'C', direction: 'previous', expected: 'B' },
		{ tabs: ['A', 'B', 'C'], active: 'B', direction: 'previous', expected: 'A' },
	];

	it.each(traversalCases)(
		'active=$active direction=$direction activates $expected',
		({ tabs, active, direction, expected }) => {
			const { workspace, setActiveLeaf } = fakeWorkspace(tabs, active);

			expect(cycleTab(workspace, direction)).toBe(expected);
			expect(setActiveLeaf).toHaveBeenCalledTimes(1);
			expect(setActiveLeaf).toHaveBeenCalledWith(expected, { focus: true });
		},
	);
});

describe('Wrap-around at both ends', () => {
	// One case per row of the spec example table "wrap-around boundaries".
	const wrapCases: Array<{
		tabs: string[];
		active: string;
		direction: SwipeDirection;
		expected: string;
	}> = [
		{ tabs: ['A', 'B', 'C'], active: 'C', direction: 'next', expected: 'A' },
		{ tabs: ['A', 'B', 'C'], active: 'A', direction: 'previous', expected: 'C' },
		{ tabs: ['A', 'B'], active: 'B', direction: 'next', expected: 'A' },
		{ tabs: ['A', 'B'], active: 'A', direction: 'previous', expected: 'B' },
	];

	it.each(wrapCases)(
		'tabs=$tabs active=$active direction=$direction wraps to $expected',
		({ tabs, active, direction, expected }) => {
			const { workspace, setActiveLeaf } = fakeWorkspace(tabs, active);

			expect(cycleTab(workspace, direction)).toBe(expected);
			expect(setActiveLeaf).toHaveBeenCalledWith(expected, { focus: true });
		},
	);
});

describe('No action with fewer than two tabs', () => {
	const directions: SwipeDirection[] = ['next', 'previous'];

	it.each(directions)('returns nothing for a single open tab, direction=%s', (direction) => {
		const { workspace, setActiveLeaf } = fakeWorkspace(['A'], 'A');

		expect(cycleTab(workspace, direction)).toBeNull();
		expect(setActiveLeaf).not.toHaveBeenCalled();
	});

	it.each(directions)('returns nothing when no tab is open, direction=%s', (direction) => {
		const { workspace, setActiveLeaf } = fakeWorkspace([], null);

		expect(cycleTab(workspace, direction)).toBeNull();
		expect(setActiveLeaf).not.toHaveBeenCalled();
	});
});

describe('Tab order source and split view limitation', () => {
	it('excludes sidebar leaves from the cycle', () => {
		// iterateRootLeaves visits the main area only, so the sidebar note is
		// never offered as a target.
		const sidebarLeaf = 'sidebar-note';
		const { workspace, setActiveLeaf } = fakeWorkspace(['A', 'B'], 'A');

		expect(cycleTab(workspace, 'next')).toBe('B');
		expect(setActiveLeaf).toHaveBeenCalledTimes(1);
		expect(setActiveLeaf).not.toHaveBeenCalledWith(sidebarLeaf, expect.anything());
	});

	it('treats split panes as one flat order', () => {
		// Panes hold A, B and C, D. Moving next from B crosses into the second
		// pane because the order is the flat sequence A, B, C, D.
		const { workspace, setActiveLeaf } = fakeWorkspace(['A', 'B', 'C', 'D'], 'B');

		expect(cycleTab(workspace, 'next')).toBe('C');
		expect(setActiveLeaf).toHaveBeenCalledWith('C', { focus: true });
	});

	it('does nothing when focus sits outside the main area', () => {
		const { workspace, setActiveLeaf } = fakeWorkspace(['A', 'B'], 'sidebar-note');

		expect(cycleTab(workspace, 'next')).toBeNull();
		expect(setActiveLeaf).not.toHaveBeenCalled();
	});
});
