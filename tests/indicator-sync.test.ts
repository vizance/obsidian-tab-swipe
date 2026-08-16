import { describe, expect, it, vi } from 'vitest';

import { SYNC_EVENTS, bindIndicatorSync, type SyncEvent } from '../src/plugin/indicator-sync';
import type { TabWorkspace } from '../src/tabs/tab-cycler';

/**
 * A workspace whose tab state can be rewritten between events, standing in for
 * the user opening, closing or switching tabs by any route.
 */
function fakeWorkspace(rootTabs: string[], activeTab: string | null) {
	const state = { rootTabs, activeTab };

	const workspace: TabWorkspace<string> = {
		iterateRootLeaves(callback) {
			for (const tab of state.rootTabs) {
				callback(tab);
			}
		},
		getMostRecentLeaf() {
			return state.activeTab;
		},
		setActiveLeaf: vi.fn(),
	};

	return { workspace, state };
}

function bind(rootTabs: string[], activeTab: string | null) {
	const { workspace, state } = fakeWorkspace(rootTabs, activeTab);
	const indicator = { render: vi.fn() };
	const handlers = new Map<SyncEvent, () => void>();

	bindIndicatorSync({
		workspace,
		indicator,
		subscribe: (event, handler) => {
			handlers.set(event, handler);
		},
	});

	return { indicator, state, handlers };
}

describe('Indicator stays in sync with tab changes from any source', () => {
	it('subscribes to every workspace event that can change the tab state', () => {
		const { handlers } = bind(['A', 'B'], 'A');

		expect([...handlers.keys()].sort()).toEqual([...SYNC_EVENTS].sort());
	});

	it('paints once at bind time so the dots exist before any interaction', () => {
		const { indicator } = bind(['A', 'B', 'C'], 'B');

		expect(indicator.render).toHaveBeenCalledExactlyOnceWith(1, 3);
	});

	it('redraws for a tab change made outside this plugin', () => {
		const { indicator, state, handlers } = bind(['A', 'B', 'C'], 'A');

		state.activeTab = 'C';
		handlers.get('active-leaf-change')?.();

		expect(indicator.render).toHaveBeenLastCalledWith(2, 3);
	});

	it('redraws with a smaller count after a tab is closed', () => {
		const { indicator, state, handlers } = bind(['A', 'B', 'C'], 'C');

		state.rootTabs = ['A', 'B'];
		state.activeTab = 'B';
		handlers.get('layout-change')?.();

		expect(indicator.render).toHaveBeenLastCalledWith(1, 2);
	});

	it('redraws with a larger count after a tab is opened', () => {
		const { indicator, state, handlers } = bind(['A', 'B'], 'B');

		state.rootTabs = ['A', 'B', 'C'];
		state.activeTab = 'C';
		handlers.get('layout-change')?.();

		expect(indicator.render).toHaveBeenLastCalledWith(2, 3);
	});

	it('passes index -1 when focus moves outside the main area', () => {
		const { indicator, state, handlers } = bind(['A', 'B'], 'A');

		state.activeTab = 'sidebar-note';
		handlers.get('active-leaf-change')?.();

		// The indicator itself decides to keep its previous contents for -1;
		// see the "keeps the previous contents" case in tab-indicator.test.ts.
		expect(indicator.render).toHaveBeenLastCalledWith(-1, 2);
	});
});
