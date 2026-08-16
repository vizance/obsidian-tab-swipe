import { Platform, Plugin, type WorkspaceLeaf } from 'obsidian';

import { type SwipeTracker } from './gesture/navbar-swipe';
import { bindNavbarSwipe, readTouchSample } from './plugin/navbar-binding';
import { cycleTab, type TabWorkspace } from './tabs/tab-cycler';

/**
 * Obsidian's own mobile navigation bar. This is internal DOM, not a documented
 * API, so it is kept in one place and treated as something that can disappear.
 */
const MOBILE_NAVBAR_SELECTOR = '.mobile-navbar';

export default class TabSwipePlugin extends Plugin {
	private tracker: SwipeTracker | null = null;

	onload(): void {
		this.app.workspace.onLayoutReady(() => {
			const navbar = document.querySelector(MOBILE_NAVBAR_SELECTOR);

			this.tracker = bindNavbarSwipe<HTMLElement>({
				isMobile: Platform.isMobile,
				navbar: navbar instanceof HTMLElement ? navbar : null,
				registerDomEvent: (element, type, handler) => {
					// Ties every listener to the plugin lifecycle, so unload removes
					// all of them without manual bookkeeping.
					this.registerDomEvent(element, type, handler);
				},
				onSwipe: (direction) => {
					const workspace: TabWorkspace<WorkspaceLeaf> = this.app.workspace;
					cycleTab(workspace, direction);
				},
				readSample: readTouchSample,
			});
		});
	}

	onunload(): void {
		this.tracker?.cancel();
		this.tracker = null;
	}
}
