import { $, h } from "../utils.js";
import { Widget } from "./GenericWidget.js";

export default new Widget(
	$("#widgets")[0],
	h(
		"div",
		{ className: "container small", id: "countdown" },
		h("p", { id: "date-text" }, "")
	),
	updateDate,
	1000
);

const FINAL_DATE = new Date("2025-05-21T14:15");

function updateDate() {
	$("#countdown")[0].innerHTML = formatDuration(
		FINAL_DATE.getTime() - Date.now()
	);
}

const units = [1000, 60, 60];

const formatDuration = (ms: number): string =>
	units
		.reduce((acc, curr, i) => [...acc, Math.round(acc[i] / curr)], [ms])
		.slice(1)
		.map((a, i) => (units[i + 1] ? a % units[i + 1] : a))
		.reverse()
		.join(":");
