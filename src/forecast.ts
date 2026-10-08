import type { HourlyWeather, Locale, WeatherReport } from "./types";
import { nextHours } from "./format";

export function forecastEvents(report: WeatherReport, locale: Locale) {
  const hours = nextHours(report).slice(0, 12);
  const vi = locale === "vi";
  const events: { time: string; label: string; kind: "rain" | "temperature" | "daylight" }[] = [];
  const rain = hours.find((hour) => hour.precipitationProbability >= 50);
  if (rain) events.push({ time: rain.time, label: vi ? `Khả năng mưa ${rain.precipitationProbability}%` : `${rain.precipitationProbability}% chance of precipitation`, kind: "rain" });
  const first = hours[0];
  const change = first && hours.find((hour) => Math.abs(hour.temperature - first.temperature) >= 2);
  if (change) events.push({ time: change.time, label: change.temperature < first.temperature
    ? vi ? "Nhiệt độ bắt đầu giảm" : "Temperatures turn cooler"
    : vi ? "Nhiệt độ bắt đầu tăng" : "Temperatures turn warmer", kind: "temperature" });
  for (let i = 1; i < hours.length; i++) {
    if (hours[i].isDay !== hours[i - 1].isDay) {
      events.push({ time: hours[i].time, label: hours[i].isDay ? vi ? "Bước sang ban ngày" : "Daylight begins" : vi ? "Bước sang buổi tối" : "Evening begins", kind: "daylight" });
      break;
    }
  }
  return events.sort((a, b) => a.time.localeCompare(b.time)).slice(0, 3);
}

export function forecastInsight(hours: HourlyWeather[], locale: Locale) {
  const vi = locale === "vi";
  if (!hours.length) return vi ? "Chưa có dự báo theo giờ cho địa điểm này." : "Hourly forecast is unavailable for this location.";
  const window = hours.slice(0, 8);
  const rain = window.find((hour) => hour.precipitationProbability >= 50);
  if (rain) return vi
    ? `Khả năng có mưa hoặc tuyết đạt ${rain.precipitationProbability}% vào ${rain.time.slice(11, 16)}.`
    : `Precipitation chance reaches ${rain.precipitationProbability}% at ${rain.time.slice(11, 16)}.`;
  const change = window[window.length - 1].temperature - window[0].temperature;
  if (Math.abs(change) >= 2) return change < 0
    ? vi ? "Nhiệt độ có xu hướng giảm trong các giờ dự báo tiếp theo." : "Temperatures trend cooler over the upcoming forecast hours."
    : vi ? "Nhiệt độ có xu hướng tăng trong các giờ dự báo tiếp theo." : "Temperatures trend warmer over the upcoming forecast hours.";
  return vi ? "Nhiệt độ ít thay đổi; khả năng mưa hoặc tuyết dưới 50% trong các giờ tới." : "Little temperature change; precipitation chance stays below 50% in the upcoming hours.";
}
