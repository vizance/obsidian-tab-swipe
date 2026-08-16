import { Platform, Plugin, type WorkspaceLeaf } from 'obsidian';

import { type SwipeTracker } from './gesture/navbar-swipe';
import { bindIndicatorSync } from './plugin/indicator-sync';
import { bindNavbarSwipe, readTouchSample } from './plugin/navbar-binding';
import { cycleTab, type TabWorkspace } from './tabs/tab-cycler';
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
			const workspace: TabWorkspace<WorkspaceLeaf> = this.app.workspace;

			this.tracker = bindNavbarSwipe<HTMLElement>({
				isMobile: Platform.isMobile,
				navbar,
				registerDomEvent: (element, type, handler) => {
					// Ties every listener to the plugin lifecycle, so unload removes
					// all of them without manual bookkeeping.
					this.registerDomEvent(element, type, handler);
				},
				onSwipe: (direction) => {
					// Switching is all a swipe does. The indicator redraws from the
					// workspace event this causes, exactly as it would for a tab
					// change made any other way.
					cycleTab(workspace, direction);
				},
				readSample: readTouchSample,
			});

			if (!Platform.isMobile || navbar === null) {
				return;
			}

			const indicator = new TabPositionIndicator(navbar);
			this.indicator = indicator;

			bindIndicatorSync({
				workspace,
				indicator,
				subscribe: (event, handler) => {
					// Obsidian types each event name as its own overload, so the
					// union has to be narrowed before the call.
					const ref =
						event === 'active-leaf-change'
							? this.app.workspace.on('active-leaf-change', handler)
							: this.app.workspace.on('layout-change', handler);
					this.registerEvent(ref);
				},
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
