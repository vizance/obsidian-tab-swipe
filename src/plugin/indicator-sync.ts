/**
 * Keeps the position indicator matching the workspace.
 *
 * The indicator is a persistent readout, so it has to be right at all times —
 * not just after this plugin's own swipe. Tabs also change when the user picks
 * from Obsidian's tab list, follows a link into a new tab, or closes one. All of
 * those routes end up firing a workspace event, so subscribing to those events
 * and recomputing is the only model that cannot drift.
 *
 * A swipe is deliberately not a special case here. It changes the workspace, the
 * workspace fires an event, and the indicator redraws like it would for anything
 * else.
 */

import { describeTabPosition, type TabWorkspace } from '../tabs/tab-cycler';

/** Workspace events that can change which tab is active, or how many exist. */
export const SYNC_EVENTS = ['active-leaf-change', 'layout-change'] as const;

export type SyncEvent = (typeof SYNC_EVENTS)[number];

export interface IndicatorRenderer {
	render(currentIndex: number, total: number): void;
}

export interface IndicatorSyncHost<TLeaf> {
	workspace: TabWorkspace<TLeaf>;
	indicator: IndicatorRenderer;
	/**
	 * Subscribes to a workspace event and ties the subscription to the plugin
	 * lifecycle, so unload releases it.
	 */
	subscribe: (event: SyncEvent, handler: () => void) => void;
}

/**
 * Subscribe the indicator to workspace changes and paint it once immediately.
 *
 * The immediate paint matters: the dots have to be there when the user first
 * looks at the navigation bar, not only after they interact with it.
 */
export function bindIndicatorSync<TLeaf>(host: IndicatorSyncHost<TLeaf>): void {
	const refresh = () => {
		const { index, total } = describeTabPosition(host.workspace);
		host.indicator.render(index, total);
	};

	for (const event of SYNC_EVENTS) {
		host.subscribe(event, refresh);
	}

	refresh();
}
