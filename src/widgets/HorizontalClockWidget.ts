import { $, h } from "../utils.js";
import { Widget } from "./GenericWidget.js";

export default new Widget(
	document.body,
	h(
		"div",
		{ className: "container small", id: "clock-container" },
		...renderClock()
	),
	updateClock,
	1000 * 60
);

function updateClock() {
	const date = new Date();

	const debugSlider = $("#debug-date")[0] as HTMLInputElement;

	if (document.body.classList.contains("debug")) {
		date.setHours(
			Math.floor(debugSlider.valueAsNumber),
			(debugSlider.valueAsNumber % 1) * 60
		);
	}

	const percentage = (date.getHours() * 60 + date.getMinutes()) / (24 * 60);

	$("#hand")[0].style.setProperty("--p", percentage.toFixed(3));
}

function renderClock() {
	const multipleToWeight = {
		6: "w3",
		3: "w2",
		1: "w1",
	};

	const barContainer = h("div", {
		className: "bar-container",
		id: "bar-container",
	});

	const hourContainer = h("div", {
		className: "bar-container",
		id: "hour-container",
	});

	for (let hour = 0; hour <= 24; hour++) {
		const barClass = determineBarClass(hour);

		const bar = h("div", {
			className: `bar ${barClass}`,
			id: `bar-${hour}`,
		});

		barContainer.appendChild(bar);

		const barCopy = bar.cloneNode(true) as HTMLDivElement;

		document.body.appendChild(barCopy);

		const hourElement = h(
			"div",
			{
				className: "hour",
				id: `hour-${hour}`,
				style: `width: ${barCopy.getBoundingClientRect().width}px;`,
			},
			`${hour != 24 ? hour : 0}`.padStart(2, "0") + ":00"
		);

		barCopy.remove();

		hourContainer.appendChild(hourElement);
	}

	function determineBarClass(hour: number) {
		const multiples = Object.keys(multipleToWeight).map(key =>
			parseInt(key)
		);

		return multipleToWeight[
			Math.max(...multiples.filter(key => hour % key === 0))
		];
	}

	const handContainer = h(
		"div",
		{
			className: "bar-container",
			id: "hand-container",
		},
		h("div", { className: "hand", id: "hand" })
	);

	window.addEventListener("resize", updateClock);
	window.addEventListener("dblclick", updateClock);

	document.addEventListener("debugDateToggle", () => {
		updateClock();
	});
	document.addEventListener("debugDate", () => {
		updateClock();
	});

	return [barContainer, hourContainer, handContainer];
}
