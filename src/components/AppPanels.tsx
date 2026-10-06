import { ChevronRight, Languages, MapPin, Navigation, Search, Thermometer, X } from "lucide-react";
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
        <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("search")} aria-label={t("search")} autoComplete="off" enterKeyHint="search" spellCheck={false} />
        {query && <button type="button" onClick={() => setQuery("")} aria-label={t("close")}><X size={17} /></button>}
      </label>
      <button type="button" className="current-location-row" onClick={onCurrentLocation}>
        <Navigation size={19} />
        <span>{t("currentLocation")}</span>
        <ChevronRight size={17} />
      </button>
      <div className="search-results" aria-live="polite" aria-busy={searching}>
        {searching && <div className="search-message">{t("loading")}</div>}
        {!searching && query.trim().length < 2 && <div className="search-message">{t("searchHint")}</div>}
        {!searching && query.trim().length >= 2 && results.length === 0 && <div className="search-message">{t("noResults")}</div>}
        {!searching && results.map((result) => (
          <button type="button" className="place-row" key={result.id} onClick={() => onChoose(result)}>
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
      <p className="settings-intro">{t("settingsIntro")}</p>
      <section className="setting-row" aria-labelledby="language-setting">
        <div className="setting-copy">
          <span className="setting-icon" aria-hidden="true"><Languages size={19} /></span>
          <span>
            <strong id="language-setting">{t("language")}</strong>
            <small>{t("languageDescription")}</small>
          </span>
        </div>
        <div className="segmented" data-index={settings.locale === "vi" ? 0 : 1} role="group" aria-labelledby="language-setting">
          <span className="segment-thumb" aria-hidden="true" />
          <button type="button" aria-pressed={settings.locale === "vi"} onClick={() => update({ locale: "vi" })}>VI</button>
          <button type="button" aria-pressed={settings.locale === "en"} onClick={() => update({ locale: "en" })}>EN</button>
        </div>
      </section>
      <section className="setting-row" aria-labelledby="units-setting">
        <div className="setting-copy">
          <span className="setting-icon" aria-hidden="true"><Thermometer size={19} /></span>
          <span>
            <strong id="units-setting">{t("units")}</strong>
            <small>{t("unitsDescription")}</small>
          </span>
        </div>
        <div className="segmented" data-index={settings.temperatureUnit === "celsius" ? 0 : 1} role="group" aria-labelledby="units-setting">
          <span className="segment-thumb" aria-hidden="true" />
          <button type="button" aria-pressed={settings.temperatureUnit === "celsius"} onClick={() => update({ temperatureUnit: "celsius", speedUnit: "kmh" })}>°C</button>
          <button type="button" aria-pressed={settings.temperatureUnit === "fahrenheit"} onClick={() => update({ temperatureUnit: "fahrenheit", speedUnit: "mph" })}>°F</button>
        </div>
      </section>
      <p className="settings-footnote">{t("settingsApplied")}</p>
    </div>
  );
}
