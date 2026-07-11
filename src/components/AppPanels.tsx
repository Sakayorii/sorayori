import { ChevronRight, MapPin, Navigation, Search, X } from "lucide-react";
import { translate } from "../i18n";
import type { Locale, Place, Settings } from "../types";

export function SearchPanel({ query, setQuery, results, searching, locale, onChoose, onCurrentLocation }: {
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

export function SettingsPanel({ settings, update }: { settings: Settings; update: (next: Partial<Settings>) => void }) {
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
