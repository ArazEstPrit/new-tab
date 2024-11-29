import { $, h, isDebug } from "../utils.js";
import { Widget } from "./GenericWidget.js";

interface WeatherInfo {
	temperature: number;
	is_day: number;
	weathercode: number;
}

export default new Widget(
	$("#widgets")[0],
	h(
		"div",
		{ className: "container small", id: "weather" },
		h("span", { id: "weather-icon" }, ""),
		h("p", { id: "weather-text" }, "")
	),
	updateWeather,
	undefined,
	true
);

async function updateWeather() {
	const weatherText = $("#weather-text")[0];
	const WeatherIcon = $("#weather-icon")[0];

	weatherText.textContent = "Loading...";
	WeatherIcon.textContent = "";

	const weather = isDebug() ? await getRandomWeather() : await getWeather();

	WeatherIcon.textContent = parseWeatherCode(
		weather.weathercode,
		weather.is_day
	)[0];

	weatherText.textContent = [
		parseWeatherCode(weather.weathercode, weather.is_day)[1],
		Math.round(weather.temperature) + "°C",
	].join(", ");
}

async function getWeather(): Promise<WeatherInfo> {
	const [latitude, longitude] = await getLocation();
	const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

	return new Promise(resolve => {
		fetch(url)
			.then(response => response.json())
			.then(data => {
				resolve(data.current_weather);
			});
	});
}

async function getRandomWeather() {
	const weatherCodes = Array.from(weatherInfo.keys());

	return new Promise<WeatherInfo>(resolve => {
		setTimeout(
			() => {
				resolve({
					temperature: Math.random() * 30 + 5,
					weathercode:
						weatherCodes[
							Math.floor(weatherCodes.length * Math.random())
						],
					is_day: Math.random() > 0.5 ? 1 : 0,
				});
			},
			Math.random() * 150 + 50
		);
	});
}

function getLocation() {
	return new Promise<number[]>(resolve => {
		navigator.geolocation.getCurrentPosition(position => {
			const latitude = position.coords.latitude;
			const longitude = position.coords.longitude;
			resolve([latitude, longitude]);
		});
	});
}

function parseWeatherCode(code: number, isDay: number): [string, string] {
	const info = weatherInfo.get(code);

	let emoji = info.icon;

	if (emoji instanceof Array) {
		emoji = emoji[isDay];
	}

	return [emoji, info.text];
}

const weatherInfo = new Map<
	number,
	{ text: string; icon: [string, string] | string }
>([
	[0, { text: "Clear", icon: ["🌙", "☀️"] }],
	[1, { text: "Clear", icon: ["🌙", "☀️"] }],
	[2, { text: "Partly cloudy", icon: ["☁️", "⛅️"] }],
	[3, { text: "Overcast", icon: "☁️" }],
	[45, { text: "Fog", icon: "🌫️" }],
	[48, { text: "Depositing rime fog", icon: "🌫️" }],
	[51, { text: "Light drizzle", icon: "☔️" }],
	[53, { text: "Drizzle", icon: "☔️" }],
	[55, { text: "Heavy drizzle", icon: "☔️" }],
	[56, { text: "Freezing drizzle", icon: "☔️" }],
	[57, { text: "Freezing drizzle", icon: "☔️" }],
	[61, { text: "Light rain", icon: "💧" }],
	[63, { text: "Rain", icon: "💧" }],
	[65, { text: "Heavy rain", icon: "💧" }],
	[66, { text: "Freezing rain", icon: "❄️" }],
	[67, { text: "Freezing rain", icon: "❄️" }],
	[71, { text: "Light snow fall", icon: "❄️" }],
	[73, { text: "Snow fall", icon: "❄️" }],
	[75, { text: "Heavy snow fall", icon: "❄️" }],
	[77, { text: "Snow grains", icon: "❄️" }],
	[80, { text: "Light rain showers", icon: "💧" }],
	[81, { text: "Rain showers", icon: "💧" }],
	[82, { text: "Heavy rain showers", icon: "💧" }],
	[85, { text: "Snow showers", icon: "❄️" }],
	[86, { text: "Snow showers", icon: "❄️" }],
	[95, { text: "Thunderstorm", icon: "🌩️" }],
	[96, { text: "Thunderstorm", icon: "🌩️" }],
	[99, { text: "Thunderstorm", icon: "🌩️" }],
]);
