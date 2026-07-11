import { useDeferredValue, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
  checkPermissions,
  getCurrentPosition,
  requestPermissions,
} from "@tauri-apps/plugin-geolocation";
import {
  ChevronRight,
  MapPin,
  RefreshCw,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { SearchPanel, SettingsPanel } from "./components/AppPanels";
import { WeatherDashboard } from "./components/WeatherDashboard";
import { translate } from "./i18n";
import type { Locale, Place, Settings, WeatherReport } from "./types";
import { WeatherScene } from "./weather";

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
        <WeatherDashboard
          report={report}
          settings={settings}
          error={error}
          onRefresh={() => void loadWeather(place, true)}
        />
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
