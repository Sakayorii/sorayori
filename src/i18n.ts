import type { Locale } from "./types";

const translations = {
  vi: {
    feelsLike: "Cảm giác như",
    hourly: "Từng giờ",
    nextDays: "7 ngày tới",
    humidity: "Độ ẩm",
    wind: "Gió",
    rain: "Khả năng mưa",
    uv: "Chỉ số UV",
    sunrise: "Bình minh",
    sunset: "Hoàng hôn",
    search: "Tìm thành phố",
    currentLocation: "Dùng vị trí hiện tại",
    settings: "Cài đặt",
    language: "Ngôn ngữ",
    units: "Đơn vị",
    close: "Đóng",
    retry: "Thử lại",
    loading: "Đang đọc bầu trời",
    noResults: "Không tìm thấy địa điểm",
    searchHint: "Nhập ít nhất 2 ký tự",
    locationDenied: "Không thể truy cập vị trí. Bạn vẫn có thể tìm thành phố.",
    locationError: "Không xác định được vị trí hiện tại.",
    networkError: "Không thể tải dữ liệu thời tiết.",
    cached: "Dữ liệu ngoại tuyến",
    updated: "Cập nhật",
    today: "Hôm nay",
    now: "Bây giờ",
    clear: "Trời quang",
    partlyCloudy: "Mây rải rác",
    cloudy: "Nhiều mây",
    fog: "Sương mù",
    drizzle: "Mưa phùn",
    rainWeather: "Có mưa",
    snow: "Có tuyết",
    showers: "Mưa rào",
    storm: "Giông",
  },
  en: {
    feelsLike: "Feels like",
    hourly: "Hourly",
    nextDays: "Next 7 days",
    humidity: "Humidity",
    wind: "Wind",
    rain: "Chance of rain",
    uv: "UV index",
    sunrise: "Sunrise",
    sunset: "Sunset",
    search: "Search cities",
    currentLocation: "Use current location",
    settings: "Settings",
    language: "Language",
    units: "Units",
    close: "Close",
    retry: "Try again",
    loading: "Reading the sky",
    noResults: "No places found",
    searchHint: "Enter at least 2 characters",
    locationDenied: "Location access is unavailable. You can still search for a city.",
    locationError: "Could not determine your current location.",
    networkError: "Could not load weather data.",
    cached: "Offline data",
    updated: "Updated",
    today: "Today",
    now: "Now",
    clear: "Clear",
    partlyCloudy: "Partly cloudy",
    cloudy: "Cloudy",
    fog: "Foggy",
    drizzle: "Drizzle",
    rainWeather: "Rain",
    snow: "Snow",
    showers: "Showers",
    storm: "Thunderstorm",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["vi"];

export function translate(locale: Locale, key: TranslationKey): string {
  return translations[locale][key];
}

export function weatherLabel(code: number): TranslationKey {
  if (code === 0) return "clear";
  if (code <= 2) return "partlyCloudy";
  if (code === 3) return "cloudy";
  if (code <= 48) return "fog";
  if (code <= 57) return "drizzle";
  if (code <= 67) return "rainWeather";
  if (code <= 77) return "snow";
  if (code <= 86) return "showers";
  return "storm";
}
