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

	const active = workspace.getMostRecentLeaf();
	if (active === null) {
		return null;
	}

	const currentIndex = leaves.indexOf(active);
	if (currentIndex === -1) {
		// Focus sits outside the main area, e.g. in a sidebar. Do nothing rather
		// than guess which tab the user meant.
		return null;
	}

	const offset = direction === 'next' ? 1 : -1;
	const targetIndex = (currentIndex + offset + leaves.length) % leaves.length;
	const target = leaves[targetIndex];

	workspace.setActiveLeaf(target, { focus: true });
	return target;
}
