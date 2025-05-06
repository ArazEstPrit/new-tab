export const debug = new EventTarget();

export function $(selector: string): HTMLElement[] {
	const elements = document.querySelectorAll(selector);

	return Array.from(elements) as HTMLElement[];
}

export function h(
	tag: keyof HTMLElementTagNameMap,
	props: { [key: string]: unknown } = {},
	...children: (HTMLElement | string)[]
) {
	const element = document.createElement(tag);
	Object.assign(element, props);
	element.append(...children);
	return element;
}

export function getFaviconURL(url: string) {
	const baseURL = chrome.runtime.getURL("/_favicon/");
	const faviconURL = new URL(baseURL);
	faviconURL.searchParams.set("pageUrl", url);
	faviconURL.searchParams.set("size", "256");
	return faviconURL.toString();
}

export function formatTime(hours: number, minutes: number) {
	return `${hours}`.padStart(2, "0") + ":" + `${minutes}`.padStart(2, "0");
}

export function setSustainedClick(
	element: HTMLElement,
	fn: () => void,
	coolDown = 0
) {
	element.classList.add("refresh");

	element.addEventListener("click", () => {
		element.classList.add("clicked");
		fn();
	});
	element.addEventListener("mouseleave", () => {
		setTimeout(() => {
			element.classList.remove("clicked");
		}, coolDown);
	});
}

export function drawPoint(id: string, coords: number[]) {
	let point = $("#" + id)[0];

	if (!point) {
		point = h("div", { id: id, className: "point" });
		document.body.appendChild(point);
	}

	point.style.left = coords[0] + "px";
	point.style.top = coords[1] + "px";
}

export function drawLine(coords1: number[], coords2: number[]) {
	let line = $("#line")[0];

	if (!line) {
		line = h("div", { id: "line" });
		document.body.appendChild(line);
	}

	line.style.backgroundColor = "green";
	line.style.left = coords1[0] + "px";
	line.style.top = coords1[1] + "px";

	line.style.height =
		Math.hypot(coords1[0] - coords2[0], coords1[1] - coords2[1]) + "px";

	line.style.rotate =
		Math.PI -
		Math.atan2(coords1[0] - coords2[0], coords1[1] - coords2[1]) +
		"rad";
}

export function removeDebugLines() {
	$(".point").map(e => e.remove());
	$("#line").map(e => e.remove());
}

export function isDebug() {
	return document.body.classList.contains("debug");
}

export function debugDateSlider() {
	const slider = h("input", {
		id: "debug-date",
		className: "debug",
		type: "range",
		min: 0,
		max: 23.99,
		step: 0.01,
		value: new Date().getHours() + new Date().getMinutes() / 60,
		style: "width: 300px",
		oninput: () => {
			document.dispatchEvent(new Event("debugDate"));
			clearInterval(intervalId);
			intervalId = null;
		},
	}) as HTMLInputElement;

	let intervalId = null;

	const loopButton = h(
		"button",
		{
			id: "loop-debug-date",
			className: "debug",
			onclick: () => {
				if (intervalId === null) {
					intervalId = setInterval(() => {
						slider.valueAsNumber =
							(slider.valueAsNumber + 0.05) %
							parseFloat(slider.max);
						document.dispatchEvent(new Event("debugDate"));
					}, 25);
				} else {
					clearInterval(intervalId);
					intervalId = null;
				}
			},
		},
		"loop"
	) as HTMLButtonElement;

	document.body.appendChild(slider);
	document.body.appendChild(loopButton);

	document.addEventListener("debugDateToggle", () => {
		slider.valueAsNumber =
			new Date().getHours() + new Date().getMinutes() / 60;

		clearInterval(intervalId);
		intervalId = null;
	});
}
