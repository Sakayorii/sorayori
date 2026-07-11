export type Locale = "vi" | "en";
export type TemperatureUnit = "celsius" | "fahrenheit";
export type SpeedUnit = "kmh" | "mph";

export interface Place {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  weatherCode: number;
  cloudCover: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  precipitationProbability: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyWeather {
  date: string;
  weatherCode: number;
  temperatureMax: number;
  temperatureMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationProbability: number;
}

export interface WeatherReport {
  latitude: number;
  longitude: number;
  locationName: string;
  timezone: string;
  fetchedAt: string;
  fromCache: boolean;
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
}

export interface Settings {
  locale: Locale;
  temperatureUnit: TemperatureUnit;
  speedUnit: SpeedUnit;
}
