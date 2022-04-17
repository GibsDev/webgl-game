type FPSWindow = {
	begin: number;
	frames: number;
}

export default class FPS {

	/**
	 * FPS recording window frame size in ms
	 */
	private windowSize: number;

	/**
	 * How frequently the FPS counter creates a new window
	 */
	private updateInterval: number;

	/**
	 * All of frame windows being recorded
	 */
	private windows: Array<FPSWindow>;

	/**
	 * Current FPS value
	 */
	value: number = 0;

	constructor(windowSize: number = 1000, updateInterval: number = 100) {
		this.windowSize = windowSize;
		this.updateInterval = updateInterval;
		this.windows = [];
	}

	update() {
		const time = Date.now();

		// No windows or the last window is old enough
		if (this.windows.length == 0
			|| time - this.windows[this.windows.length - 1].begin >= this.updateInterval) {
			// Start new window
			this.windows.push({
				begin: Date.now(),
				frames: 1
			});
		}

		for (let i = 0; i < this.windows.length; i++) {
			const window = this.windows[i];
			
			const delta = time - window.begin;
			window.frames++;
			if (delta > this.windowSize) {
				this.value = Math.floor(window.frames / this.windowSize * 1000);
				this.windows.splice(i, 1);
			}
		}
	}
}