/**
 * Position indicator.
 *
 * A row of dots at the lower edge of the navigation bar showing which tab is now
 * active and how many there are. It answers the two questions a swipe leaves
 * open: did that register, and where am I now.
 *
 * One container is created on first use and updated in place afterwards. Fast
 * repeated swipes are the normal case here, so creating a fresh element per
 * switch would stack leftovers and make cleanup easy to get wrong.
 */

/** How long the dots stay on screen before fading out. */
export const INDICATOR_VISIBLE_MS = 300;

export const HOST_CLASS = 'tab-swipe-host';
export const CONTAINER_CLASS = 'tab-swipe-indicator';
export const DOT_CLASS = 'tab-swipe-indicator__dot';
export const CURRENT_DOT_CLASS = 'is-current';
export const HIDDEN_CLASS = 'is-hidden';

export class TabPositionIndicator {
	private container: HTMLElement | null = null;
	private fadeTimer: ReturnType<typeof setTimeout> | null = null;

	/**
	 * @param host The navigation bar. The indicator positions itself against it,
	 * so the host gets a plugin-owned class that makes it a positioning context.
	 */
	constructor(private readonly host: HTMLElement) {}

	/** Renders the dot row for a completed switch and schedules its fade-out. */
	show(currentIndex: number, total: number): void {
		if (total < 1) {
			return;
		}

		const container = this.container ?? this.createContainer();
		container.replaceChildren();

		for (let position = 0; position < total; position += 1) {
			const dot = container.ownerDocument.createElement('span');
			dot.className = DOT_CLASS;
			if (position === currentIndex) {
				dot.classList.add(CURRENT_DOT_CLASS);
			}
			container.appendChild(dot);
		}

		container.classList.remove(HIDDEN_CLASS);
		this.scheduleFadeOut(container);
	}

	/** Removes the container and cancels any pending fade-out. */
	destroy(): void {
		this.clearFadeTimer();
		this.container?.remove();
		this.container = null;
		this.host.classList.remove(HOST_CLASS);
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

	private scheduleFadeOut(container: HTMLElement): void {
		this.clearFadeTimer();
		this.fadeTimer = setTimeout(() => {
			container.classList.add(HIDDEN_CLASS);
			this.fadeTimer = null;
		}, INDICATOR_VISIBLE_MS);
	}

	private clearFadeTimer(): void {
		if (this.fadeTimer !== null) {
			clearTimeout(this.fadeTimer);
			this.fadeTimer = null;
		}
	}

	/** Exposed for tests: whether a fade-out is still pending. */
	hasPendingFade(): boolean {
		return this.fadeTimer !== null;
	}
}
