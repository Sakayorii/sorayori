import { useDeferredValue, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  checkPermissions,
  getCurrentPosition,
  requestPermissions,
} from "@tauri-apps/plugin-geolocation";
import {
  ChevronRight,
  Droplets,
  LocateFixed,
  MapPin,
  Navigation,
  RefreshCw,
  Search,
  Settings as SettingsIcon,
  Sunrise,
  Sunset,
  Wind,
  X,
} from "lucide-react";
import { translate, weatherLabel } from "./i18n";
import type { Locale, Place, Settings, WeatherReport } from "./types";
import { WeatherIcon, WeatherScene } from "./weather";

const defaultPlace: Place = {
  id: 0,
  name: "Hà Nội",
  latitude: 21.0285,
  longitude: 105.8542,
  country: "Việt Nam",
};

function systemLocale(): Locale {
  return navigator.language.toLowerCase().startsWith("vi") ? "vi" : "en";
}

function loadSettings(): Settings {
  try {
    const saved = JSON.parse(localStorage.getItem("sorayori.settings") ?? "null") as Partial<Settings> | null;
    return {
      locale: saved?.locale === "vi" || saved?.locale === "en" ? saved.locale : systemLocale(),
      temperatureUnit: saved?.temperatureUnit === "fahrenheit" ? "fahrenheit" : "celsius",
      speedUnit: saved?.speedUnit === "mph" ? "mph" : "kmh",
    };
  } catch {
    return { locale: systemLocale(), temperatureUnit: "celsius", speedUnit: "kmh" };
  }
}

function loadPlace(): Place {
  try {
    return JSON.parse(localStorage.getItem("sorayori.place") ?? "null") ?? defaultPlace;
  } catch {
    return defaultPlace;
  }
}

export default function App() {
  const [settings, setSettings] = useState(loadSettings);
  const [place, setPlace] = useState(loadPlace);
  const [report, setReport] = useState<WeatherReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panel, setPanel] = useState<"search" | "settings" | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [searching, setSearching] = useState(false);
  const deferredQuery = useDeferredValue(query.trim());
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);

  async function loadWeather(nextPlace: Place, quiet = false) {
    if (!quiet) setLoading(true);
    setError("");
    try {
      const data = await invoke<WeatherReport>("fetch_weather", {
        latitude: nextPlace.latitude,
        longitude: nextPlace.longitude,
        locationName: nextPlace.name,
      });
      setReport(data);
      setPlace(nextPlace);
      localStorage.setItem("sorayori.place", JSON.stringify(nextPlace));
    } catch {
      setError(t("networkError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadWeather(place);
  }, []);

  useEffect(() => {
    localStorage.setItem("sorayori.settings", JSON.stringify(settings));
    document.documentElement.lang = settings.locale;
  }, [settings]);

  useEffect(() => {
    if (deferredQuery.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    let active = true;
    const timer = window.setTimeout(async () => {
      setSearching(true);
      try {
        const places = await invoke<Place[]>("search_places", {
          query: deferredQuery,
          language: settings.locale,
        });
        if (active) setResults(places);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setSearching(false);
      }
    }, 350);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [deferredQuery, settings.locale]);

  async function useCurrentLocation() {
    setError("");
    try {
      let permissions = await checkPermissions();
      if (permissions.location !== "granted") {
        permissions = await requestPermissions(["location"]);
      }
      if (permissions.location !== "granted") {
        setError(t("locationDenied"));
        setPanel(null);
        return;
      }
      const position = await getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 12_000,
        maximumAge: 300_000,
      });
      const currentPlace: Place = {
        id: Date.now(),
        name: settings.locale === "vi" ? "Vị trí hiện tại" : "Current location",
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setPanel(null);
      await loadWeather(currentPlace);
    } catch {
      setError(t("locationError"));
      setPanel(null);
    }
  }

  function choosePlace(nextPlace: Place) {
    setPanel(null);
    setQuery("");
    void loadWeather(nextPlace);
  }

  function updateSettings(next: Partial<Settings>) {
    setSettings((current) => ({ ...current, ...next }));
  }

  const isDay = report?.current.isDay ?? true;
  const weatherCode = report?.current.weatherCode ?? 1;

  return (
    <main className={`app-shell ${isDay ? "app-day" : "app-night"}`}>
      <WeatherScene code={weatherCode} isDay={isDay} />
      <header className="topbar">
        <button className="location-button" onClick={() => setPanel("search")}>
          <MapPin size={17} strokeWidth={1.8} />
          <span>{report?.locationName ?? place.name}</span>
          <ChevronRight size={16} />
        </button>
        <button className="icon-button" onClick={() => setPanel("settings")} aria-label={t("settings")}>
          <SettingsIcon size={20} />
        </button>
      </header>

      {loading && !report ? (
        <section className="center-state" aria-live="polite">
          <div className="loading-mark"><i /><i /><i /></div>
          <p>{t("loading")}</p>
        </section>
      ) : error && !report ? (
        <section className="center-state" role="alert">
          <p>{error}</p>
          <button className="text-button" onClick={() => void loadWeather(place)}>
            <RefreshCw size={17} /> {t("retry")}
          </button>
        </section>
      ) : report ? (
        <div className="weather-content">
          <section className="current-block">
            <div className="current-condition">
              <WeatherIcon code={report.current.weatherCode} isDay={report.current.isDay} size={25} />
              <span>{t(weatherLabel(report.current.weatherCode))}</span>
            </div>
            <div className="temperature">{formatTemperature(report.current.temperature, settings.temperatureUnit)}</div>
            <p className="feels-like">
              {t("feelsLike")} {formatTemperature(report.current.apparentTemperature, settings.temperatureUnit)}
            </p>
            <p className="high-low">
              {formatTemperature(report.daily[0]?.temperatureMax ?? report.current.temperature, settings.temperatureUnit)}
              <span />
              {formatTemperature(report.daily[0]?.temperatureMin ?? report.current.temperature, settings.temperatureUnit)}
            </p>
          </section>

          {(error || report.fromCache) && (
            <div className="status-strip" role="status">
              <span>{report.fromCache ? t("cached") : error}</span>
              <button onClick={() => void loadWeather(place, true)} aria-label={t("retry")}><RefreshCw size={15} /></button>
            </div>
          )}

          <section className="forecast-section">
            <h2>{t("hourly")}</h2>
            <div className="hourly-list">
              {nextHours(report).map((hour, index) => (
                <div className="hour-item" key={hour.time}>
                  <time>{index === 0 ? t("now") : hour.time.slice(11, 16)}</time>
                  <WeatherIcon code={hour.weatherCode} isDay={hour.isDay} size={22} />
                  <strong>{formatTemperature(hour.temperature, settings.temperatureUnit)}</strong>
                  <small>{hour.precipitationProbability}%</small>
                </div>
              ))}
            </div>
          </section>

          <section className="metrics-grid">
            <Metric icon={<Droplets />} label={t("humidity")} value={`${report.current.humidity}%`} />
            <Metric icon={<Wind />} label={t("wind")} value={formatSpeed(report.current.windSpeed, settings.speedUnit)} />
            <Metric icon={<CloudRainIcon />} label={t("rain")} value={`${report.daily[0]?.precipitationProbability ?? 0}%`} />
            <Metric icon={<LocateFixed />} label={t("uv")} value={String(Math.round(report.daily[0]?.uvIndexMax ?? 0))} />
          </section>

          <section className="sun-times">
            <div><Sunrise /><span>{t("sunrise")}</span><strong>{report.daily[0]?.sunrise.slice(11, 16)}</strong></div>
            <div><Sunset /><span>{t("sunset")}</span><strong>{report.daily[0]?.sunset.slice(11, 16)}</strong></div>
          </section>

          <section className="daily-section">
            <h2>{t("nextDays")}</h2>
            <div className="daily-list">
              {report.daily.slice(1, 8).map((day) => (
                <div className="day-row" key={day.date}>
                  <time>{weekday(day.date, settings.locale)}</time>
                  <div className="day-rain"><Droplets size={13} />{day.precipitationProbability}%</div>
                  <WeatherIcon code={day.weatherCode} isDay size={22} />
                  <div className="day-temps">
                    <strong>{formatTemperature(day.temperatureMax, settings.temperatureUnit)}</strong>
                    <span>{formatTemperature(day.temperatureMin, settings.temperatureUnit)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer>
            {t("updated")} {formatUpdated(report.fetchedAt, settings.locale)}
          </footer>
        </div>
      ) : null}

      {panel && (
        <div className="sheet-backdrop" onClick={() => setPanel(null)}>
          <section className="bottom-sheet" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
            <div className="sheet-handle" />
            <div className="sheet-title">
              <h2>{panel === "search" ? t("search") : t("settings")}</h2>
              <button className="icon-button dark" onClick={() => setPanel(null)} aria-label={t("close")}><X size={20} /></button>
            </div>
            {panel === "search" ? (
              <SearchPanel
                query={query}
                setQuery={setQuery}
                results={results}
                searching={searching}
                locale={settings.locale}
                onChoose={choosePlace}
                onCurrentLocation={() => void useCurrentLocation()}
              />
            ) : (
              <SettingsPanel settings={settings} update={updateSettings} />
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function SearchPanel({ query, setQuery, results, searching, locale, onChoose, onCurrentLocation }: {
  query: string;
  setQuery: (value: string) => void;
  results: Place[];
  searching: boolean;
  locale: Locale;
  onChoose: (place: Place) => void;
  onCurrentLocation: () => void;
}) {
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
  return (
    <div className="search-panel">
      <label className="search-field">
        <Search size={19} />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} />
        {query && <button onClick={() => setQuery("")} aria-label={t("close")}><X size={17} /></button>}
      </label>
      <button className="current-location-row" onClick={onCurrentLocation}>
        <Navigation size={19} />
        <span>{t("currentLocation")}</span>
        <ChevronRight size={17} />
      </button>
      <div className="search-results" aria-live="polite">
        {searching && <div className="search-message">{t("loading")}</div>}
        {!searching && query.trim().length < 2 && <div className="search-message">{t("searchHint")}</div>}
        {!searching && query.trim().length >= 2 && results.length === 0 && <div className="search-message">{t("noResults")}</div>}
        {!searching && results.map((result) => (
          <button className="place-row" key={result.id} onClick={() => onChoose(result)}>
            <MapPin size={18} />
            <span><strong>{result.name}</strong><small>{[result.admin1, result.country].filter(Boolean).join(", ")}</small></span>
            <ChevronRight size={17} />
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPanel({ settings, update }: { settings: Settings; update: (next: Partial<Settings>) => void }) {
  const t = (key: Parameters<typeof translate>[1]) => translate(settings.locale, key);
  return (
    <div className="settings-panel">
      <div className="setting-row">
        <span>{t("language")}</span>
        <div className="segmented">
          <button className={settings.locale === "vi" ? "active" : ""} onClick={() => update({ locale: "vi" })}>VI</button>
          <button className={settings.locale === "en" ? "active" : ""} onClick={() => update({ locale: "en" })}>EN</button>
        </div>
      </div>
      <div className="setting-row">
        <span>{t("units")}</span>
        <div className="segmented">
          <button className={settings.temperatureUnit === "celsius" ? "active" : ""} onClick={() => update({ temperatureUnit: "celsius", speedUnit: "kmh" })}>°C</button>
          <button className={settings.temperatureUnit === "fahrenheit" ? "active" : ""} onClick={() => update({ temperatureUnit: "fahrenheit", speedUnit: "mph" })}>°F</button>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="metric">{icon}<span>{label}</span><strong>{value}</strong></div>;
}

function CloudRainIcon() {
  return <Droplets />;
}

function formatTemperature(value: number, unit: Settings["temperatureUnit"]): string {
  const temperature = unit === "fahrenheit" ? value * 9 / 5 + 32 : value;
  return `${Math.round(temperature)}°`;
}

function formatSpeed(value: number, unit: Settings["speedUnit"]): string {
  return unit === "mph" ? `${Math.round(value * 0.621371)} mph` : `${Math.round(value)} km/h`;
}

function weekday(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { weekday: "long" })
    .format(new Date(`${date}T12:00:00`));
}

function formatUpdated(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function nextHours(report: WeatherReport) {
  const currentIndex = report.hourly.findIndex((hour) => hour.time >= report.current.time.slice(0, 13));
  return report.hourly.slice(Math.max(0, currentIndex), Math.max(0, currentIndex) + 24);
}
