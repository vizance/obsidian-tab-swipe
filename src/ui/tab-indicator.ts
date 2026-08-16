/**
 * Position indicator.
 *
 * A row of dots at the lower edge of the navigation bar showing which tab is
 * active and how many there are. It stays on screen, so the answer to "where am
 * I" is available at a glance rather than only in the moment after a swipe.
 *
 * The indicator holds no state of its own beyond the DOM it owns. Everything it
 * shows is passed in, recomputed from the workspace by the caller. That is what
 * keeps it honest when tabs change through routes this plugin knows nothing
 * about.
 */

export const HOST_CLASS = 'tab-swipe-host';
export const CONTAINER_CLASS = 'tab-swipe-indicator';
export const DOT_CLASS = 'tab-swipe-indicator__dot';
export const CURRENT_DOT_CLASS = 'is-current';

/** Below this many tabs a row of dots carries no information, so it is hidden. */
export const MINIMUM_TABS_FOR_INDICATOR = 2;

export class TabPositionIndicator {
	private container: HTMLElement | null = null;

	/**
	 * @param host The navigation bar. The indicator positions itself against it,
	 * so the host gets a plugin-owned class that makes it a positioning context.
	 */
	constructor(private readonly host: HTMLElement) {}

	/**
	 * Draw the dot row for the given tab state.
	 *
	 * An index of -1 means focus is somewhere that is not a main-area tab, such
	 * as a sidebar. In that case the previous contents are kept: blanking the row
	 * or highlighting an arbitrary dot would both be worse than showing the last
	 * thing that was true.
	 */
	render(currentIndex: number, total: number): void {
		if (total < MINIMUM_TABS_FOR_INDICATOR) {
			this.clearDots();
			return;
		}

		if (currentIndex < 0) {
			return;
		}

		const container = this.container ?? this.createContainer();
		const dots: HTMLElement[] = [];

		for (let position = 0; position < total; position += 1) {
			const dot = container.ownerDocument.createElement('span');
			dot.className = DOT_CLASS;
			if (position === currentIndex) {
				dot.classList.add(CURRENT_DOT_CLASS);
			}
			dots.push(dot);
		}

		container.replaceChildren(...dots);
	}

	/** Removes the container and the classes this plugin put on the host. */
	destroy(): void {
		this.container?.remove();
		this.container = null;
		this.host.classList.remove(HOST_CLASS);
	}

	private clearDots(): void {
		this.container?.replaceChildren();
	}

	private createContainer(): HTMLElement {
		const container = this.host.ownerDocument.createElement('div');
		container.className = CONTAINER_CLASS;
		// Keeps taps falling through to the navigation bar buttons underneath.
		container.setAttribute('aria-hidden', 'true');

		this.host.classList.add(HOST_CLASS);
		this.host.appendChild(container);
		this.container = container;
		return container;
	}
}
