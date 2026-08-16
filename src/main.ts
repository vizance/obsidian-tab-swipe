import { Platform, Plugin, type WorkspaceLeaf } from 'obsidian';

import { type SwipeTracker } from './gesture/navbar-swipe';
import { bindNavbarSwipe, readTouchSample } from './plugin/navbar-binding';
import { handleSwipe } from './plugin/swipe-handler';
import { type TabWorkspace } from './tabs/tab-cycler';
import { TabPositionIndicator } from './ui/tab-indicator';

/**
 * Obsidian's own mobile navigation bar. This is internal DOM, not a documented
 * API, so it is kept in one place and treated as something that can disappear.
 */
const MOBILE_NAVBAR_SELECTOR = '.mobile-navbar';

export default class TabSwipePlugin extends Plugin {
	private tracker: SwipeTracker | null = null;
	private indicator: TabPositionIndicator | null = null;

	onload(): void {
		this.app.workspace.onLayoutReady(() => {
			const found = document.querySelector(MOBILE_NAVBAR_SELECTOR);
			const navbar = found instanceof HTMLElement ? found : null;

			if (Platform.isMobile && navbar !== null) {
				this.indicator = new TabPositionIndicator(navbar);
			}

			this.tracker = bindNavbarSwipe<HTMLElement>({
				isMobile: Platform.isMobile,
				navbar,
				registerDomEvent: (element, type, handler) => {
					// Ties every listener to the plugin lifecycle, so unload removes
					// all of them without manual bookkeeping.
					this.registerDomEvent(element, type, handler);
				},
				onSwipe: (direction) => {
					const indicator = this.indicator;
					if (indicator === null) {
						return;
					}

					const workspace: TabWorkspace<WorkspaceLeaf> = this.app.workspace;
					handleSwipe(workspace, direction, indicator);
				},
				readSample: readTouchSample,
			});
		});
	}

	onunload(): void {
		this.tracker?.cancel();
		this.tracker = null;
		this.indicator?.destroy();
		this.indicator = null;
	}
}
