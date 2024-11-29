import { $, h } from "../utils.js";
import { Widget } from "./GenericWidget.js";

export default new Widget(
	$("#widgets")[0],
	h(
		"div",
		{ className: "container small", id: "date" },
		h("p", { id: "date-text" }, "")
	),
	updateDate,
	1000
);

function updateDate() {
	const date = new Date();
	$("#date")[0].innerHTML = date.toLocaleDateString("en-US", {
		weekday: "short",
		month: "short",
		day: "2-digit",
		year: "numeric",
	});
}
