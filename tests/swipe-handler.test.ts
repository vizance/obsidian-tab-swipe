import { describe, expect, it, vi } from 'vitest';

import { handleSwipe } from '../src/plugin/swipe-handler';
import type { TabWorkspace } from '../src/tabs/tab-cycler';

function fakeWorkspace(rootTabs: string[], activeTab: string | null) {
	const setActiveLeaf = vi.fn();

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

function fakeIndicator() {
	return { show: vi.fn() };
}

describe('No indicator when no switch happened', () => {
	it('shows nothing when only one tab is open', () => {
		const { workspace, setActiveLeaf } = fakeWorkspace(['A'], 'A');
		const indicator = fakeIndicator();

		expect(handleSwipe(workspace, 'next', indicator)).toBeNull();
		expect(indicator.show).not.toHaveBeenCalled();
		expect(setActiveLeaf).not.toHaveBeenCalled();
	});

	it('shows nothing when no tab is open', () => {
		const { workspace } = fakeWorkspace([], null);
		const indicator = fakeIndicator();

		expect(handleSwipe(workspace, 'previous', indicator)).toBeNull();
		expect(indicator.show).not.toHaveBeenCalled();
	});

	it('shows nothing when focus sits outside the main area', () => {
		const { workspace } = fakeWorkspace(['A', 'B'], 'sidebar-note');
		const indicator = fakeIndicator();

		expect(handleSwipe(workspace, 'next', indicator)).toBeNull();
		expect(indicator.show).not.toHaveBeenCalled();
	});
});

describe('indicator reflects the completed switch', () => {
	it('reports the new position and the tab count', () => {
		const { workspace } = fakeWorkspace(['A', 'B', 'C'], 'A');
		const indicator = fakeIndicator();

		expect(handleSwipe(workspace, 'next', indicator)).toBe('B');
		expect(indicator.show).toHaveBeenCalledExactlyOnceWith(1, 3);
	});

	it('reports the wrapped position when cycling past the end', () => {
		const { workspace } = fakeWorkspace(['A', 'B', 'C'], 'C');
		const indicator = fakeIndicator();

		expect(handleSwipe(workspace, 'next', indicator)).toBe('A');
		expect(indicator.show).toHaveBeenCalledExactlyOnceWith(0, 3);
	});
});
