import { $, debugDateSlider } from "./utils.js";
import BookmarkWidget from "./widgets/BookmarkWidget.js";
import CountdownWidget from "./widgets/CountdownWidget.js";
import DateWidget from "./widgets/DateWidget.js";
import HorizontalClockWidget from "./widgets/HorizontalClockWidget.js";
import SecondWidget from "./widgets/SecondWidget.js";
import TimeWidget from "./widgets/TimeWidget.js";
import WeatherWidget from "./widgets/WeatherWidget.js";

BookmarkWidget.init();
TimeWidget.init();
DateWidget.init();
SecondWidget.init();
WeatherWidget.init();
HorizontalClockWidget.init();
CountdownWidget.init();

debugDateSlider();

$(".debug-circle")[0].addEventListener("dblclick", () => {
	document.body.classList.toggle("debug");
	document.dispatchEvent(new Event("debugDateToggle"));
});
