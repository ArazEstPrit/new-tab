import { $, formatTime, h } from "../utils.js";
import { Widget } from "./GenericWidget.js";

export default new Widget(
	$("#widgets")[0],
	h(
		"div",
		{ className: "container big", id: "time" },
		h("p", { id: "time-text" }, "")
	),
	updateTime,
	1000
);

function updateTime() {
	const date = new Date();
	const debugSlider = $("#debug-date")[0] as HTMLInputElement;

	if (document.body.classList.contains("debug")) {
		date.setHours(
			Math.floor(debugSlider.valueAsNumber),
			(debugSlider.valueAsNumber % 1) * 60
		);
	}

	$("#time-text")[0].innerHTML = formatTime(
		date.getHours(),
		date.getMinutes()
	);
}

document.addEventListener("debugDateToggle", () => {
	updateTime();
});

document.addEventListener("debugDate", () => {
	updateTime();
});