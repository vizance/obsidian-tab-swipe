/**
 * Connects a recognized swipe to the two things that follow it: switching the
 * tab, and showing where the user landed.
 *
 * The indicator is driven from the switch result rather than from the gesture,
 * so a swipe that changes nothing shows nothing. That ordering is the whole
 * point of this module.
 */

import type { SwipeDirection } from '../gesture/navbar-swipe';
import { cycleTabWithPosition, type TabWorkspace } from '../tabs/tab-cycler';

export interface PositionDisplay {
	show(currentIndex: number, total: number): void;
}

/**
 * Switch tabs and, only on a real switch, show the position indicator.
 *
 * Returns the newly active tab, or null when nothing changed.
 */
export function handleSwipe<TLeaf>(
	workspace: TabWorkspace<TLeaf>,
	direction: SwipeDirection,
	indicator: PositionDisplay,
): TLeaf | null {
	const result = cycleTabWithPosition(workspace, direction);

	if (result === null) {
		return null;
	}

	indicator.show(result.index, result.total);
	return result.leaf;
}
