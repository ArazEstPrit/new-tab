import { setSustainedClick } from "../utils.js";

export class Widget {
	constructor(
		public parent: HTMLElement,
		public element: HTMLElement,
		public update?: () => void,
		public updateTime?: number,
		public manualRefresh?: boolean
	) {}

	init() {
		this.parent.appendChild(this.element);

		if (!this.update) {
			return;
		}

		this.update();

		if (this.manualRefresh) {
			setSustainedClick(this.element, this.update);
			return;
		}

		if (this.updateTime > 0) {
			setInterval(() => {
				this.update();
			}, this.updateTime);
		}
	}
}
