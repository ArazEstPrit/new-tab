import { $, h } from "../utils.js";
import { Widget } from "./GenericWidget.js";

export default new Widget(
	$("#widgets")[0],
	h(
		"div",
		{ className: "container small", id: "second" },
		h("div", { id: "second-point" }),
		h("div", { id: "second-bar" })
	),
	updateSecondPoint,
	100
);

function updateSecondPoint() {
	const date = new Date();

	$("#second-point")[0].style.setProperty(
		"--seconds",
		(date.getSeconds() + date.getMilliseconds() / 1000).toString()
	);
}
