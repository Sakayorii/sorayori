import type { Locale, Settings, WeatherReport } from "./types";

export function formatTemperature(value: number, unit: Settings["temperatureUnit"]): string {
  const temperature = unit === "fahrenheit" ? value * 9 / 5 + 32 : value;
  return `${Math.round(temperature)}°`;
}

export function formatSpeed(value: number, unit: Settings["speedUnit"]): string {
  return unit === "mph" ? `${Math.round(value * 0.621371)} mph` : `${Math.round(value)} km/h`;
}

export function weekday(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { weekday: "long" })
    .format(new Date(`${date}T12:00:00`));
}

export function formatUpdated(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function nextHours(report: WeatherReport) {
  const currentIndex = report.hourly.findIndex((hour) => hour.time >= report.current.time.slice(0, 13));
  return report.hourly.slice(Math.max(0, currentIndex), Math.max(0, currentIndex) + 24);
}
