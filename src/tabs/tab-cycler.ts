/**
 * Tab cycling layer.
 *
 * Receives a direction and nothing else — it has no idea a gesture produced it.
 *
 * The workspace is described by a narrow structural interface rather than by
 * importing Obsidian's Workspace class. The real Workspace satisfies it, and a
 * plain object satisfies it too, which is what makes the ordering and wrap-around
 * rules testable without an Obsidian runtime.
 */

import type { SwipeDirection } from '../gesture/navbar-swipe';

export interface TabWorkspace<TLeaf> {
	/**
	 * Iterates leaves in the main area only. Sidebar leaves are never visited,
	 * which is what keeps them out of the cycle.
	 */
	iterateRootLeaves(callback: (leaf: TLeaf) => unknown): void;
	getMostRecentLeaf(): TLeaf | null;
	setActiveLeaf(leaf: TLeaf, params?: { focus?: boolean }): void;
}

/** Collects main-area leaves in their existing iteration order. */
export function collectTabOrder<TLeaf>(workspace: TabWorkspace<TLeaf>): TLeaf[] {
	const leaves: TLeaf[] = [];
	workspace.iterateRootLeaves((leaf) => {
		leaves.push(leaf);
	});
	return leaves;
}

/** Where the active tab sits, used to render the position indicator. */
export interface TabPosition {
	/** Zero-based position of the active tab, or -1 when focus is not on a main-area tab. */
	index: number;
	/** Total number of tabs in the main area. */
	total: number;
}

/**
 * Describe the current tab state without changing anything.
 *
 * This is what lets the indicator be a pure reflection of the workspace: it can
 * recompute at any moment, from any trigger, without knowing what caused the
 * change.
 */
export function describeTabPosition<TLeaf>(workspace: TabWorkspace<TLeaf>): TabPosition {
	const leaves = collectTabOrder(workspace);
	const active = workspace.getMostRecentLeaf();
	const index = active === null ? -1 : leaves.indexOf(active);

	return { index, total: leaves.length };
}

/**
 * Activate the tab adjacent to the current one.
 *
 * Wraps at both ends, so any tab is reachable in a single swipe when only a
 * handful are open. Returns the newly activated tab, or null when nothing was
 * changed.
 */
export function cycleTab<TLeaf>(
	workspace: TabWorkspace<TLeaf>,
	direction: SwipeDirection,
): TLeaf | null {
	const leaves = collectTabOrder(workspace);

	if (leaves.length < 2) {
		return null;
	}

	const { index } = describeTabPosition(workspace);
	if (index === -1) {
		// Focus sits outside the main area, e.g. in a sidebar. Do nothing rather
		// than guess which tab the user meant.
		return null;
	}

	const offset = direction === 'next' ? 1 : -1;
	const targetIndex = (index + offset + leaves.length) % leaves.length;
	const target = leaves[targetIndex];

	workspace.setActiveLeaf(target, { focus: true });
	return target;
}
